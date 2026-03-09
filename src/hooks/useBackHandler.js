// hooks/useBackHandler.js
import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import * as Speech from 'expo-speech';

export default function useBackHandler({
  appMode,
  setAppMode,
  showResult,
  setShowResult,
}) {
  const backPressTime = useRef(0);

  useEffect(() => {
    const onBackPress = () => {
      const now = Date.now();

      if (showResult) {
        setShowResult(false);
        Speech.stop();
        return true;
      }

      if (['SCAN', 'MAP', 'ALARM', 'FAMILY', 'HISTORY', 'MY_PILL'].includes(appMode)) {
        setAppMode('HOME');
        return true;
      }

      if (appMode === 'HOME') {
        if (now - backPressTime.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        backPressTime.current = now;
        if (Platform.OS === 'android') {
          ToastAndroid.show('한 번 더 누르면 앱이 종료됩니다', ToastAndroid.SHORT);
        }
        return true;
      }

      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [appMode, showResult]);
}