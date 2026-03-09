// app.js
import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { initNotifications } from './src/services/notificationInit';

/* styles */
import { styles } from './src/styles/commonStyles';

/* components */
import HomeFloatingButton from './src/components/HomeFloatingButton';

/* screens */
import StartScreen from './src/screens/StartScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import MyPillScreen from './src/screens/MyPillScreen';
import MapScreen from './src/screens/MapScreen';
import AlarmScreen from './src/screens/AlarmScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SearchPillScreen from './src/screens/SearchPillScreen';

/* hooks */
import useCameraScan from './src/hooks/useCameraScan';
import usePharmacySearch from './src/hooks/usePharmacySearch';
import useBackHandler from './src/hooks/useBackHandler';
import useMyPills from './src/hooks/useMyPills';
// ✅ 경로 수정: src./ -> src/
import usePillAlarms from './src/hooks/usePillAlarms';

const STORAGE_KEY = 'MY_PILLS_JSON';

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [appMode, setAppMode] = useState('HOME');

  // ✅ 알림 초기화 1회
  useEffect(() => {
    (async () => {
      const { status } = await initNotifications();
      console.log('🔔 notification permission:', status);
    })();
  }, []);

useEffect(() => {
  (async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ cancelAllScheduledNotificationsAsync done');
  })();
}, []);
console.log('✅ cancelAllScheduledNotificationsAsync done');
  
  
  // ✅ (선택) 통합 알람 훅을 쓸 거면 1번만 호출
  // 지금 화면에서는 AlarmScreen에 myPills 기반 알람만 쓰는 중이니,
  // 당장 필요 없으면 아예 제거해도 됨.
  // const pillAlarms = usePillAlarms();

  // ✅ 내 복용약: 훅 하나로만 관리
  const {
    myPills,
    saveMyPills,
    ensurePillSchedule,
    togglePillAlarm,
    changePillAlarmTime,
    deletePillAlarm,
    deletePill,
  } = useMyPills({ STORAGE_KEY });

  // MyPillScreen에서 알람 화면으로 이동
  const goAlarmFromPill = async (pillId) => {
    await ensurePillSchedule(pillId); // 없으면 기본 08:00 생성
    setAppMode('ALARM');
  };

  // ✅ 스캔 결과로 약 등록 -> saveMyPills로 저장
  const registerPillFromAiResponse = useCallback(
    async (aiResponse) => {
      const lines = aiResponse.split('\n');

      const pillName =
        lines.find((l) => l.includes('알약 이름'))?.replace('💊 알약 이름: ', '') ||
        '알 수 없음';

      const confidence =
        lines
          .find((l) => l.includes('신뢰도'))
          ?.replace('신뢰도: ', '')
          .replace('%', '') || '0';

      const usageIndex = lines.findIndex((l) => l.includes('📌 복용 목적'));
      const warningIndex = lines.findIndex((l) => l.includes('⚠️ 주의사항'));

      const usage =
        usageIndex >= 0 && warningIndex >= 0
          ? lines.slice(usageIndex + 1, warningIndex).join('\n')
          : '';

      const warning = warningIndex >= 0 ? lines.slice(warningIndex + 1).join('\n') : '';

      const newPill = {
        id: Date.now().toString(),
        name: pillName,
        usage,
        warning,
        confidence,
        schedules: [
          {
            time: '08:00',
            notificationId: null,
            enabled: true,
            takenToday: false,
          },
        ],
        alarmEnabled: false,
        notificationId: null,
        createdAt: Date.now(),
      };

      const updated = [newPill, ...(myPills ?? [])];

      try {
        await saveMyPills(updated);
      } catch (e) {
        console.error('❌ saveMyPills 실패', e);
        Alert.alert('저장 오류', '내 복용약 저장에 실패했습니다.');
        return;
      }

      Alert.alert('등록 완료', '내 복용약으로 등록되었습니다.', [
        { text: '확인', onPress: () => setAppMode('MY_PILL') },
      ]);
    },
    [myPills, saveMyPills]
  );

  // ✅ 카메라 스캔 훅
  const {
    cameraRef,
    isAnalyzing,
    showResult,
    setShowResult,
    aiResponse,
    drugImageUrl,
    handleScan,
    handleRegisterPill,
    closeResult,
  } = useCameraScan({
    onRegisterPill: registerPillFromAiResponse,
  });

  // ✅ 당번약국 훅
  const {
    nearbyPharmacies,
    isSearchingMap,
    findNearbyPharmacies,
    openKakaoMapDetail,
    makePhoneCall,
  } = usePharmacySearch();

  // ✅ 전역 뒤로가기 처리
  useBackHandler({
    appMode,
    setAppMode,
    showResult,
    setShowResult,
  });

  /* 시작 화면 */
  if (!isStarted) {
    return (
      <StartScreen
        onStart={() => {
          setIsStarted(true);
          setAppMode('HOME');
        }}
      />
    );
  }

  /* 실제 화면 */
  return (
    <SafeAreaView style={styles.safeArea}>
      {appMode === 'HOME' && <HomeFloatingButton onPress={() => setAppMode('SCAN')} />}

      {(() => {
        switch (appMode) {
          case 'HOME':
            return (
              <HomeScreen
                setAppMode={setAppMode}
                onPressMap={() => {
                  setAppMode('MAP');
                  findNearbyPharmacies();
                }}
              />
            );

          case 'SCAN':
            return (
              <ScanScreen
                cameraRef={cameraRef}
                isAnalyzing={isAnalyzing}
                showResult={showResult}
                aiResponse={aiResponse}
                drugImageUrl={drugImageUrl}
                onScan={handleScan}
                onRegisterPill={handleRegisterPill}
                onCloseResult={closeResult}
                setAppMode={setAppMode}
              />
            );

          case 'MY_PILL':
            return (
              <MyPillScreen
                setAppMode={setAppMode}
                myPills={myPills}
                onToggleAlarm={goAlarmFromPill}
                onDeletePill={deletePill}
              />
            );

          case 'MAP':
            return (
              <MapScreen
                setAppMode={setAppMode}
                nearbyPharmacies={nearbyPharmacies}
                isSearchingMap={isSearchingMap}
                makePhoneCall={makePhoneCall}
                openKakaoMapDetail={openKakaoMapDetail}
              />
            );

          case 'ALARM':
            return (
              <AlarmScreen
                myPills={myPills}
                setAppMode={setAppMode}
                togglePillAlarm={togglePillAlarm}
                changePillAlarmTime={changePillAlarmTime}
                deletePillAlarm={deletePillAlarm}
              />
            );

          case 'HISTORY':
            return <HistoryScreen setAppMode={setAppMode} />;

          case 'SEARCH_PILL':
            return <SearchPillScreen setAppMode={setAppMode} />;

          default:
            return null;
        }
      })()}
    </SafeAreaView>
  );
}