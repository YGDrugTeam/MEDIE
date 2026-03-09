import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, Alert, Animated, Dimensions, Image, SafeAreaView, ActivityIndicator, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { getRandomBytes } from 'expo-crypto';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Switch } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// 🔥 CryptoJS가 사용할 랜덤 엔진 연결
global.crypto = {
  getRandomValues: (typedArray) => {
    const bytes = getRandomBytes(typedArray.length);
    typedArray.set(bytes);
    return typedArray;
  },
};
import CryptoJS from 'crypto-js';

const DEVICE_ID = Device.modelId ?? 'unknown-device';

const AES_SECRET_KEY = 'MY_SUPER_SECRET_32BYTE_KEY'; 
const { width, height } = Dimensions.get('window');
const SCAN_GUIDE_SIZE = width * 0.75;
// const API_URL = "https://mediclens-backend.azurewebsites.net/analyze";
const API_URL = "https://mediclens-backend.azurewebsites.net/pill/analyze";


// 🎨 캐릭터 이미지
const MASCOT_IMAGE = "https://i.postimg.cc/XJQN2c1M/image-4.jpg";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isStarted, setIsStarted] = useState(false);
  const [appMode, setAppMode] = useState('HOME'); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [drugImageUrl, setDrugImageUrl] = useState(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [myPills, setMyPills] = useState([]);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [selectedPillForAlarm, setSelectedPillForAlarm] = useState(null);
  
  const cameraRef = useRef(null);
  

// 앱 시작 시 알림 권한 요청 (App.js 상단 useEffect)
  useEffect(() => {
  const init = async () => {
    if (!Device.isDevice) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pill-alarm', {
        name: '복약 알람',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 500, 500, 500],
      });
    }
  };
  init();
}, []);

// 앱 시작 or 카메라 화면 진입 시 권한 요청
useEffect(() => {
  (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
  })();
}, []);


// 알람파트
  // --------------------------------------------------------------------------------------


// ⏰ 알람 관련 상태
const [alarms, setAlarms] = useState([]);
const [showTimePicker, setShowTimePicker] = useState(false);
const [selectedAlarmId, setSelectedAlarmId] = useState(null);

// 🔔 알림 옵션
const [alarmSoundOn, setAlarmSoundOn] = useState(true);
const [alarmVibrateOn, setAlarmVibrateOn] = useState(true);

// 📊 복용 히스토리
const [pillHistory, setPillHistory] = useState([]);
  
  
  
  
  

  // 알람 저장 / 불러오기 (AsyncStorage)
const ALARM_KEY = 'PILL_ALARMS';
const HISTORY_KEY = 'PILL_HISTORY';

useEffect(() => {
  const load = async () => {
    const a = await AsyncStorage.getItem(ALARM_KEY);
    const h = await AsyncStorage.getItem(HISTORY_KEY);
    if (a) setAlarms(JSON.parse(a));
    if (h) setPillHistory(JSON.parse(h));
  };
  load();
}, []);

const saveAlarms = async (list) => {
  setAlarms(list);
  await AsyncStorage.setItem(ALARM_KEY, JSON.stringify(list));
};

const saveHistory = async (list) => {
  setPillHistory(list);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  };


// 시간 변경 (DateTimePicker)
  const onTimeChange = (event, date) => {
  setShowTimePicker(false);
  if (!date) return;

  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');

  const updated = alarms.map(a =>
    a.id === selectedAlarmId ? { ...a, time: `${hh}:${mm}` } : a
  );

  saveAlarms(updated);
  };
  

  // 복용 완료 처리 + 히스토리 기록
  const markAsTaken = async (alarm) => {
  const record = {
    pillName: alarm.pillName,
    scheduledTime: alarm.time,
    takenAt: new Date().toISOString(),
  };

  const updated = [record, ...pillHistory];
  saveHistory(updated);

  if (alarmVibrateOn) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }



    await syncHistoryToServer(record);
};
  
  

  

  // 알람 스케줄링 함수
