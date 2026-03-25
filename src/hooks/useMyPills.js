// src/hooks/useMyPills.js
import { useEffect, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

const DEFAULT_STORAGE_KEY = 'MY_PILLS_JSON';
const CHANNEL_ID = 'pill-alarm';

/** ✅ 권한 확보 */
async function ensurePermissionOrThrow() {
  const perm = await Notifications.getPermissionsAsync();
  let status = perm.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') throw new Error('notification permission not granted');
}

/** ✅ Android 채널 생성/업데이트 */
async function ensureAndroidChannel({ soundOn, vibrationOn }) {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: '복약 알람',
    importance: Notifications.AndroidImportance.MAX,
    sound: soundOn ? 'default' : undefined,
    vibrationPattern: vibrationOn ? [0, 500, 250, 500] : undefined,
    enableVibrate: !!vibrationOn,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

/** ✅ time 파싱 */
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

/** ✅ 안전 취소 */
async function cancelIfExists(id) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch { }
}

/**
 * ✅ "중복 방지" 버전: 매일 알람(daily) 1개만 등록
 * - Android: { type:'daily', hour, minute, channelId, repeats:true }
 * - iOS: { hour, minute, repeats:true }
 */
export async function scheduleDailyAlarm({ pillName, time, soundOn, vibrationOn }) {
  const { hour, minute } = parseTimeOrThrow(time);

  await ensureAndroidChannel({ soundOn, vibrationOn });
  await ensurePermissionOrThrow();

  const trigger =
    Platform.OS === 'android'
      ? {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: CHANNEL_ID,
      }
      : {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      };
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '💊 복약 알림',
      body: `${pillName ?? '복약'} 복용할 시간이에요`,
      sound: soundOn ? 'default' : undefined,
    },
    trigger,
  });
}

