// src/hooks/usePillAlarms.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const ALARM_KEY = 'PILL_ALARMS_V1';
const CHANNEL_ID = 'pill-alarm';

/** ✅ 포그라운드에서도 알림 표시 + 사운드 */
function setForegroundHandlerOnce() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** ✅ Android 채널 생성 */
async function ensureAndroidChannel({ soundOn, vibrationOn }) {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: '복약 알람',
    importance: Notifications.AndroidImportance.MAX,
    sound: soundOn ? 'default' : undefined,
    vibrationPattern: vibrationOn ? [0, 500, 250, 500] : undefined,
    enableVibrate: !!vibrationOn,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
  });
}

/** ✅ 권한 확보 */
async function ensurePermission() {
  const perm = await Notifications.getPermissionsAsync();
  let status = perm.status;

  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  return status;
}

/** ✅ "즉시 울림" 방지: time 파싱 강제 검증 */
function parseTimeOrThrow(time) {
  const t = String(time ?? '08:00').trim();
  const parts = t.split(':');
  if (parts.length < 2) throw new Error(`time format invalid: ${t}`);

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    throw new Error(`time parse failed: ${t} -> hour=${hour}, minute=${minute}`);
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`time range invalid: ${t}`);
  }
  return { hour, minute };
}

/** ✅ 실제 스케줄링 (daily 반복) */
async function scheduleDailyNotification({ pillName, time, soundOn, vibrationOn }) {
  const { hour, minute } = parseTimeOrThrow(time);

  // 순서 중요: Android 채널 -> 권한
  await ensureAndroidChannel({ soundOn, vibrationOn });
  const status = await ensurePermission();
  if (status !== 'granted') {
    throw new Error('notification permission not granted');
  }

  // Expo에서 가장 안전한 형태: repeats + hour/minute
  const trigger =
    Platform.OS === 'android'
      ? { hour, minute, repeats: true, channelId: CHANNEL_ID }
      : { hour, minute, repeats: true };

  // 디버깅 필요하면 켜기
  // console.log('🔔 schedule trigger:', trigger);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '💊 복약 알림',
      body: `${pillName ?? '복약'} 복용할 시간이에요`,
      sound: soundOn ? 'default' : undefined,
    },
    trigger,
  });
}

async function cancelNotification(id) {
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id);
}

export default function usePillAlarms() {
  const [ready, setReady] = useState(false);

  // alarms: [{ id, pillName, time, enabled, notificationId }]
  const [alarms, setAlarms] = useState([]);

  // 옵션
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  /** 0) 앱 시작 초기화 */
  useEffect(() => {
    (async () => {
      try {
        setForegroundHandlerOnce();

        // Android 13 이슈 방지: 채널을 먼저 만들어 둠
        await ensureAndroidChannel({ soundOn: true, vibrationOn: true });

        // 권한 상태만 확보(원하면 여기서 요청)
        await ensurePermission();

        const raw = await AsyncStorage.getItem(ALARM_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setAlarms(Array.isArray(parsed) ? parsed : []);
        } else {
          setAlarms([]);
        }
      } catch (e) {
        console.warn('🔔 init 실패:', e?.message ?? e);
        setAlarms([]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setAlarms(next);
    await AsyncStorage.setItem(ALARM_KEY, JSON.stringify(next));
  }, []);

  /** ✅ 알람 없으면 기본 08:00 생성 */
  const ensureAlarmForPill = useCallback(
    async (pillName) => {
      const exists = alarms.find((a) => a.pillName === pillName);
      if (exists) return;

      const newAlarm = {
        id: Date.now().toString(),
        pillName,
        time: '08:00',
        enabled: false,
        notificationId: null,
      };
      await persist([...alarms, newAlarm]);
    },
    [alarms, persist]
  );

  /** ✅ 알람 ON/OFF */
  const toggleAlarm = useCallback(
    async (alarmId) => {
      try {
        const target = alarms.find((a) => a.id === alarmId);
        if (!target) return;

        // ON -> OFF
        if (target.enabled) {
          await cancelNotification(target.notificationId);
          const next = alarms.map((a) =>
            a.id === alarmId ? { ...a, enabled: false, notificationId: null } : a
          );
          await persist(next);
          return;
        }

        // OFF -> ON
        await cancelNotification(target.notificationId);

        const notificationId = await scheduleDailyNotification({
          pillName: target.pillName,
          time: target.time,
          soundOn,
          vibrationOn,
        });

        const next = alarms.map((a) =>
          a.id === alarmId ? { ...a, enabled: true, notificationId } : a
        );
        await persist(next);
      } catch (e) {
        console.error('⏰ toggleAlarm 실패:', e);
        Alert.alert('오류', e?.message ?? '알람 설정 중 문제가 발생했습니다.');
      }
    },
    [alarms, persist, soundOn, vibrationOn]
  );

  /** ✅ 시간 변경 (enabled면 재등록) */
  const changeAlarmTime = useCallback(
    async (alarmId, timeStr) => {
      try {
        // 시간값 검증(여기서 한 번 더)
        parseTimeOrThrow(timeStr);

        const target = alarms.find((a) => a.id === alarmId);
        if (!target) return;

        // 기존 취소
        await cancelNotification(target.notificationId);

        let notificationId = null;
        if (target.enabled) {
          notificationId = await scheduleDailyNotification({
            pillName: target.pillName,
            time: timeStr,
            soundOn,
            vibrationOn,
          });
        }

        const next = alarms.map((a) =>
          a.id === alarmId ? { ...a, time: timeStr, notificationId } : a
        );
        await persist(next);
      } catch (e) {
        console.error('⏱ changeAlarmTime 실패:', e);
        Alert.alert('오류', e?.message ?? '알람 시간 변경 중 문제가 발생했습니다.');
      }
    },
    [alarms, persist, soundOn, vibrationOn]
  );

  /** ✅ 삭제 */
  const deleteAlarm = useCallback(
    async (alarmId) => {
      try {
        const target = alarms.find((a) => a.id === alarmId);
        if (!target) return;

        await cancelNotification(target.notificationId);
        const next = alarms.filter((a) => a.id !== alarmId);
        await persist(next);
      } catch (e) {
        console.error('🗑 deleteAlarm 실패:', e);
        Alert.alert('오류', e?.message ?? '알람 삭제 중 문제가 발생했습니다.');
      }
    },
    [alarms, persist]
  );

  /** ✅ 디버깅: 현재 스케줄 목록 확인 */
  const debugListScheduled = useCallback(async () => {
    const list = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📌 scheduled notifications:', list);
    return list;
  }, []);

  const value = useMemo(
    () => ({
      ready,

      alarms,
      soundOn,
      vibrationOn,
      setSoundOn,
      setVibrationOn,

      ensureAlarmForPill,
      toggleAlarm,
      changeAlarmTime,
      deleteAlarm,

      debugListScheduled,
    }),
    [ready, alarms, soundOn, vibrationOn, ensureAlarmForPill, toggleAlarm, changeAlarmTime, deleteAlarm, debugListScheduled]
  );

  return value;
}