const scheduleDailyAlarm = async ({
  pillName,
  time,          // "08:00"
  soundOn,
  vibrationOn,
}) => {
  try {
    console.log('🕒 scheduleDailyAlarm 호출', {
      pillName,
      time,
      soundOn,
      vibrationOn,
    });

    const [hour, minute] = time.split(':').map(Number);

    /** 🔔 Android 채널 생성 (필수) */
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pill-alarm', {
        name: '복약 알람',
        importance: Notifications.AndroidImportance.HIGH,
        sound: soundOn ? 'default' : undefined,
        vibrationPattern: vibrationOn ? [0, 500, 500, 500] : undefined,
        enableVibrate: vibrationOn,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    /** ✅ 핵심: trigger에 type + channelId */
    const trigger = Platform.select({
      android: {
        type: 'daily',
        hour,
        minute,
        channelId: 'pill-alarm',
      },
      ios: {
        hour,
        minute,
        repeats: true,
      },
    });

    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 복약 알림',
          body: `${pillName} 복용할 시간이에요`,
          sound: soundOn ? 'default' : undefined,
        },
        trigger,
      });

    console.log('✅ 알람 등록 성공', notificationId);
    return notificationId;
  } catch (e) {
    console.error('❌ scheduleDailyAlarm 실패');
    console.error(e);
    throw e;
  }
}


  
  // 알람 해제 (비활성화 시)
  const cancelAllAlarms = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  };
  
  // 알약 선택 → 알람 자동 생성
  const addAlarmFromMyPill = async (pillName) => {
  const newAlarm = {
    id: Date.now().toString(),
    pillName,
    time: '08:00',
    enabled: true,
  };

  const updated = [...alarms, newAlarm];
  saveAlarms(updated);
  };


  // 복용 기록 서버 전송
  const syncHistoryToServer = async (record) => {
  await fetch(`${API_URL}/api/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: DEVICE_ID,
      pill_name: record.pillName,
      scheduled_time: record.scheduledTime,
      taken_at: record.takenAt,
    }),
  });
};
  
// 서버 → 앱 히스토리 동기화
  const loadHistoryFromServer = async () => {
  const res = await fetch(`${API_URL}/api/history/${DEVICE_ID}`);
  const data = await res.json();
  saveHistory(data);
};
  
// ① 앱 최초 실행 시 (서버 → 앱 동기화)
  useEffect(() => {
  loadHistoryFromServer();
  }, []);
  

  // ② HISTORY 화면 들어갈 때 (최신화)
  useEffect(() => {
  if (appMode === 'HISTORY') {
    loadHistoryFromServer();
  }
  }, [appMode]);
  

// ALARM 화면 진입 시 자동 알람 생성
  useEffect(() => {
  if (appMode !== 'ALARM') return;
  if (!selectedPillForAlarm) return;

  const exists = alarms.find(
    a => a.pillName === selectedPillForAlarm.pillName
  );

  if (!exists) {
    const newAlarm = {
      id: Date.now().toString(),
      pillName: selectedPillForAlarm.pillName,
      time: '08:00',           // ✅ 기본 오전 8시
      notificationId: null,
    };

    saveAlarms([...alarms, newAlarm]);
  }
}, [appMode, selectedPillForAlarm]);


  // --------------------------------------------------------------------------------------

  // 🎭 캐릭터 애니메이션
  const mascotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotScale, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(mascotScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);


  // 📱 시작 화면 뒤로가기 버튼 막기----------------------------------------------------------------
  const backPressTime = useRef(0);

useEffect(() => {
  const onBackPress = () => {
    const now = Date.now();

    // 1️⃣ 결과 모달이 열려 있으면 → 모달만 닫기
    if (showResult) {
      setShowResult(false);
      Speech.stop();
      return true;
    }

    // 2️⃣ 스캔 화면이면 → HOME으로
    if (appMode === 'SCAN') {
      setAppMode('HOME');
      return true;
    }

    // 3️⃣ 서브 화면이면 → HOME으로
    if (['MAP', 'ALARM', 'FAMILY'].includes(appMode)) {
      setAppMode('HOME');
      return true;
    }

    // 4️⃣ HOME에서 뒤로가기 → 2번 눌러 종료
    if (appMode === 'HOME') {
      if (now - backPressTime.current < 2000) {
        BackHandler.exitApp(); // ✅ 앱 종료
        return true;
      }

      backPressTime.current = now;



      // ✅ Android에서만 Toast 사용
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        '한 번 더 누르면 앱이 종료됩니다',
        ToastAndroid.SHORT
      );
    }



      return true;
    }

    return false;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    onBackPress
  );

  return () => backHandler.remove();
}, [showResult, appMode]);
  
  
  
// 여기는 당번약국 파트----------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------

  const PHARM_API_URL =
  "https://mediclens-backend.azurewebsites.net/pharmacies/duty";
  


  const openKakaoMapDetail = (p) => {
  const query = encodeURIComponent(`${p.name}`);
  const url = `https://map.kakao.com/link/search/${query}`;
  Linking.openURL(url);
};


  const makePhoneCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => Alert.alert("오류", "전화 연결 실패"));
  };




 const findNearbyPharmacies = async () => {
  setIsSearchingMap(true);

  try {
    // 1️⃣ 위치 권한
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("위치 권한 필요", "위치 권한을 허용해주세요");
      return;
    }

    // 2️⃣ 현재 위치
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;

    // 🔥 3️⃣ reverse geocoding (핵심)
    const geo = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!geo || geo.length === 0) {
      Alert.alert("오류", "주소 정보를 가져올 수 없습니다");
      return;
    }

    const sido = geo[0].region;      // 서울특별시
    const sigungu = geo[0].district; // 관악구

    console.log("📍 위치 확인", {
      latitude,
      longitude,
      sido,
      sigungu,
    });

    // 4️⃣ 백엔드 호출
    const res = await axios.get(PHARM_API_URL, {
      params: {
        sido,
        sigungu,
        lat: latitude,
        lng: longitude,
      },
    });

    const items = res.data?.data ?? [];

    if (items.length === 0) {
      setNearbyPharmacies([]);
      return;
    }

    const pharmacies = items.map((p, idx) => ({
      id: idx,
      name: p.dutyName,
      dist: `${Math.round(p.distance)}m`,
      status: "영업중",
      phone: p.dutyTel1,
      address: p.dutyAddr,
      lat: p.wgs84Lat,
      lng: p.wgs84Lon,
    }
    
  )
  
);
    // console.log('전달할 약국명:', p);

    setNearbyPharmacies(pharmacies);

  } catch (e) {
    console.error("약국 조회 실패", e);
    Alert.alert("오류", "당번약국 정보를 불러오지 못했습니다");
  } finally {
    setIsSearchingMap(false);
  }
};
  


  
  // ------------------------------------------------------------------------------------------
  // 암호화 파트
  const STORAGE_KEY = 'MY_PILL_ENCRYPTED';
  const SECURE_KEY_NAME = 'MY_PILL_AES_KEY';

  // 🔐 최초 1회만 AES 키 생성
  const getOrCreateAESKey = async () => {
    let key = await SecureStore.getItemAsync(SECURE_KEY_NAME);

    if (!key) {
      key = CryptoJS.lib.WordArray.random(32).toString(); // 256bit
      await SecureStore.setItemAsync(SECURE_KEY_NAME, key);
    }

    return key;
};

