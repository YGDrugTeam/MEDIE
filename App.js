import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, Alert, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { initNotifications } from './src/services/notificationInit';
import * as Notifications from 'expo-notifications';

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
import CommunityScreen from './src/screens/CommunityScreen';
import BoardScreen from './src/screens/BoardScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WriteBoardScreen from './src/screens/WriteBoardScreen';
import SupportMainScreen from './src/screens/SupportMainScreen';
import SupportListScreen from './src/screens/SupportListScreen';
import SupportWriteScreen from './src/screens/SupportWriteScreen';

/* hooks */
import useCameraScan from './src/hooks/useCameraScan';
import usePharmacySearch from './src/hooks/usePharmacySearch';
import useBackHandler from './src/hooks/useBackHandler';
import useMyPills from './src/hooks/useMyPills';

// agent 
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const STORAGE_KEY = 'MY_PILLS_JSON';

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [appMode, setAppMode] = useState('HOME');
  const [selectedSupportPost, setSelectedSupportPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedBoardTitle, setSelectedBoardTitle] = useState('자유게시판');

  const handleOpenBoard = (post, boardTitle = '자유게시판') => {
    setSelectedPost(post);
    setSelectedBoardTitle(boardTitle);
    setAppMode('BOARD');
  };

  const handleBackToCommunity = () => {
    setAppMode('COMMUNITY');
  };

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

  const {
    myPills,
    saveMyPills,
    ensurePillSchedule,
    togglePillAlarm,
    changePillAlarmTime,
    deletePillAlarm,
    deletePill,
  } = useMyPills({ STORAGE_KEY });

  /**
   * [메디 클라우드 통신 함수] 
   */
  const askMedie = async (userText) => {
    try {
      console.log("📡 전송 데이터:", { userText, appMode }); 

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: userText || "안녕",
          message: userText || "안녕",   
          current_mode: appMode || "HOME" // appMode가 없을 경우 "HOME"으로 강제 설정
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ 서버가 보낸 진짜 메시지:", errorText);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log("🐶 메디 응답 성공:", data);

      if (data.command === "MOVE_SCREEN" && data.target) {
        setAppMode(data.target);
      }

      Alert.alert("🐶 메디의 답변", data.reply || "대답을 준비하지 못했어요 멍!");

    } catch (e) {
      console.log("연결 실패:", e.message);
      Alert.alert("연결 오류", e.message);
    }
  };

  const goAlarmFromPill = async (pillId) => {
    await ensurePillSchedule(pillId);
    setAppMode('ALARM');
  };

  const registerPillFromAiResponse = useCallback(
    async (aiResponse) => {
      const lines = aiResponse.split('\n');
      const pillName = lines.find((l) => l.includes('알약 이름'))?.replace('💊 알약 이름: ', '') || '알 수 없음';
      const confidence = lines.find((l) => l.includes('신뢰도'))?.replace('신뢰도: ', '').replace('%', '') || '0';
      const usageIndex = lines.findIndex((l) => l.includes('📌 복용 목적'));
      const warningIndex = lines.findIndex((l) => l.includes('⚠️ 주의사항'));
      const usage = usageIndex >= 0 && warningIndex >= 0 ? lines.slice(usageIndex + 1, warningIndex).join('\n') : '';
      const warning = warningIndex >= 0 ? lines.slice(warningIndex + 1).join('\n') : '';

      const newPill = {
        id: Date.now().toString(),
        name: pillName,
        usage,
        warning,
        confidence,
        schedules: [{ time: '08:00', notificationId: null, enabled: true, takenToday: false }],
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
        {
          text: '확인',
          onPress: () => {
            setAppMode('MY_PILL');
            askMedie("방금 새로운 약을 내 복용약에 등록했어! 나 잘했지?");
          }
        },
      ]);
    },
    [myPills, saveMyPills]
  );

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

  const {
    nearbyPharmacies,
    isSearchingMap,
    findNearbyPharmacies,
    openKakaoMapDetail,
    makePhoneCall,
  } = usePharmacySearch();

  useBackHandler({ appMode, setAppMode, showResult, setShowResult });

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

  if (isCheckingLogin) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {appMode === 'HOME' && <HomeFloatingButton onPress={() => setAppMode('SCAN')} />}

      {(() => {
        switch (appMode) {
          case 'HOME':
            return (
              <>
                <HomeScreen
                  setAppMode={setAppMode}
                  onPressMap={() => {
                    setAppMode('MAP');
                    findNearbyPharmacies();
                  }}
                />
                <TouchableOpacity
                  style={localStyles.medieButton}
                  onPress={() => askMedie("안녕 메디야!")}
                >
                  <Image
                    source={require('./assets/medie-dog.png')}
                    style={localStyles.medieIcon}
                  />
                </TouchableOpacity>
              </>
            );
          case 'SCAN': return <ScanScreen cameraRef={cameraRef} isAnalyzing={isAnalyzing} showResult={showResult} aiResponse={aiResponse} drugImageUrl={drugImageUrl} onScan={handleScan} onRegisterPill={handleRegisterPill} onCloseResult={closeResult} setAppMode={setAppMode} />;
          case 'MY_PILL': return <MyPillScreen setAppMode={setAppMode} myPills={myPills} onToggleAlarm={goAlarmFromPill} onDeletePill={deletePill} />;
          case 'MAP': return <MapScreen setAppMode={setAppMode} nearbyPharmacies={nearbyPharmacies} findNearbyPharmacies={findNearbyPharmacies} isSearchingMap={isSearchingMap} makePhoneCall={makePhoneCall} openKakaoMapDetail={openKakaoMapDetail} />;
          case 'ALARM': return <AlarmScreen myPills={myPills} setAppMode={setAppMode} togglePillAlarm={togglePillAlarm} changePillAlarmTime={changePillAlarmTime} deletePillAlarm={deletePillAlarm} />;
          case 'HISTORY': return <HistoryScreen setAppMode={setAppMode} />;
          case 'SEARCH_PILL': return <SearchPillScreen setAppMode={setAppMode} />;
          case 'COMMUNITY': return <CommunityScreen setAppMode={setAppMode} onOpenBoard={handleOpenBoard} />;
          case 'BOARD': return <BoardScreen setAppMode={setAppMode} post={selectedPost} boardTitle={selectedBoardTitle} onBack={handleBackToCommunity} />;
          case 'SUPPORT': return <SupportMainScreen setAppMode={setAppMode} onOpenSupport={(item) => { setSelectedSupportPost(item); setAppMode('SUPPORT_DETAIL'); }} />;
          case 'SUPPORT_DETAIL': return <SupportListScreen post={selectedSupportPost} onBack={() => setAppMode('SUPPORT')} setAppMode={setAppMode} />;
          case 'SUPPORT_WRITE': return <SupportWriteScreen setAppMode={setAppMode} />;
          case 'WRITE_BOARD': return <WriteBoardScreen setAppMode={setAppMode} />;
          case 'LOGIN': return <LoginScreen setAppMode={setAppMode} />;
          default: return <HomeScreen setAppMode={setAppMode} />;
        }
      })()}
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  medieButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medieIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});