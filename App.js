import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  Alert,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { initNotifications } from './src/services/notificationInit';
import * as Notifications from 'expo-notifications';

// 🎙️ 보이스 라이브러리 추가
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

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
  const [writeBoardType, setWriteBoardType] = useState('free');

  // [추가] 보이스 관련 상태
  const [isListening, setIsListening] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  // 게시판 상세용 선택 게시글 상태
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedBoardTitle, setSelectedBoardTitle] = useState('자유게시판');

  // ---------------------------------------------------------
  // 🎙️ 보이스 엔진 핵심 로직 (통합 버전)
  // ---------------------------------------------------------

  /** 🔊 1. 메디의 목소리 (TTS) */
  const speakMedie = (text) => {
    Speech.speak(text, {
      language: 'ko-KR',
      pitch: 1.1,
      rate: 1.0,
    });
  };

  /** 🎙️ 2. 음성 인식 시작 (상시 대기 모드) */
  const startContinuousListening = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.log("❌ 마이크 권한 거부됨");
      return;
    }
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: "ko-KR",
      interimResults: true,
      continuous: true,
    });
  };

  /** 🧠 3. 음성 인식 이벤트 처리 (호출어 감지) */
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    // "메디야" 감지 시 자동 실행
    if (transcript.includes("메디야") || transcript.includes("매디야")) {
      console.log("🐶 메디 호출 감지됨:", transcript);
      const cleanText = transcript.replace(/메디야|매디야/g, "").trim();
      if (cleanText.length > 0) {
        askMedie(cleanText);
      } else {
        speakMedie("네, 지현님! 말씀하세요 멍!");
      }
    }
  });

  /** 🤖 4. 메디 클라우드 통신 함수 (통합 및 중복 제거 완료) */
  const askMedie = async (userText) => {
    try {
      console.log("📡 전송 데이터:", { userText, appMode });

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: userText || "안녕",
          message: userText || "안녕",
          current_mode: appMode || "HOME"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log("🐶 메디 응답 성공:", data);

      // 화면 이동 명령 처리
      if (data.command === "MOVE_SCREEN" && data.target) {
        setAppMode(data.target);
      }

      // 🔊 목소리로 응답!
      speakMedie(data.reply || "대답을 준비하지 못했어요 멍!");

    } catch (e) {
      console.log("연결 실패:", e.message);
      Alert.alert("연결 오류", "메디 서버와 대화할 수 없어요 멍.");
    }
  };

  // ---------------------------------------------------------

  const handleOpenBoard = (post, boardTitle = '자유게시판') => {
    setSelectedPost(post);
    setSelectedBoardTitle(boardTitle);
    setAppMode('BOARD');
  };

  const handleBackToCommunity = () => {
    setAppMode('COMMUNITY');
  };

  // 앱 시작 시 로그인 상태 로드 및 보이스 엔진 초기화
  useEffect(() => {
    const loadLoginState = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('access_token');
        const userId = await SecureStore.getItemAsync('user_id');
        const userName = await SecureStore.getItemAsync('user_name');
        const userEmail = await SecureStore.getItemAsync('user_email');

        if (accessToken && userId && userName && userEmail) {
          setIsLoggedIn(true);
          setUser({
            id: userId,
            name: userName,
            email: userEmail,
          });
        }
      } catch (e) {
        console.error('자동 로그인 확인 실패:', e);
      } finally {
        setIsCheckingLogin(false);
      }
    };

    loadLoginState();

    // 🎙️ 보이스 엔진 켜기
    startContinuousListening();
    return () => ExpoSpeechRecognitionModule.stop();
  }, []);

  // 알림 초기화
  useEffect(() => {
    (async () => {
      const { status } = await initNotifications();
      console.log('🔔 notification permission:', status);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
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

  useBackHandler({
    appMode,
    setAppMode,
    showResult,
    setShowResult,
  });

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
              <HomeScreen
                setAppMode={setAppMode}
                onPressMap={() => {
                  setAppMode('MAP');
                  findNearbyPharmacies();
                }}
                isLoggedIn={isLoggedIn}
                user={user}
                setIsLoggedIn={setIsLoggedIn}
                setUser={setUser}
              />
            );
          case 'LOGIN':
            return <LoginScreen setAppMode={setAppMode} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;
          case 'REGISTER':
            return <RegisterScreen setAppMode={setAppMode} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;
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
            return <MyPillScreen setAppMode={setAppMode} myPills={myPills} onToggleAlarm={goAlarmFromPill} onDeletePill={deletePill} />;
          case 'MAP':
            return <MapScreen setAppMode={setAppMode} nearbyPharmacies={nearbyPharmacies} findNearbyPharmacies={findNearbyPharmacies} isSearchingMap={isSearchingMap} makePhoneCall={makePhoneCall} openKakaoMapDetail={openKakaoMapDetail} />;
          case 'ALARM':
            return <AlarmScreen myPills={myPills} setAppMode={setAppMode} togglePillAlarm={togglePillAlarm} changePillAlarmTime={changePillAlarmTime} deletePillAlarm={deletePillAlarm} />;
          case 'HISTORY':
            return <HistoryScreen setAppMode={setAppMode} />;
          case 'SEARCH_PILL':
            return <SearchPillScreen setAppMode={setAppMode} />;
          case 'COMMUNITY':
            return <CommunityScreen setAppMode={setAppMode} onOpenBoard={handleOpenBoard} setWriteBoardType={setWriteBoardType} />;
          case 'BOARD':
            return <BoardScreen setAppMode={setAppMode} post={selectedPost} boardTitle={selectedBoardTitle} onBack={handleBackToCommunity} />;
          case 'SUPPORT':
            return <SupportMainScreen setAppMode={setAppMode} onOpenSupport={(item) => { setSelectedSupportPost(item); setAppMode('SUPPORT_DETAIL'); }} />;
          case 'SUPPORT_DETAIL':
            return <SupportListScreen post={selectedSupportPost} onBack={() => setAppMode('SUPPORT')} setAppMode={setAppMode} />;
          case 'SUPPORT_WRITE':
            return <SupportWriteScreen setAppMode={setAppMode} />;
          case 'WRITE_BOARD':
            return <WriteBoardScreen setAppMode={setAppMode} writeBoardType={writeBoardType} />;
          default:
            return <HomeScreen setAppMode={setAppMode} isLoggedIn={isLoggedIn} user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;
        }
      })()}

      {/* 🐶 메디 상호작용 버튼 */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={localStyles.medieButton}
        onPress={() => askMedie("안녕 메디!")}
      >
        <Image
          source={require('./assets/medie-dog.png')}
          style={localStyles.medieIcon}
        />
        {/* 마이크 활성화 상태 표시 점 */}
        {isListening && <View style={localStyles.listeningDot} />}
      </TouchableOpacity>
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
  listeningDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF7F50',
    borderWidth: 2,
    borderColor: '#fff',
  }
});