const encryptPills = async (pillList) => {
  const key = await getOrCreateAESKey();
  const json = JSON.stringify(pillList);

  return CryptoJS.AES.encrypt(json, key).toString();
};

const decryptPills = async (cipherText) => {
  const key = await getOrCreateAESKey();

  const bytes = CryptoJS.AES.decrypt(cipherText, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  return JSON.parse(decrypted);
  };
  
  useEffect(() => {
  const loadMyPills = async () => {
    try {
      const encrypted = await AsyncStorage.getItem(STORAGE_KEY);
      if (!encrypted) return;

      const decrypted = await decryptPills(encrypted);
      setMyPills(decrypted);
    } catch (e) {
      console.error('알약 복원 실패', e);
    }
  };

  loadMyPills();
}, []);
  
  // ------------------------------------------------------------------------------------------


  // ... (위 import, state, UI 코드는 전부 동일)

// const API_URL = "https://mediclens-backend.azurewebsites.net/pill/analyze";

const handleScan = async () => {
  if (!cameraRef.current) return;

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  setIsAnalyzing(true);

  try {
    // 🔥 1️⃣ 사진 촬영 (base64 필요 없음)
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.5,
      skipProcessing: true,
    });

    console.log("📸 촬영된 이미지 URI:", photo.uri);

    // 🔥 2️⃣ multipart/form-data 생성
    const formData = new FormData();
    formData.append("file", {
      uri: photo.uri,
      name: "pill.jpg",
      type: "image/jpeg",
    });

    // 🔥 3️⃣ 서버 요청
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      // ⚠️ Content-Type 절대 넣지 마
    });

    const text = await response.text();
    console.log("🔥 서버 원본 응답:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("서버가 JSON을 반환하지 않았습니다");
    }

    // ❌ 알약 아님
    if (data.result === "NOT_MEDICINE") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "⚠️ 알약 인식 실패",
        "약을 인식할 수 없습니다.\n다시 촬영해주세요.",
        [{ text: "확인" }]
      );
      return;
    }

    // 🔐 안전 검증
const analysis = data.analysis;
const confidence = data.confidence;

// ❌ 알약 인식 실패 조건
if (
  !analysis ||
  !analysis.pill_name ||
  !analysis.usage ||
  !analysis.warning ||
  typeof confidence !== 'number' ||
  isNaN(confidence)
) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  Alert.alert(
    "⚠️ 알약 인식 실패",
    "알약을 인식하지 못했습니다.\n밝은 곳에서 약만 다시 촬영해주세요.",
    [{ text: "확인" }]
  );

  return; // 🔥 여기서 종료 (모달 안 뜸)
}

// ✅ 정상 데이터만 여기 도달
const pillName = analysis.pill_name;
const usage = analysis.usage;
const warning = analysis.warning;

setAiResponse(
  `💊 알약 이름: ${pillName}\n` +
  `신뢰도: ${(confidence * 100).toFixed(1)}%\n\n` +
  `📌 복용 목적\n${usage}\n\n` +
  `⚠️ 주의사항\n${warning}`
);

