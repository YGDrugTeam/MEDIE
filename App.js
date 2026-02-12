import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, Alert, Animated, Dimensions, Image, SafeAreaView, ActivityIndicator, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const SCAN_GUIDE_SIZE = width * 0.75;
// const API_URL = "https://mediclens-backend.azurewebsites.net/analyze";
const API_URL = "https://mediclens-backend.azurewebsites.net/pill/analyze";


// 🎨 캐릭터 이미지
const MASCOT_IMAGE = "https://i.postimg.cc/XJQN2c1M/image-4.jpg";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isStarted, setIsStarted] = useState(false);
  const [appMode, setAppMode] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [drugImageUrl, setDrugImageUrl] = useState(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const cameraRef = useRef(null);
  
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

  const playStartSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: 'https://www.soundjay.com/buttons/sounds/button-30.mp3' });
      await sound.playAsync();
    } catch (e) { console.log(e); }
  };

  const openGoogleMaps = (name, address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address)}`;
    Linking.openURL(url).catch(() => Alert.alert("오류", "구글맵을 열 수 없습니다."));
  };

  const makePhoneCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => Alert.alert("오류", "전화 연결 실패"));
  };

  const findNearbyPharmacies = async () => {
    setIsSearchingMap(true);
    try {
      await Location.requestForegroundPermissionsAsync();
      setTimeout(() => {
        setNearbyPharmacies([
          { id: 1, name: "중앙 24시 약국", dist: "350m", status: "영업중", phone: "02-123-4567", address: "서울특별시 종로구 세종대로 209" },
          { id: 2, name: "행복한 밤샘 약국", dist: "820m", status: "영업중", phone: "02-987-6543", address: "서울특별시 중구 세종대로 110" },
        ]);
        setIsSearchingMap(false);
      }, 1000);
    } catch (e) { setIsSearchingMap(false); }
  };

  // ... (위 import, state, UI 코드는 전부 동일)

const API_URL = "https://mediclens-backend.azurewebsites.net/pill/analyze";

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

    // ✅ 성공
    const pillName = data.analysis?.pill_name;
    const usage = data.analysis?.usage;
    const warning = data.analysis?.warning;
    const appearance = data.analysis?.appearance;

    setAiResponse(
      `알약 이름: ${pillName}\n` +
      `신뢰도: ${(data.confidence * 100).toFixed(1)}%\n\n` +
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
              playStartSound(); 
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

  if (appMode === 'SCAN') {
    return (
      <View style={styles.container}>
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
        <Modal visible={showResult} animationType="slide" transparent>
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
              
              <TouchableOpacity 
                style={styles.modalCloseBtn} 
                onPress={() => {
                  setShowResult(false); 
                  setDrugImageUrl(null);
                  Speech.stop();
                }}
              >
                <Text style={styles.modalCloseBtnText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // 📍 당번 약국
  if (appMode === 'MAP') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.subContainer}>
          <Text style={styles.mapHeader}>📍 내 주변 당번 약국</Text>
          {isSearchingMap ? (
            <ActivityIndicator size="large" color="#FF7F50" />
          ) : (
            <ScrollView style={styles.listScroll}>
              {nearbyPharmacies.map(p => (
                <View key={p.id} style={styles.dataCard}>
                  <View>
                    <Text style={styles.cardTitle}>{p.name}</Text>
                    <Text style={styles.cardSub}>{p.dist} | {p.status}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => makePhoneCall(p.phone)}>
                      <Text style={styles.actionIcon}>📞</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openGoogleMaps(p.name, p.address)}>
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

  // ⏰ 복약 알람
  if (appMode === 'ALARM') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.subContainer}>
          <Text style={styles.mapHeader}>⏰ 스마트 복약 알람</Text>
          <ScrollView style={styles.listScroll}>
            <View style={styles.dataCard}>
              <View>
                <Text style={styles.cardTitle}>신지로이드 정 (0.1mg)</Text>
                <Text style={styles.cardSub}>매일 오전 07:30 | 공복 복용</Text>
              </View>
              <Text style={styles.statusOn}>활성</Text>
            </View>
            <View style={styles.dataCard}>
              <View>
                <Text style={styles.cardTitle}>오메가3 영양제</Text>
                <Text style={styles.cardSub}>매일 오후 13:00 | 식후 30분</Text>
              </View>
              <Text style={styles.statusOn}>활성</Text>
            </View>
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
});