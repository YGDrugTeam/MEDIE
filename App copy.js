// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   SafeAreaView,
//   Alert,
//   View,
//   ActivityIndicator,
//   Text,
//   KeyboardAvoidingView,
//   Platform
// } from 'react-native';
// import * as SecureStore from 'expo-secure-store';
// import { initNotifications } from './src/services/notificationInit';
// import * as Notifications from 'expo-notifications';
// import { API_BASE } from './src/api/api';

// /* styles */
// import { styles } from './src/styles/commonStyles';

// /* components */
// import HomeFloatingButton from './src/components/HomeFloatingButton';
// import { MedieChatView } from './src/components/MedieChatView';

// /* screens */
// import StartScreen from './src/screens/StartScreen';
// import HomeScreen from './src/screens/HomeScreen';
// import ScanScreen from './src/screens/ScanScreen';
// import MyPillScreen from './src/screens/MyPillScreen';
// import MapScreen from './src/screens/MapScreen';
// import AlarmScreen from './src/screens/AlarmScreen';
// import HistoryScreen from './src/screens/HistoryScreen';
// import SearchPillScreen from './src/screens/SearchPillScreen';
// import CommunityScreen from './src/screens/CommunityScreen';
// import BoardScreen from './src/screens/BoardScreen';
// import LoginScreen from './src/screens/LoginScreen';
// import RegisterScreen from './src/screens/RegisterScreen';
// import WriteBoardScreen from './src/screens/WriteBoardScreen';
// import SupportMainScreen from './src/screens/SupportMainScreen';
// import SupportListScreen from './src/screens/SupportListScreen';
// import SupportWriteScreen from './src/screens/SupportWriteScreen';

// /* hooks */
// import useCameraScan from './src/hooks/useCameraScan';
// import usePharmacySearch from './src/hooks/usePharmacySearch';
// import useBackHandler from './src/hooks/useBackHandler';
// import useMyPills from './src/hooks/useMyPills';

// const STORAGE_KEY = 'MY_PILLS_JSON';

// export default function App() {
//   const [isStarted, setIsStarted] = useState(false);
//   const [appMode, setAppMode] = useState('HOME');
//   const [selectedSupportPost, setSelectedSupportPost] = useState(null);
//   const [writeBoardType, setWriteBoardType] = useState('free');

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState(null);
//   const [isCheckingLogin, setIsCheckingLogin] = useState(true);

//   const [selectedPost, setSelectedPost] = useState(null);
//   const [selectedBoardTitle, setSelectedBoardTitle] = useState('자유게시판');

//   const handleOpenBoard = (post, boardTitle = '자유게시판') => {
//     setSelectedPost(post);
//     setSelectedBoardTitle(boardTitle);
//     setAppMode('BOARD');
//   };

//   const handleBackToCommunity = () => {
//     setAppMode('COMMUNITY');
//   };

//   useEffect(() => {
//     const loadInitialState = async () => {
//       try {
//         const accessToken = await SecureStore.getItemAsync('access_token');
//         const userId = await SecureStore.getItemAsync('user_id');
//         const userName = await SecureStore.getItemAsync('user_name');
//         const userEmail = await SecureStore.getItemAsync('user_email');

//         if (accessToken && userId && userName && userEmail) {
//           setIsLoggedIn(true);
//           setUser({ id: userId, name: userName, email: userEmail });
//         }

//         const { status } = await initNotifications();
//         console.log('🔔 알림 권한:', status);
//         await Notifications.cancelAllScheduledNotificationsAsync();
//       } catch (e) {
//         console.error('초기 설정 실패:', e);
//       } finally {
//         setIsCheckingLogin(false);
//       }
//     };

//     loadInitialState();
//   }, []);

//   // 테스트용 서버 확인
//   useEffect(() => {
//     const testServer = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/health`);
//         const data = await res.json();
//         console.log('health check =', data);
//       } catch (error) {
//         console.log('서버 연결 실패', error);
//       }
//     };

//     testServer();
//   }, []);

//   const {
//     myPills,
//     saveMyPills,
//     ensurePillSchedule,
//     togglePillAlarm,
//     changePillAlarmTime,
//     deletePillAlarm,
//     deletePill,
//   } = useMyPills({ STORAGE_KEY });

//   const goAlarmFromPill = async (pillId) => {
//     await ensurePillSchedule(pillId);
//     setAppMode('ALARM');
//   };

//   const registerPillFromAiResponse = useCallback(
//     async (aiResponse) => {
//       const lines = aiResponse.split('\n');
//       const pillName =
//         lines.find((l) => l.includes('알약 이름'))?.replace('💊 알약 이름: ', '') || '알 수 없음';
//       const confidence =
//         lines.find((l) => l.includes('신뢰도'))?.replace('신뢰도: ', '').replace('%', '') || '0';
//       const usageIndex = lines.findIndex((l) => l.includes('📌 복용 목적'));
//       const warningIndex = lines.findIndex((l) => l.includes('⚠️ 주의사항'));
//       const usage =
//         usageIndex >= 0 && warningIndex >= 0
//           ? lines.slice(usageIndex + 1, warningIndex).join('\n')
//           : '';
//       const warning = warningIndex >= 0 ? lines.slice(warningIndex + 1).join('\n') : '';

//       const newPill = {
//         id: Date.now().toString(),
//         name: pillName,
//         usage,
//         warning,
//         confidence,
//         schedules: [{ time: '08:00', notificationId: null, enabled: true, takenToday: false }],
//         alarmEnabled: false,
//         notificationId: null,
//         createdAt: Date.now(),
//       };