setShowResult(true);

    // 🔊 음성 안내
    Speech.speak("알약 분석이 완료되었습니다", {
      language: "ko-KR",
      rate: 0.9,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  } catch (error) {
    console.error("🔥 스캔 오류:", error);
    Alert.alert("오류", "서버 연결을 확인해주세요.");
  } finally {
    setIsAnalyzing(false);
  }
};

  
  // 🏠 오른쪽 상단 Home 아이콘 버튼
const HomeFloatingButton = () => {
  if (appMode === 'HOME' || !appMode) return null;

  return (
    <TouchableOpacity
      style={styles.homeFloatingBtn}
      onPress={() => setAppMode('HOME')}
      activeOpacity={0.8}
    >
      <Text style={styles.homeFloatingIcon}>🏠</Text>
    </TouchableOpacity>
  );
};

  // 🏠 메뉴 공통 뒤로가기 버튼
  const BackToMenuBtn = () => (
    <View style={styles.footerContainer}>
      <Text style={styles.betaText}>본 기능은 현재 Beta 서비스 중입니다.</Text>
      <TouchableOpacity style={styles.backBtnBottom} onPress={() => setAppMode('HOME')}>
        <LinearGradient colors={['#FF7F50', '#FF4500']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.backGradient}>
          <Text style={styles.backBtnTextBold}>메뉴로 돌아가기</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const handleRegisterPill = async () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  const lines = aiResponse.split('\n');

  const pillName =
    lines.find(l => l.includes('알약 이름'))?.replace('💊 알약 이름: ', '') || '알 수 없음';

  const confidence =
    lines.find(l => l.includes('신뢰도'))?.replace('신뢰도: ', '').replace('%', '') || '0';

  const usageIndex = lines.findIndex(l => l.includes('📌 복용 목적'));
  const warningIndex = lines.findIndex(l => l.includes('⚠️ 주의사항'));

  const usage = lines.slice(usageIndex + 1, warningIndex).join('\n');
  const warning = lines.slice(warningIndex + 1).join('\n');

  const newPill = {
  id: uuidv4(),
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
  createdAt: Date.now(),
  };

  const updated = [...myPills, newPill];
  setMyPills(updated);

  // 🔐 암호화 저장
  const encrypted = await encryptPills(updated);
  await AsyncStorage.setItem(STORAGE_KEY, encrypted);

  Alert.alert('등록 완료', '내 복용약으로 등록되었습니다.', [
    { text: '확인', onPress: () => setShowResult(false) },
  ]);
  };
  




  // 📱 시작 화면
  if (!isStarted) {
    return (
      <View style={styles.startContainer}>
        <LinearGradient colors={['#F3E5F5', '#FFF9C4', '#E8EAF6']} style={styles.fullGradient}>
          <View style={styles.mainContent}>
            {/* 🎨 캐릭터 */}
            <Animated.View style={{ transform: [{ scale: mascotScale }] }}>
              <Image 
                source={{ uri: MASCOT_IMAGE }} 
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Text style={styles.brandTitle}>MEDIC LENS</Text>
            <Text style={styles.teamText}>Team YG</Text>
            <View style={styles.divider} />
            <Text style={styles.slogan}>약을 약(樂)답게,{"\n"}당신의 건강한 일상을 비추는 렌즈</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.premiumBtn} 
            onPress={() => { 
              setIsStarted(true); 
              setAppMode('HOME'); 
            }}
          >
            <Text style={styles.premiumBtnText}>분석 시작하기</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  if (appMode === 'HOME') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#F3E5F5', '#E8EAF6']} style={styles.menuContainer}>
          
          {/* 💊 내 복용중 알약 버튼 (HOME 전용 / 우상단) */}
          <TouchableOpacity
            style={styles.myPillButton}
            activeOpacity={0.85}
            onPress={() => setAppMode('MY_PILL')}
          >
            <Text style={styles.myPillText}>내 복용중 알약</Text>
          </TouchableOpacity>

          <View style={styles.menuHeaderWrapper}>
            <Text style={styles.menuHeader}>무엇을 도와드릴까요?</Text>
            <View style={styles.headerUnderline} />
          </View>
          <View style={styles.menuGrid}>
            {[
              { id: 'SCAN', label: '카메라 스캔', icon: '📸' },
              { id: 'MAP', label: '당번 약국', icon: '📍' },
              { id: 'ALARM', label: '복약 알람', icon: '⏰' },
              { id: 'FAMILY', label: '가족 케어', icon: '👨‍👩‍👧' },
            ].map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.menuItem} 
                onPress={() => { 
                  setAppMode(item.id); 
                  if(item.id === 'MAP') findNearbyPharmacies(); 
                }}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }











// =======================================================================================================
