export default function useMyPills({
  STORAGE_KEY = DEFAULT_STORAGE_KEY,
  soundOn: defaultSoundOn = true,
  vibrationOn: defaultVibrationOn = true,
} = {}) {
  const [myPills, setMyPills] = useState([]);

  const saveMyPills = useCallback(
    async (list) => {
      const safe = Array.isArray(list) ? list : [];
      setMyPills(safe);

      try {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(safe));
      } catch (e) {
        console.error('❌ myPills save 실패:', e);
        Alert.alert('저장 오류', '내 복용약 저장 중 문제가 발생했습니다.');
        throw e;
      }
    },
    [STORAGE_KEY]
  );

  useEffect(() => {
    (async () => {
      try {
        const json = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!json) {
          setMyPills([]);
          return;
        }
        const parsed = JSON.parse(json);
        setMyPills(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('❌ myPills load 실패:', e);
        try {
          await SecureStore.deleteItemAsync(STORAGE_KEY);
        } catch { }
        setMyPills([]);
      }
    })();
  }, [STORAGE_KEY]);

  /** ✅ 스케줄 없으면 기본 08:00 생성 (ALARM 화면 진입용) */
  const ensurePillSchedule = useCallback(
    async (pillId) => {
      const current = Array.isArray(myPills) ? myPills : [];
      const idx = current.findIndex((p) => p.id === pillId);
      if (idx < 0) return;

      const pill = current[idx];
      const schedules = Array.isArray(pill.schedules) ? pill.schedules : [];
      if (schedules.length > 0 && schedules[0]?.time) return;

      const next = [...current];
      next[idx] = {
        ...pill,
        schedules: [{ time: '08:00', enabled: true, takenToday: false }],
      };
      await saveMyPills(next);
    },
    [myPills, saveMyPills]
  );

  /** ✅ 알람 ON/OFF */
  const togglePillAlarm = useCallback(
    async (pillId, opts = {}) => {
      const soundOn = opts.soundOn ?? defaultSoundOn;
      const vibrationOn = opts.vibrationOn ?? defaultVibrationOn;

      try {
        const current = Array.isArray(myPills) ? myPills : [];
        const idx = current.findIndex((p) => p.id === pillId);
        if (idx < 0) return;

        const pill = current[idx];
        const next = [...current];
        const time = pill?.schedules?.[0]?.time ?? '08:00';

        // ON -> OFF
        if (pill.alarmEnabled) {
          await cancelIfExists(pill.notificationId);
          next[idx] = { ...pill, alarmEnabled: false, notificationId: null };
          await saveMyPills(next);
          return;
        }

        // OFF -> ON (기존 예약 정리 후 재등록)
        await cancelIfExists(pill.notificationId);

        const notificationId = await scheduleDailyAlarm({
          pillName: pill.name ?? '복약',
          time,
          soundOn,
          vibrationOn,
        });

        next[idx] = { ...pill, alarmEnabled: true, notificationId };
        await saveMyPills(next);
      } catch (e) {
        console.error('❌ togglePillAlarm 실패:', e);
        Alert.alert('오류', e?.message ?? '알람 설정 중 문제가 발생했습니다.');
      }
    },
    [myPills, saveMyPills, defaultSoundOn, defaultVibrationOn]
  );

  /** ✅ 시간 변경: 켜져있으면 재등록 */
  const changePillAlarmTime = useCallback(
    async (pillId, timeStr, opts = {}) => {
      const soundOn = opts.soundOn ?? defaultSoundOn;
      const vibrationOn = opts.vibrationOn ?? defaultVibrationOn;

      try {
        parseTimeOrThrow(timeStr);

        const current = Array.isArray(myPills) ? myPills : [];
        const idx = current.findIndex((p) => p.id === pillId);
        if (idx < 0) return;

        const pill = current[idx];
        const next = [...current];

        // schedules 업데이트
        const schedules = Array.isArray(pill.schedules) ? [...pill.schedules] : [];
        if (schedules.length === 0) schedules.push({ time: '08:00' });
        schedules[0] = { ...schedules[0], time: timeStr };

        // 기존 알림 취소
        await cancelIfExists(pill.notificationId);

        let notificationId = null;
        if (pill.alarmEnabled) {
          notificationId = await scheduleDailyAlarm({
            pillName: pill.name ?? '복약',
            time: timeStr,
            soundOn,
            vibrationOn,
          });
        }

        next[idx] = { ...pill, schedules, notificationId };
        await saveMyPills(next);
      } catch (e) {
        console.error('❌ changePillAlarmTime 실패:', e);
        Alert.alert('오류', e?.message ?? '알람 시간 변경 중 문제가 발생했습니다.');
      }
    },
    [myPills, saveMyPills, defaultSoundOn, defaultVibrationOn]
  );

  /** ✅ 알람 삭제 = 알림 취소 + 비활성화(약은 유지) */
  const deletePillAlarm = useCallback(
    async (pillId) => {
      try {
        const current = Array.isArray(myPills) ? myPills : [];
        const idx = current.findIndex((p) => p.id === pillId);
        if (idx < 0) return;

        const pill = current[idx];
        await cancelIfExists(pill.notificationId);

        const next = [...current];
        next[idx] = { ...pill, alarmEnabled: false, notificationId: null };
        await saveMyPills(next);
      } catch (e) {
        console.error('❌ deletePillAlarm 실패:', e);
        Alert.alert('오류', e?.message ?? '알람 삭제 중 문제가 발생했습니다.');
      }
    },
    [myPills, saveMyPills]
  );

  /** ✅ 약 삭제(알람도 같이 정리) */
  const deletePill = useCallback(
    async (pillId) => {
      try {
        const current = Array.isArray(myPills) ? myPills : [];
        const pill = current.find((p) => p.id === pillId);
        if (pill) await cancelIfExists(pill.notificationId);

        const next = current.filter((p) => p.id !== pillId);
        await saveMyPills(next);
      } catch (e) {
        console.error('❌ deletePill 실패:', e);
        Alert.alert('오류', e?.message ?? '삭제 중 문제가 발생했습니다.');
      }
    },
    [myPills, saveMyPills]
  );

  return {
    myPills,
    saveMyPills,
    ensurePillSchedule,
    togglePillAlarm,
    changePillAlarmTime,
    deletePillAlarm,
    deletePill,
  };
}