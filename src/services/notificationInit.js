import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'pill-alarm';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function initNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '복약 알람',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 250, 500],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }

  const perm = await Notifications.getPermissionsAsync();
  let status = perm.status;

  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }

  return { status, channelId: CHANNEL_ID };
}

// ✅ 여기만 추가
export async function registerPushToken(userId) {
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("📱 Push Token:", token);

    await fetch(`${API_BASE_URL}/push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, token })
    });

    console.log("✅ Push Token 서버 저장 완료");
    return token;
  } catch (e) {
    console.error("❌ Push Token 등록 실패:", e);
    return null;
  }
}

export const PILL_CHANNEL_ID = CHANNEL_ID;