if (appMode === 'MY_PILL') {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F3E5F5', '#E8EAF6']} style={styles.subContainer}>

        <Text style={styles.mapHeader}>💊 내 복용중 알약</Text>

        {myPills.length === 0 ? (
          <View style={{ marginTop: 80, alignItems: 'center', opacity: 0.6 }}>
            <Text style={{ fontSize: 15 }}>등록된 알약이 없습니다</Text>
            <Text style={{ fontSize: 13, marginTop: 6 }}>
              약을 스캔 후 복용 알약으로 등록해보세요 🙂
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.listScroll}>
            {myPills.map((pill, idx) => (
              <View key={idx} style={styles.dataCard}>

                {/* 왼쪽 정보 영역 */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{pill.name}</Text>
                  <Text style={styles.cardSub}>신뢰도 {pill.confidence}%</Text>

                  <Text style={{ marginTop: 10, fontSize: 13, fontWeight: 'bold' }}>
                    📌 복용 목적
                  </Text>
                  <Text style={{ fontSize: 14, marginTop: 4 }}>
                    {pill.usage}
                  </Text>

                  <Text style={{ marginTop: 10, fontSize: 13, fontWeight: 'bold', color: '#D32F2F' }}>
                    ⚠️ 주의사항
                  </Text>
                  <Text style={{ fontSize: 14, marginTop: 4, color: '#D32F2F' }}>
                    {pill.warning}
                  </Text>

                  {/* 🔔 복약 알람 영역 (3번) */}
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>
                      ⏰ 복약 알람
                    </Text>

                    <Text style={{ marginTop: 4, fontSize: 14 }}>
                      매일 {pill.schedules[0].time}
                    </Text>

                    <TouchableOpacity
                      style={{ marginTop: 6 }}
                      onPress={async () => {
                        try {
                          const updated = [...myPills];

                        // 🔥 기존 알람 있으면 취소
                          if (pill.notificationId) {
                            await Notifications.cancelScheduledNotificationAsync(
                              pill.notificationId
                            );
                          }
                          
                          // 🔔 알람 켜기
                          if (!pill.alarmEnabled) {
                            const time = pill.schedules[0].time;

                            const notificationId = await scheduleDailyAlarm({
                              pillName: pill.name,
                              time,
                              soundOn: true,
                              vibrationOn: true,
                            });

                            updated[idx] = {
                            ...pill,
                            alarmEnabled: true,
                            notificationId,
                          };
                          }
                          // 🔕 알람 끄기
                          else {
                            if (pill.notificationId) {
                              await Notifications.cancelScheduledNotificationAsync(
                                pill.notificationId
                              );
                            }

                            updated[idx] = {
                              ...pill,
                              alarmEnabled: false,
                              notificationId: null,
                            };
                          }

                          setMyPills(updated);
                          const encrypted = await encryptPills(updated);
                          await AsyncStorage.setItem(STORAGE_KEY, encrypted);

                        } catch (e) {
                          console.error('알람 설정 오류', e);
                          Alert.alert('오류', '알람 설정 중 문제가 발생했습니다.');
                        }
                      }}
                    >
                      <Text style={{ fontSize: 14, color: '#5E35B1' }}>
                        {pill.alarmEnabled ? '🔕 알람 끄기' : '🔔 알람 켜기'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 🗑️ 삭제 버튼 (4번: 알람까지 같이 정리) */}
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      '삭제',
                      '이 알약을 목록에서 제거할까요?',
                      [
                        { text: '취소', style: 'cancel' },
                        {
                          text: '삭제',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              // 🔔 알람 취소
                              if (pill.notificationId) {
                                await Notifications.cancelScheduledNotificationAsync(
                                  pill.notificationId
                                );
                              }

                              // 목록에서 제거
                              const updatedPills =
                                myPills.filter((_, i) => i !== idx);

                              setMyPills(updatedPills);

                              const encrypted =
                                await encryptPills(updatedPills);
                              await AsyncStorage.setItem(
                                STORAGE_KEY,
                                encrypted
                              );
                            } catch (e) {
                              console.error('알약 삭제 실패', e);
                              Alert.alert(
                                '오류',
                                '알약 삭제 중 문제가 발생했습니다.'
                              );
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={{ fontSize: 18, marginLeft: 10 }}>🗑️</Text>
                </TouchableOpacity>

              </View>
            ))}
          </ScrollView>
        )}

        <BackToMenuBtn />
      </LinearGradient>
    </SafeAreaView>
  );
}

  























  



  

  // ==================================================================================================










  if (appMode === 'SCAN') {
    return (
      <View style={styles.container}>
        {/* <HomeFloatingButton />   */}
        <CameraView style={styles.camera} facing="back" ref={cameraRef} />
        <View style={styles.maskOverlay}>
          <View style={styles.maskFrameTop} />
          <View style={styles.maskRow}>
            <View style={styles.maskFrameSide} />
            <View style={styles.whiteScanGuide}>
               <Text style={styles.scanGuideTitle}>MEDIC LENS</Text>
               <Text style={styles.scanGuideTeam}>YG Team</Text>
               <Text style={styles.scanGuideHint}>약을 여기에 위치시키세요</Text>
            </View>
            <View style={styles.maskFrameSide} />
          </View>
          <View style={styles.maskFrameBottom} />
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => setAppMode('HOME')}>
          <Text style={styles.backBtnText}>← 메뉴</Text>
        </TouchableOpacity>
        <View style={styles.bottomOverlay}>
          <TouchableOpacity 
            style={[styles.premiumScanBtn, isAnalyzing && styles.scanBtnDisabled]} 
            onPress={handleScan} 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.premiumScanBtnText}>약 스캔하기</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* 📊 결과 모달 */}
        <Modal visible={showResult} animationType="slide" transparent
          onRequestClose={() => {
          setShowResult(false);
          Speech.stop();
          return true;
          }}
          >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>💊 AI 분석 결과</Text>
              
              {/* 약물 이미지 (있는 경우만 표시) */}
              {drugImageUrl && (
                <Image 
                  source={{ uri: drugImageUrl }} 
                  style={styles.resultImage}
                  onError={() => setDrugImageUrl(null)} // 로드 실패 시 숨김
                />
              )}
              
              <ScrollView style={styles.scrollContainer}>
                <Text style={styles.resultBody}>{aiResponse}</Text>
              </ScrollView>
              
                <View style={styles.modalButtonRow}>

                {/* 왼쪽 버튼 */}
                <TouchableOpacity
                  style={[styles.modalActionBtn, styles.secondaryBtn]}
                  onPress={handleRegisterPill}
                >
                  <Text style={styles.secondaryBtnText}>복용 알약 등록</Text>
                </TouchableOpacity>

                {/* 오른쪽 버튼 */}
                <TouchableOpacity
                  style={[styles.modalActionBtn, styles.primaryBtn]}
                  onPress={() => {
                    setShowResult(false);
                    Speech.stop();
                  }}
                >
                  <Text style={styles.primaryBtnText}>확인</Text>
                </TouchableOpacity>

                </View>


            </View>
          </View>
        </Modal>
      </View>
    );
  }

















