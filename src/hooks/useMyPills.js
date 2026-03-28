import { useEffect, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
// 📍 SecureStore 대신 AsyncStorage를 사용합니다.
import AsyncStorage from '@react-native-async-storage/async-storage';
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

/** ✅ 매일 알람 등록 */
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
      title: '⏰ 약 복용 시간입니다!',
      body: `${pillName} 드실 시간이에요. 메디멍이 기다리고 있어요! 🐶`,
      sound: 'default',
      priority: Notifications.AndroidImportance.MAX, // 안드로이드에서 가장 높은 우선순위
      vibrationPattern: [0, 500, 250, 500], // 강력한 진동 패턴
      categoryIdentifier: 'pill-reminder',
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

  // 📍 [수정] SecureStore -> AsyncStorage 교체
  const saveMyPills = useCallback(
    async (list) => {
      const safe = Array.isArray(list) ? list : [];
      setMyPills(safe);

      try {
        const jsonValue = JSON.stringify(safe);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        console.log("✅ 데이터 저장 성공 (AsyncStorage)");
      } catch (e) {
        console.error('❌ myPills save 실패:', e);
        Alert.alert('저장 오류', '내 복용약 저장 중 문제가 발생했습니다.');
        throw e;
      }
    },
    [STORAGE_KEY]
  );

  // 📍 [수정] 불러오기 로직도 AsyncStorage로 교체
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (!json) {
          setMyPills([]);
          return;
        }
        const parsed = JSON.parse(json);
        setMyPills(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('❌ myPills load 실패:', e);
        setMyPills([]);
      }
    })();
  }, [STORAGE_KEY]);

  const ensurePillSchedule = useCallback(
    async (pillId) => {
      const current = Array.isArray(myPills) ? myPills : [];
      const idx = current.findIndex((p) => String(p.id) === String(pillId));
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

  const togglePillAlarm = useCallback(
    async (pillId, opts = {}) => {
      const soundOn = opts.soundOn ?? defaultSoundOn;
      const vibrationOn = opts.vibrationOn ?? defaultVibrationOn;

      try {
        const current = Array.isArray(myPills) ? myPills : [];
        const idx = current.findIndex((p) => String(p.id) === String(pillId));
        if (idx < 0) return;

        const pill = current[idx];
        const next = [...current];
        const time = pill?.schedules?.[0]?.time ?? '08:00';

        if (pill.alarmEnabled) {
          await cancelIfExists(pill.notificationId);
          next[idx] = { ...pill, alarmEnabled: false, notificationId: null };
          await saveMyPills(next);
          return;
        }

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
        Alert.alert('오류', '알람 설정 중 문제가 발생했습니다.');
      }
    },
    [myPills, saveMyPills, defaultSoundOn, defaultVibrationOn]
  );

  const changePillAlarmTime = useCallback(
    async (pillId, timeStr, opts = {}) => {
      const soundOn = opts.soundOn ?? defaultSoundOn;
      const vibrationOn = opts.vibrationOn ?? defaultVibrationOn;

      try {
        parseTimeOrThrow(timeStr);
        const current = Array.isArray(myPills) ? myPills : [];
        const idx = current.findIndex((p) => String(p.id) === String(pillId));
        if (idx < 0) return;

        const pill = current[idx];
        const next = [...current];

        const schedules = Array.isArray(pill.schedules) ? [...pill.schedules] : [];
        if (schedules.length === 0) schedules.push({ time: '08:00' });
        schedules[0] = { ...schedules[0], time: timeStr };

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
      }
    },
    [myPills, saveMyPills, defaultSoundOn, defaultVibrationOn]
  );

  // 📍 [수정] 알람 삭제 시 필터링 로직 보강
  const deletePillAlarm = useCallback(
    async (pillId) => {
      try {
        const current = Array.isArray(myPills) ? myPills : [];
        const idx = current.findIndex((p) => String(p.id) === String(pillId));
        if (idx < 0) return;

        const pill = current[idx];
        await cancelIfExists(pill.notificationId);

        const next = [...current];
        // 📍 알람만 끄는 게 아니라, 알람 데이터 자체를 정리하려면 구조에 맞게 수정 가능
        next[idx] = { ...pill, alarmEnabled: false, notificationId: null };
        await saveMyPills(next);
      } catch (e) {
        console.error('❌ deletePillAlarm 실패:', e);
      }
    },
    [myPills, saveMyPills]
  );

  const deletePill = useCallback(
    async (pillId) => {
      try {
        const current = Array.isArray(myPills) ? myPills : [];
        const pill = current.find((p) => String(p.id) === String(pillId));
        if (pill) await cancelIfExists(pill.notificationId);

        const next = current.filter((p) => String(p.id) !== String(pillId));
        await saveMyPills(next);
      } catch (e) {
        console.error('❌ deletePill 실패:', e);
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