import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar, View, Text, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { initNotifications, registerPushToken } from './src/services/notificationInit';
import { API_BASE } from './src/api/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* styles */
import { styles } from './src/styles/commonStyles';

/* components */
import HomeFloatingButton from './src/components/HomeFloatingButton';
import { MedieChatView } from './src/components/MedieChatView';

/* screens */
import StartScreen from './src/screens/StartScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import MyPillScreen from './src/screens/MyPillScreen';
import MyPillDetailScreen from './src/screens/MyPillDetailScreen';
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
import MyPageScreen from './src/screens/MyPageScreen';
import EditPostScreen from './src/screens/EditPostScreen';
import MedicationOnboardingScreen from './src/screens/MedicationOnboardingScreen';
import AppInfoScreen from './src/screens/AppInfoScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';

/* hooks */
import useCameraScan from './src/hooks/useCameraScan';
import usePharmacySearch from './src/hooks/usePharmacySearch';
import useBackHandler from './src/hooks/useBackHandler';
import useMyPills from './src/hooks/useMyPills';

const STORAGE_KEY = 'MY_PILLS_JSON';
const ONBOARDING_KEY = 'HAS_SEEN_MEDICATION_ONBOARDING';

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [appMode, setAppMode] = useState('LOGIN');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  const [user, setUser] = useState({
    id: '',
    name: 'MEDI 사용자',
    email: '',
    profileImage: null,
    dogType: 'default',
  });

  const [selectedSupportPost, setSelectedSupportPost] = useState(null);
  const [writeBoardType, setWriteBoardType] = useState('free');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedBoardTitle, setSelectedBoardTitle] = useState('자유게시판');
  const [pillHistory, setPillHistory] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [voicePostDraft, setVoicePostDraft] = useState(null);
  const [selectedPill, setSelectedPill] = useState(null);
  const [hasSeenMedicationOnboarding, setHasSeenMedicationOnboarding] = useState(false);

  // 1. 알약 관련 훅 먼저 선언
  const {
    myPills,
    saveMyPills,
    ensurePillSchedule,
    togglePillAlarm,
    changePillAlarmTime,
    deletePill,
  } = useMyPills({ STORAGE_KEY });

  // 2. registerPillFromAiResponse 정의
  const registerPillFromAiResponse = useCallback(
    async (aiText) => {
      const responseText = typeof aiText === 'string' ? aiText : aiText?.rawText || '';

      const pillName =
        (typeof aiText === 'object' && aiText?.pillName) ||
        '알 수 없음';

      // ✅ AI가 예측한 스케줄 사용 (없으면 아침 기본값)
      const aiSchedule = (typeof aiText === 'object' && Array.isArray(aiText?.schedule))
        ? aiText.schedule
        : ['아침'];

      const LABEL_TIME_MAP = {
        '아침': '08:00',
        '점심': '12:00',
        '저녁': '18:00',
        '취침전': '21:00',
      };

      // ✅ AI 예측 스케줄 → 알람 시간 자동 설정
      const initialSchedules = aiSchedule.map(label => ({
        label,
        time: LABEL_TIME_MAP[label] || '08:00',
        notificationId: null,
        enabled: true,
        takenToday: false,
      }));

      const newPill = {
        id: Date.now().toString(),
        name: pillName,
        usage: aiText?.usage || '',
        warning: aiText?.warning || '',
        confidence: aiText?.confidence
          ? String(Math.round(Number(aiText.confidence) * 100))
          : '100',
        schedules: initialSchedules,
        alarmEnabled: true,  // ✅ 자동으로 알람 ON
        notificationId: null,
        createdAt: Date.now(),
      };

      const updated = [newPill, ...(myPills ?? [])];
      try {
        await saveMyPills(updated);
      } catch (e) {
        console.error('❌ saveMyPills 실패', e);
      }
      setAppMode('MY_PILL');
    },
    [myPills, saveMyPills]
  );

  // 3. 카메라 스캔 훅
  const {
    cameraRef,
    isAnalyzing,
    showResult,
    aiResponse,
    drugImageUrl,
    handleScan,
    handleRegisterPill,
    closeResult,
  } = useCameraScan({
    onRegisterPill: registerPillFromAiResponse,
  });

  // 4. 나머지 훅 및 핸들러
  const {
    nearbyPharmacies,
    isSearchingMap,
    findNearbyPharmacies,
    openKakaoMapDetail,
    makePhoneCall,
  } = usePharmacySearch();

  const handleUpdateProfile = async (updatedData) => {
    const newUser = {
      ...user,
      name: updatedData.nickname,
      profileImage: updatedData.profileImage,
      dogType: updatedData.dogType,
    };
    setUser(newUser);
    await SecureStore.setItemAsync('userName', updatedData.nickname);
    if (updatedData.profileImage) {
      await AsyncStorage.setItem('userProfileImage', updatedData.profileImage);
    }
  };

  const handleOpenBoard = (post, boardTitle = '자유게시판') => {
    setSelectedPost(post);
    setSelectedBoardTitle(boardTitle);
    setAppMode('BOARD');
  };

  const handleBackToCommunity = () => {
    setAppMode('COMMUNITY');
  };

  const handleMedicationOnboardingDone = async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      setHasSeenMedicationOnboarding(true);
    } catch (error) {
      console.error('온보딩 저장 실패:', error);
    }
  };

  const completeNextDose = useCallback(async () => {
    const allSchedules = myPills.flatMap((pill) =>
      (pill.schedules || []).map((schedule, index) => ({
        ...schedule,
        pillId: pill.id,
        pillName: pill.name,
        scheduleIndex: index,
      }))
    );
    const next = allSchedules
      .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
      .find((item) => !item.takenToday);

    if (!next) return;
    const updated = myPills.map((pill) => {
      if (pill.id !== next.pillId) return pill;
      return {
        ...pill,
        schedules: pill.schedules.map((s, i) =>
          i === next.scheduleIndex ? { ...s, takenToday: true } : s
        ),
      };
    });
    await saveMyPills(updated);
  }, [myPills, saveMyPills]);

  const toggleAllAlarms = useCallback(async (enabled) => {
    const updated = myPills.map(pill => ({ ...pill, alarmEnabled: enabled }));
    await saveMyPills(updated);
  }, [myPills, saveMyPills]);

  const deleteAllAlarms = useCallback(async () => {
    const updated = myPills.map(pill => ({
      ...pill,
      alarmEnabled: false,
      schedules: (pill.schedules || []).map(s => ({ ...s, notificationId: null, enabled: false }))
    }));
    await saveMyPills(updated);
  }, [myPills, saveMyPills]);

  const goAlarmFromPill = async (pillId) => {
    await ensurePillSchedule(pillId);
    setAppMode('ALARM');
  };

  // ✅ pillHistory 포맷 정규화 함수
  const handlePillHistoryUpdate = useCallback((newHistory) => {
    if (!Array.isArray(newHistory)) return;
    const normalized = newHistory.map(item => ({
      date: item.date || new Date().toISOString().slice(0, 10),
      time: item.time || '--:--',
      taken: item.taken ?? true,
      label: item.label || '복약',
      pillName: item.pill_name || item.pillName || '약',
      source: item.source || 'confirmed',
    }));
    setPillHistory(normalized);
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        setIsCheckingLogin(true);
        await initNotifications();
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        const accessToken = await SecureStore.getItemAsync('accessToken');
        const userId = await SecureStore.getItemAsync('userId');
        const userName = await SecureStore.getItemAsync('userName');
        const userEmail = await SecureStore.getItemAsync('userEmail');
        const seenOnboarding = await SecureStore.getItemAsync(ONBOARDING_KEY);
        const savedProfileImg = await AsyncStorage.getItem('userProfileImage');

        setHasSeenMedicationOnboarding(seenOnboarding === 'true');

        if (accessToken && userId) {
          setIsLoggedIn(true);
          await registerPushToken(userId);
          setUser({
            id: userId,
            name: userName || 'MEDI 사용자',
            email: userEmail || '',
            profileImage: savedProfileImg || null,
            dogType: 'default',
          });
        } else {
          setIsLoggedIn(false);
          setAppMode('LOGIN');
        }
      } catch (error) {
        setIsLoggedIn(false);
        setAppMode('LOGIN');
      } finally {
        setIsCheckingLogin(false);
      }
    };
    setup();
  }, []);

  useBackHandler({ appMode, setAppMode, showResult });

  if (isCheckingLogin) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </SafeAreaView>
    );
  }

  if (!isStarted) {
    return (
      <StartScreen
        onStart={() => {
          setIsStarted(true);
          setAppMode(isLoggedIn ? (hasSeenMedicationOnboarding ? 'HOME' : 'MEDICATION_ONBOARDING') : 'LOGIN');
        }}
        user={isLoggedIn ? user : null}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar backgroundColor="#F7F3DD" barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {appMode === 'REGISTER' ? (
            <RegisterScreen setAppMode={setAppMode} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
          ) : (
            <LoginScreen setAppMode={setAppMode} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#F7F3DD" barStyle="dark-content" />

      {appMode === 'HOME' && <HomeFloatingButton onPress={() => setAppMode('SCAN')} />}

      <View style={{ flex: 1 }}>
        {(() => {
          switch (appMode) {
            case 'HOME':
              return (
                <HomeScreen
                  setAppMode={setAppMode}
                  onPressMap={() => { setAppMode('MAP'); findNearbyPharmacies(); }}
                  isLoggedIn={isLoggedIn}
                  user={user}
                  myPills={myPills}
                  setIsLoggedIn={setIsLoggedIn}
                  setUser={setUser}
                />
              );
            case 'APP_INFO':
              return <AppInfoScreen setAppMode={setAppMode} />;
            case 'PROFILE_EDIT':
              return (
                <ProfileEditScreen
                  user={user}
                  onUpdateProfile={handleUpdateProfile}
                  onBack={() => setAppMode('MY_PAGE')}
                />
              );
            case 'MEDICATION_ONBOARDING':
              return (
                <MedicationOnboardingScreen
                  setAppMode={setAppMode}
                  onSelectYes={handleMedicationOnboardingDone}
                  onSelectNo={handleMedicationOnboardingDone}
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
                  selectedPill={selectedPill}
                  setSelectedPill={setSelectedPill}
                />
              );
            case 'MY_PILL_DETAIL':
              return (
                <MyPillDetailScreen
                  pill={selectedPill}
                  onToggleAlarm={goAlarmFromPill}
                  onDeletePill={deletePill}
                  setAppMode={setAppMode}
                />
              );
            case 'MAP':
              return (
                <MapScreen
                  setAppMode={setAppMode}
                  nearbyPharmacies={nearbyPharmacies}
                  findNearbyPharmacies={findNearbyPharmacies}
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
                  deletePill={deletePill}
                />
              );
            case 'HISTORY':
              // ✅ pillHistory 전달 추가
              return (
                <HistoryScreen
                  setAppMode={setAppMode}
                  pillHistory={pillHistory}
                />
              );
            case 'SEARCH_PILL':
              return (
                <SearchPillScreen
                  setAppMode={setAppMode}
                  initialKeyword={searchKeyword}
                  onSearch={() => setSearchKeyword('')}
                />
              );
            case 'COMMUNITY':
              return (
                <CommunityScreen
                  setAppMode={setAppMode}
                  onOpenBoard={handleOpenBoard}
                  setWriteBoardType={setWriteBoardType}
                />
              );
            case 'BOARD':
              return (
                <BoardScreen
                  setAppMode={setAppMode}
                  post={selectedPost}
                  boardTitle={selectedBoardTitle}
                  onBack={handleBackToCommunity}
                  currentUserName={user.nickname || user.name}  // ← user.id → user.name 으로 변경
                  onEditBoard={(post) => {
                    setSelectedPost(post);
                    setAppMode('EDIT_POST');
                  }}
                />
              );
            case 'EDIT_POST':
              return (
                <EditPostScreen
                  setAppMode={setAppMode}
                  post={selectedPost}
                />
              );
            case 'SUPPORT':
              return (
                <SupportMainScreen
                  setAppMode={setAppMode}
                  onOpenSupport={(item) => {
                    setSelectedSupportPost(item);
                    setAppMode('SUPPORT_DETAIL');
                  }}
                />
              );
            case 'SUPPORT_DETAIL':
              return (
                <SupportListScreen
                  post={selectedSupportPost}
                  onBack={() => setAppMode('SUPPORT')}
                  setAppMode={setAppMode}
                />
              );
            case 'SUPPORT_WRITE':
              return <SupportWriteScreen setAppMode={setAppMode} />;
            case 'MY_PAGE':
              return (
                <MyPageScreen
                  user={user}
                  myPills={myPills}
                  pillAlarms={myPills.flatMap((pill) => pill.schedules || [])}
                  onBack={() => setAppMode('HOME')}
                  onNavigate={(mode) => setAppMode(mode)}
                  onLogout={async () => {
                    await SecureStore.deleteItemAsync('accessToken');
                    setIsLoggedIn(false);
                    setAppMode('LOGIN');
                  }}
                />
              );
            case 'WRITE_BOARD':
              return (
                <WriteBoardScreen
                  setAppMode={setAppMode}
                  writeBoardType={writeBoardType}
                  voiceDraft={voicePostDraft}
                  onDraftUsed={() => setVoicePostDraft(null)}
                />
              );
            default:
              return (
                <HomeScreen
                  setAppMode={setAppMode}
                  isLoggedIn={isLoggedIn}
                  user={user}
                  myPills={myPills}
                />
              );
          }
        })()}
      </View>

      {/* 하단바 */}
      {!['LOGIN', 'REGISTER', 'MEDICATION_ONBOARDING', 'SCAN', 'START', 'APP_INFO', 'PROFILE_EDIT'].includes(appMode) && (
        <View style={appStyles.bottomBar}>
          <TouchableOpacity onPress={() => setAppMode('HOME')} style={appStyles.tabItem}>
            <Ionicons name="home" size={26} color={appMode === 'HOME' ? '#065809' : '#67A369'} />
            <Text style={[appStyles.tabText, { color: appMode === 'HOME' ? '#065809' : '#67A369' }]}>홈</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setAppMode('MAP'); findNearbyPharmacies(); }} style={appStyles.tabItem}>
            <Ionicons name="location" size={26} color={appMode === 'MAP' ? '#065809' : '#67A369'} />
            <Text style={[appStyles.tabText, { color: appMode === 'MAP' ? '#065809' : '#67A369' }]}>약국</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAppMode('SEARCH_PILL')} style={appStyles.tabItem}>
            <Ionicons name="search" size={26} color={appMode === 'SEARCH_PILL' ? '#065809' : '#67A369'} />
            <Text style={[appStyles.tabText, { color: appMode === 'SEARCH_PILL' ? '#065809' : '#67A369' }]}>검색</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAppMode('COMMUNITY')} style={appStyles.tabItem}>
            <Ionicons name="chatbubble-ellipses" size={26} color={appMode === 'COMMUNITY' ? '#065809' : '#67A369'} />
            <Text style={[appStyles.tabText, { color: appMode === 'COMMUNITY' ? '#065809' : '#67A369' }]}>커뮤니티</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAppMode('MY_PAGE')} style={appStyles.tabItem}>
            <Ionicons name="person" size={26} color={appMode === 'MY_PAGE' ? '#065809' : '#67A369'} />
            <Text style={[appStyles.tabText, { color: appMode === 'MY_PAGE' ? '#065809' : '#67A369' }]}>마이페이지</Text>
          </TouchableOpacity>
        </View>
      )}

      <MedieChatView
        appMode={appMode}
        setAppMode={setAppMode}
        onCompleteNextDose={completeNextDose}
        onChangeAlarmTime={changePillAlarmTime}
        onToggleAlarm={togglePillAlarm}
        onToggleAllAlarms={toggleAllAlarms}
        onDeleteAllAlarms={deleteAllAlarms}
        onSearchDrug={(keyword) => setSearchKeyword(keyword)}
        onWritePost={(draft) => setVoicePostDraft(draft)}
        myPills={myPills}
        pillHistory={pillHistory}
        // ✅ 포맷 정규화 핸들러
        onPillHistoryUpdate={handlePillHistoryUpdate}
      />
    </SafeAreaView>
  );
}

const appStyles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, fontWeight: '800', marginTop: 3 },
});