// --------------------------------------------------------------------------------------------------------
















  // 📍 당번 약국
if (appMode === 'MAP') {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <HomeFloatingButton />   */}
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>📍 내 주변 당번 약국</Text>

        {isSearchingMap ? (
          // 🔄 로딩 중
          <ActivityIndicator size="large" color="#FF7F50" />
        ) : nearbyPharmacies.length === 0 ? (
          // 🚨 영업중 약국 없음
          <Text
            style={{
              textAlign: 'center',
              color: '#999',
              marginTop: 40,
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            현재 시간 기준으로{'\n'}
            영업 중인 당번약국이 없습니다.
          </Text>
        ) : (
          // ✅ 영업중 약국 리스트
          <ScrollView style={styles.listScroll}>
            {nearbyPharmacies.map(p => (
              <View key={p.id} style={styles.dataCard}>
                <View>
                  <Text style={styles.cardTitle}>{p.name}</Text>
                  <Text style={styles.cardSub}>
                    {p.dist} | {p.status}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  
                  <TouchableOpacity onPress={() => makePhoneCall(p.phone)}>
                    <Text style={styles.actionIcon}>📞</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => openKakaoMapDetail(p)}>
                    <Text style={styles.actionIcon}>🗺️</Text>
                  </TouchableOpacity>

                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <BackToMenuBtn />
      </View>
    </SafeAreaView>
  );
}

  









// -------------------------------------------------------------------------------------------------------------










  
  // ⏰ 복약 알람
if (appMode === 'ALARM') {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>⏰ 복약 알람</Text>

        {/* 🔧 옵션 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => setAlarmSoundOn(v => !v)}>
            <Text>🔊 소리 {alarmSoundOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAlarmVibrateOn(v => !v)}>
            <Text>📳 진동 {alarmVibrateOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ marginTop: 20 }}>
          {alarms.map(a => (
            <View key={a.id} style={styles.dataCard}>
              <View>
                <Text style={styles.cardTitle}>{a.pillName}</Text>

                {/* ⏰ 시간 누르면 TimePicker */}
                <TouchableOpacity
                  onPress={() => {
                    console.log('🕒 알람 시간 클릭', a);
                    setSelectedAlarmId(a.id);
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.cardSub}>⏰ {a.time}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => markAsTaken(a)}>
                <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  복용 완료
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* ⏱️ 시간 선택 */}
        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            is24Hour
            onChange={async (event, selectedDate) => {
              console.log('⏱️ TimePicker onChange', event, selectedDate);
              setShowTimePicker(false);

              if (event.type === 'dismissed') {
                console.log('⛔ TimePicker dismissed');
                return;
              }

              if (!selectedDate) {
                console.log('⛔ selectedDate 없음');
                return;
              }

              try {
                // 1️⃣ 선택된 알람 찾기
                const alarm = alarms.find(a => a.id === selectedAlarmId);
                if (!alarm) {
                  throw new Error('선택된 알람을 찾을 수 없음');
                }

                console.log('📌 선택된 알람', alarm);

                // 2️⃣ 시간 문자열 만들기
                const hh = selectedDate.getHours().toString().padStart(2, '0');
                const mm = selectedDate.getMinutes().toString().padStart(2, '0');
                const timeStr = `${hh}:${mm}`;

                console.log('🕒 설정할 시간:', timeStr);

                // 3️⃣ 기존 알람 취소
                if (alarm.notificationId) {
                  console.log('🔕 기존 알람 취소:', alarm.notificationId);
                  await Notifications.cancelScheduledNotificationAsync(
                    alarm.notificationId
                  );
                }

                // 4️⃣ 새 알람 등록
                console.log('🔔 새 알람 등록 시도');
                const notificationId = await scheduleDailyAlarm({
                  pillName: alarm.pillName,
                  time: timeStr,
                  soundOn: alarmSoundOn,
                  vibrationOn: alarmVibrateOn,
                });

                console.log('✅ 알람 등록 성공:', notificationId);

                // 5️⃣ alarms 업데이트
                const updatedAlarms = alarms.map(a =>
                  a.id === selectedAlarmId
                    ? { ...a, time: timeStr, notificationId }
                    : a
                );

                console.log('💾 alarms 저장', updatedAlarms);
                saveAlarms(updatedAlarms);

                Alert.alert(
                  '알람 설정 완료',
                  `${alarm.pillName} 알람이 ${timeStr}에 설정되었습니다`
                );
              } catch (e) {
                console.error('🔥 알람 시간 변경 실패');
                console.error(e);
                console.error('message:', e?.message);
                console.error('stack:', e?.stack);

                Alert.alert(
                  '알람 오류',
                  '알람 설정 중 문제가 발생했습니다.\n콘솔 로그를 확인해주세요.'
                );
              }
            }}
          />
        )}

        <BackToMenuBtn />
      </View>
    </SafeAreaView>
  );
}
  
  