//       const updated = [newPill, ...(myPills ?? [])];
//       try {
//         await saveMyPills(updated);
//       } catch (e) {
//         console.error('❌ saveMyPills 실패', e);
//         Alert.alert('저장 오류', '내 복용약 저장에 실패했습니다.');
//         return;
//       }

//       Alert.alert('등록 완료', '내 복용약으로 등록되었습니다.', [
//         {
//           text: '확인',
//           onPress: () => {
//             setAppMode('MY_PILL');
//           },
//         },
//       ]);
//     },
//     [myPills, saveMyPills]
//   );

//   const {
//     cameraRef,
//     isAnalyzing,
//     showResult,
//     aiResponse,
//     drugImageUrl,
//     handleScan,
//     handleRegisterPill,
//     closeResult,
//   } = useCameraScan({
//     onRegisterPill: registerPillFromAiResponse,
//   });

//   const {
//     nearbyPharmacies,
//     isSearchingMap,
//     findNearbyPharmacies,
//     openKakaoMapDetail,
//     makePhoneCall,
//   } = usePharmacySearch();

//   useBackHandler({ appMode, setAppMode, showResult });

//   if (!isStarted) {
//     return <StartScreen onStart={() => { setIsStarted(true); setAppMode('HOME'); }} />;
//   }

//   if (isCheckingLogin) {
//     return (
//       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#4A90E2" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{ flex: 1 }}
//       >
//         {appMode === 'HOME' && <HomeFloatingButton onPress={() => setAppMode('SCAN')} />}

//         <View style={{ flex: 1 }}>
//           {(() => {
//             switch (appMode) {
//               case 'HOME':
//                 return (
//                   <HomeScreen
//                     setAppMode={setAppMode}
//                     onPressMap={() => {
//                       setAppMode('MAP');
//                       findNearbyPharmacies();
//                     }}
//                     isLoggedIn={isLoggedIn}
//                     user={user}
//                     setIsLoggedIn={setIsLoggedIn}
//                     setUser={setUser}
//                   />
//                 );
//               case 'LOGIN':
//                 return <LoginScreen setAppMode={setAppMode} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;
//               case 'REGISTER':
//                 return <RegisterScreen setAppMode={setAppMode} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />;
//               case 'SCAN':
//                 return (
//                   <ScanScreen
//                     cameraRef={cameraRef}
//                     isAnalyzing={isAnalyzing}
//                     showResult={showResult}
//                     aiResponse={aiResponse}
//                     drugImageUrl={drugImageUrl}
//                     onScan={handleScan}
//                     onRegisterPill={handleRegisterPill}
//                     onCloseResult={closeResult}
//                     setAppMode={setAppMode}
//                   />
//                 );
//               case 'MY_PILL':
//                 return (
//                   <MyPillScreen
//                     setAppMode={setAppMode}
//                     myPills={myPills}
//                     onToggleAlarm={goAlarmFromPill}
//                     onDeletePill={deletePill}
//                   />
//                 );
//               case 'MAP':
//                 return (
//                   <MapScreen
//                     setAppMode={setAppMode}
//                     nearbyPharmacies={nearbyPharmacies}
//                     findNearbyPharmacies={findNearbyPharmacies}
//                     isSearchingMap={isSearchingMap}
//                     makePhoneCall={makePhoneCall}
//                     openKakaoMapDetail={openKakaoMapDetail}
//                   />
//                 );
//               case 'ALARM':
//                 return (
//                   <AlarmScreen
//                     myPills={myPills}
//                     setAppMode={setAppMode}
//                     togglePillAlarm={togglePillAlarm}
//                     changePillAlarmTime={changePillAlarmTime}
//                     deletePillAlarm={deletePillAlarm}
//                   />
//                 );
//               case 'HISTORY':
//                 return <HistoryScreen setAppMode={setAppMode} />;
//               case 'SEARCH_PILL':
//                 return <SearchPillScreen setAppMode={setAppMode} />;
//               case 'COMMUNITY':
//                 return (
//                   <CommunityScreen
//                     setAppMode={setAppMode}
//                     onOpenBoard={handleOpenBoard}
//                     setWriteBoardType={setWriteBoardType}
//                   />
//                 );
//               case 'BOARD':
//                 return (
//                   <BoardScreen
//                     setAppMode={setAppMode}
//                     post={selectedPost}
//                     boardTitle={selectedBoardTitle}
//                     onBack={handleBackToCommunity}
//                   />
//                 );
//               case 'SUPPORT':
//                 return (
//                   <SupportMainScreen
//                     setAppMode={setAppMode}
//                     onOpenSupport={(item) => {
//                       setSelectedSupportPost(item);
//                       setAppMode('SUPPORT_DETAIL');
//                     }}
//                   />
//                 );
//               case 'SUPPORT_DETAIL':
//                 return (
//                   <SupportListScreen
//                     post={selectedSupportPost}
//                     onBack={() => setAppMode('SUPPORT')}
//                     setAppMode={setAppMode}
//                   />
//                 );
//               case 'SUPPORT_WRITE':
//                 return <SupportWriteScreen setAppMode={setAppMode} />;
//               case 'WRITE_BOARD':
//                 return <WriteBoardScreen setAppMode={setAppMode} writeBoardType={writeBoardType} />;
//               default:
//                 return (
//                   <HomeScreen
//                     setAppMode={setAppMode}
//                     isLoggedIn={isLoggedIn}
//                     user={user}
//                     setIsLoggedIn={setIsLoggedIn}
//                     setUser={setUser}
//                   />
//                 );
//             }
//           })()}
//         </View>

//         <MedieChatView appMode={appMode} setAppMode={setAppMode} />
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }