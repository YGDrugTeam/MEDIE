// src/services/notificationInit.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'pill-alarm';

export async function initNotifications() {
  // 0) 포그라운드에서도 보이게(필수)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // SDK 버전에 따라 shouldShowBanner/shouldShowList가 있을 수 있음
    }),
  });

  // 1) Android: 채널 먼저 생성 (Android 13 권한 팝업 이슈 방지)
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

  // 2) 그 다음 권한 요청
  const perm = await Notifications.getPermissionsAsync();
  let status = perm.status;

  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }

  return { status, channelId: CHANNEL_ID };
}

export const PILL_CHANNEL_ID = CHANNEL_ID;