// ----------------------------------------------------------------------------------------------------------




  
  // HISTORY 화면
  if (appMode === 'HISTORY') {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>📊 복용 기록</Text>

        <ScrollView>
          {pillHistory.length === 0 && (
            <Text>복용 기록이 없습니다</Text>
          )}

          {pillHistory.map(h => (
            <View key={h.takenAt} style={styles.dataCard}>
              <Text style={styles.cardTitle}>{h.pillName}</Text>
              <Text style={styles.cardSub}>
                {new Date(h.takenAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>

        <BackToMenuBtn />
      </View>
    </SafeAreaView>
  );
}

    














    
  // 👨‍👩‍👧 가족 케어
  if (appMode === 'FAMILY') {
    return (
      <SafeAreaView style={styles.safeArea}>
        

        <View style={styles.subContainer}>
          <Text style={styles.mapHeader}>👨‍👩‍👧 가족 케어 모드</Text>
          <ScrollView style={styles.listScroll}>
            <View style={styles.dataCard}>
              <View>
                <Text style={styles.cardTitle}>아버님 (고혈압약)</Text>
                <Text style={styles.cardSub}>오늘 오전 08:15 복용 완료 ✅</Text>
              </View>
            </View>
            <View style={styles.dataCard}>
              <View>
                <Text style={styles.cardTitle}>어머님 (관절 영양제)</Text>
                <Text style={styles.cardSub}>아직 복용 전입니다 ⚠️</Text>
              </View>
              <TouchableOpacity style={styles.remindBtn}>
                <Text style={styles.remindText}>재촉하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <BackToMenuBtn />
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// ----------------------------------------------------------------------------------------------------


/**
 * 식약처 e-약은요 API 검색
 * @param {string} itemName - 약 이름
 * @returns {Promise<Object>} 검색 결과
 */
async function searchDrug(itemName) {
  const res = await fetch(
    `https://mediclens-backend.azurewebsites.net/drugs/search?itemName=${encodeURIComponent(itemName)}`
  );
  return res.json();
}



// -----------------------------------------------------------------------------------------------------







const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1, backgroundColor: '#F3E5F5' },
  subContainer: { flex: 1, padding: 25 },
  startContainer: { flex: 1 },
  fullGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  mainContent: { alignItems: 'center', marginBottom: 60 },
  
  // 🎨 캐릭터
  mascotImage: {
    width: 180,
    height: 180,
    marginBottom: 30,
    borderRadius: 90,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  brandTitle: { fontSize: 44, letterSpacing: 10, fontWeight: '200', color: '#333' },
  teamText: { fontSize: 18, fontWeight: '300', color: '#555', marginTop: 8 },
  divider: { width: 40, height: 1, backgroundColor: '#333', marginVertical: 30 },
  slogan: { fontSize: 15, fontWeight: '300', color: '#666', textAlign: 'center', lineHeight: 28 },
  
  premiumBtn: { 
    paddingHorizontal: 50, 
    paddingVertical: 20, 
    borderWidth: 0.5, 
    borderColor: '#333',
    marginBottom: 40 
  },
  premiumBtnText: { letterSpacing: 5, fontSize: 14, color: '#333' },

  menuContainer: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  menuHeaderWrapper: { marginBottom: 40, alignItems: 'center' },
  menuHeader: { fontSize: 26, fontWeight: '200', color: '#333' },
  headerUnderline: { width: 30, height: 1, backgroundColor: '#333', marginTop: 15 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  menuItem: { 
    width: width * 0.35, 
    height: width * 0.35, 
    backgroundColor: '#fff', 
    margin: 12, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5 
  },
  menuIcon: { fontSize: 38, marginBottom: 10 }, 
  menuLabel: { fontSize: 14, fontWeight: 'bold' },

  camera: { flex: 1 },
  maskOverlay: { ...StyleSheet.absoluteFillObject },
  maskRow: { flexDirection: 'row', height: SCAN_GUIDE_SIZE },
  maskFrameTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  maskFrameBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  maskFrameSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  whiteScanGuide: { 
    width: SCAN_GUIDE_SIZE, 
    height: SCAN_GUIDE_SIZE, 
    borderWidth: 1.5, 
    borderColor: '#fff', 
    borderRadius: SCAN_GUIDE_SIZE/2, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scanGuideTitle: { fontSize: 24, color: '#fff', fontWeight: '100', letterSpacing: 6 },
  scanGuideTeam: { fontSize: 14, color: '#fff', fontWeight: '200', marginTop: 10 },
  scanGuideHint: { fontSize: 11, color: '#FFF59D', marginTop: 15, textAlign: 'center', paddingHorizontal: 40 },

  mapHeader: { fontSize: 22, fontWeight: '200', marginBottom: 25 },
  listScroll: { flex: 1 },
  dataCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15, 
    elevation: 4, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  cardSub: { fontSize: 13, color: '#FF7F50', marginTop: 5 },
  cardActions: { flexDirection: 'row' },
  actionIcon: { fontSize: 22, marginLeft: 15 },
  statusOn: { color: '#4CAF50', fontWeight: 'bold' },
  remindBtn: { backgroundColor: '#F3E5F5', padding: 8, borderRadius: 10 },
  remindText: { fontSize: 12, fontWeight: 'bold' },

  footerContainer: { alignItems: 'center', marginTop: 10 },
  betaText: { fontSize: 12, color: '#888', marginBottom: 15 },
  backBtnBottom: { width: '100%' },
  backGradient: { paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
  backBtnTextBold: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  backBtn: { position: 'absolute', top: 60, left: 20 },
  backBtnText: { color: '#fff', fontSize: 16 },
  bottomOverlay: { position: 'absolute', bottom: 80, width: '100%', alignItems: 'center' },
  premiumScanBtn: { 
    backgroundColor: '#FF7F50', 
    paddingHorizontal: 60, 
    paddingVertical: 20, 
    borderRadius: 40,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
  premiumScanBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 30, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    maxHeight: '85%' 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#FF7F50' },
  resultImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 15 },
  scrollContainer: { maxHeight: 300, marginBottom: 15 },
  resultBody: { fontSize: 15, lineHeight: 24, color: '#333' },
  modalCloseBtn: { 
    marginTop: 10, 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#FF7F50', 
    borderRadius: 15 
  },
  modalCloseBtnText: { fontWeight: 'bold', color: '#fff', fontSize: 16 }
  // 
  ,
  modalButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 15,
},

modalActionBtn: {
  flex: 1,
  paddingVertical: 15,
  borderRadius: 15,
  alignItems: 'center',
},

secondaryBtn: {
  backgroundColor: '#F3E5F5',
  marginRight: 10,
},

primaryBtn: {
  backgroundColor: '#FF7F50',
  marginLeft: 10,
},

secondaryBtnText: {
  color: '#FF7F50',
  fontWeight: 'bold',
  fontSize: 15,
},

primaryBtnText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 15,
  },
homeFloatingBtn: {
  position: 'absolute',
  top: Platform.OS === 'android' ? 50 : 15,
  right: 16,
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 6,
  zIndex: 999,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
},

homeFloatingIcon: {
  fontSize: 20,
  },
myPillButton: {
  position: 'absolute',
  top: 15,
  right: 20,
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  zIndex: 10,
},

myPillText: {
  fontSize: 13,
  fontWeight: 'bold',
  color: '#FF7F50',
},
  
});