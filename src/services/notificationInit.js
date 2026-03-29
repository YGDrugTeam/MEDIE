import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';  // ✅ 추가

const CHANNEL_ID = 'pill-alarm';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function registerPushToken(userId) {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('ℹ️ Push Token 스킵 (권한 없음)');
      return null;
    }

    // ✅ app.json의 projectId 자동으로 읽어옴
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId,
    })).data;

    console.log("📱 Push Token:", token);

    await fetch(`${API_BASE_URL}/push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, token }),
    });

    console.log("✅ Push Token 서버 저장 완료");
    return token;
  } catch (e) {
    console.log('ℹ️ Push Token 등록 스킵:', e.message);
    return null;
  }
}

export const PILL_CHANNEL_ID = CHANNEL_ID;