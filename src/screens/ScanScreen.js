import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0F140F',
  primary: '#065809',
  primaryLight: '#67A369',
  secondary: '#8BBC8E',
  soft: '#EEF7EE',
  border: '#D9E8D7',
  white: '#FFFFFF',
  text: '#222222',
  subText: '#6F786C',
  modalBg: '#FCFFF9',
};

export default function ScanScreen({
  cameraRef,
  isAnalyzing,
  showResult,
  aiResponse,
  drugImageUrl,
  onScan,
  onRegisterPill,
  onCloseResult,
  setAppMode,
}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [manualName, setManualName] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          '카메라 권한 필요',
          '알약 스캔을 위해 카메라 권한을 허용해주세요.'
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      spinAnim.setValue(0);
      const loopAnimation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loopAnimation.start();
      return () => {
        loopAnimation.stop();
      };
    } else {
      spinAnim.stopAnimation();
    }
  }, [isAnalyzing, spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const parsedResult = useMemo(() => {
    if (!aiResponse) return null;
    if (typeof aiResponse === 'object') {
      return {
        pillName: aiResponse?.pillName || '알 수 없는 약',
        schedule: Array.isArray(aiResponse?.schedule) ? aiResponse.schedule : ['아침'],
        confidence: aiResponse?.confidence || 90,
        rawText: aiResponse?.rawText || '',
        usage: aiResponse?.usage || '',
        caution: aiResponse?.caution || '',
      };
    }
    const text = String(aiResponse);
    const pillNameMatch = text.match(/알약 이름[:：]?\s*(.+)/);
    const confidenceMatch = text.match(/신뢰도[:：]?\s*([\d.]+%?)/);
    let usage = '';
    let caution = '';
    if (text.includes('📌 복용 목적')) {
      const usagePart = text.split('📌 복용 목적')[1];
      if (usagePart) usage = usagePart.split('⚠️ 주의사항')[0]?.trim() || '';
    }
    if (text.includes('⚠️ 주의사항')) {
      const cautionPart = text.split('⚠️ 주의사항')[1];
      if (cautionPart) caution = cautionPart.trim();
    }
    const schedule = [];
    if (text.includes('아침')) schedule.push('아침');
    if (text.includes('점심')) schedule.push('점심');
    if (text.includes('저녁')) schedule.push('저녁');
    return {
      pillName: pillNameMatch?.[1]?.trim() || '알 수 없는 약',
      schedule: schedule.length > 0 ? schedule : ['아침'],
      confidence: confidenceMatch?.[1]?.trim() || '90%',
      rawText: text,
      usage: usage || '복용 목적 정보가 없습니다.',
      caution: caution || '주의사항 정보가 없습니다.',
    };
  }, [aiResponse]);

  // 1. AI 결과 등록 함수
  const handleConfirm = async () => {
    console.log("📍 AI 등록 시도 중...");
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://20.106.40.121/pills/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: parsedResult?.pillName,
          schedule: parsedResult?.schedule,
          source: 'ai',
        }),
      });

      const result = await response.json();
      console.log("📍 서버 응답:", result);

      // 서버 응답이 성공(true)이거나 데이터 객체가 오면 성공 처리
      if (result) {
        Alert.alert('등록 완료', `${parsedResult?.pillName} 등록을 완료했어요! 멍!`);
        onRegisterPill?.();
        onCloseResult();
        setAppMode('HOME'); // 등록 후 홈으로 이동
      }
    } catch (error) {
      console.error("❌ handleConfirm 에러:", error);
      Alert.alert('오류', '등록에 실패했어요. 네트워크를 확인해주세요.');
    }
  };

  // 2. 수동 등록 함수
  const handleManualSubmit = async () => {
    if (!manualName.trim()) {
      Alert.alert('입력 확인', '약 이름을 입력해주세요.');
      return;
    }

    try {
      console.log("📍 수동 등록 시도 중...");
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://20.106.40.121/pills/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: manualName,
          schedule: parsedResult?.schedule || ['아침'],
          source: 'manual',
        }),
      });

      const result = await response.json();
      if (result) {
        Alert.alert('등록 완료', `${manualName} 등록을 완료했어요! 멍멍!`);
        setManualName('');
        setShowManualInput(false);
        onRegisterPill?.();
        onCloseResult();
        setAppMode('HOME'); // 등록 후 홈으로 이동
      }
    } catch (error) {
      console.error("❌ handleManualSubmit 에러:", error);
      Alert.alert('오류', '서버와 연결할 수 없습니다.');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionWrap}>
        <ActivityIndicator color={COLORS.primaryLight} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionWrap}>
        <Text style={styles.permissionText}>카메라 권한이 꺼져 있어요.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={() => setAppMode('HOME')}>
          <Text style={styles.permissionBtnText}>홈으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} />
      <View style={styles.dimLayer} />
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setAppMode('HOME')}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}  // ✅ 추가
        >
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>약 스캔</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.maskOverlay}>
        <View style={styles.scanFrame}>
          <Text style={styles.scanGuideTitle}>SCAN YOUR PILL</Text>
          <Text style={styles.scanGuideHint}>알약을 가이드 안에 맞춰주세요</Text>
        </View>
      </View>
      <View style={styles.bottomOverlay}>
        <Text style={styles.bottomCaption}>선명하게 보이도록 약을 중앙에 맞춰주세요</Text>
        <TouchableOpacity
          style={[styles.scanButton, isAnalyzing && styles.scanButtonDisabled]}
          onPress={onScan}
          disabled={isAnalyzing}
          activeOpacity={0.9}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.scanButtonText}> 분석 중...</Text>
            </>
          ) : (
            <>
              <Ionicons name="camera-outline" size={18} color="#fff" />
              <Text style={styles.scanButtonText}> 스캔 시작</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <Animated.View style={[styles.loadingLogoWrap, { transform: [{ rotate }] }]}>
            <Image source={require('../../assets/MASCOT_IMG.png')} style={styles.loadingLogo} resizeMode="contain" />
          </Animated.View>
          <Text style={styles.loadingTitle}>알약을 분석하고 있어요</Text>
          <Text style={styles.loadingDesc}>잠시만 기다려주세요. 복용 시간까지 함께 추정 중이에요.</Text>
        </View>
      )}

      <Modal visible={showResult} animationType="slide" transparent onRequestClose={onCloseResult} statusBarTranslucent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>AI 스캔 결과</Text>
                <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {drugImageUrl && <Image source={{ uri: drugImageUrl }} style={styles.resultImage} />}
                  <View style={styles.resultCard}>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>약 종류</Text>
                      <Text style={styles.resultValue}>{parsedResult?.pillName}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>복용 시간 추정</Text>
                      <Text style={styles.resultValue}>{parsedResult?.schedule?.join(', ')}</Text>
                    </View>
                  </View>
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionTitle}>📌 복용 목적</Text>
                    <Text style={styles.sectionText}>{parsedResult?.usage}</Text>
                  </View>
                  {!showManualInput ? (
                    <View style={styles.helperBox}>
                      <Text style={styles.helperText}>분석 결과가 맞는지 확인해주세요.</Text>
                    </View>
                  ) : (
                    <View style={styles.manualWrap}>
                      <Text style={styles.manualTitle}>직접 입력할게요</Text>
                      <TextInput
                        value={manualName}
                        onChangeText={setManualName}
                        placeholder="약 이름을 입력해주세요"
                        placeholderTextColor="#95A095"
                        style={styles.manualInput}
                        returnKeyType="done"
                        autoFocus={true}
                      />
                    </View>
                  )}
                </ScrollView>
                <SafeAreaView edges={['bottom']} style={styles.modalFooter}>
                  {!showManualInput ? (
                    <View style={styles.confirmRow}>
                      <TouchableOpacity style={styles.confirmPrimaryBtn} onPress={handleConfirm}>
                        <Text style={styles.confirmPrimaryBtnText}>네, 맞아요</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.confirmSecondaryBtn} onPress={() => setShowManualInput(true)}>
                        <Text style={styles.confirmSecondaryBtnText}>아니요</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.confirmRow}>
                      <TouchableOpacity style={styles.confirmPrimaryBtn} onPress={handleManualSubmit}>
                        <Text style={styles.confirmPrimaryBtnText}>등록하기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.confirmSecondaryBtn} onPress={() => { setShowManualInput(false); setManualName(''); Keyboard.dismiss(); }}>
                        <Text style={styles.confirmSecondaryBtnText}>취소</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity onPress={onCloseResult} style={styles.closeTextBtn}>
                    <Text style={styles.closeText}>닫기</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
  },

  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  header: {
    position: 'absolute',
    zIndex: 999,
    elevation: 999,
    top: 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanFrame: {
    width: 250,
    height: 250,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanGuideTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },

  scanGuideHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },

  bottomOverlay: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 44,
    alignItems: 'center',
  },

  bottomCaption: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 14,
  },

  scanButton: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  scanButtonDisabled: {
    opacity: 0.7,
  },

  scanButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 16, 8, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  loadingLogoWrap: {
    width: 92,
    height: 92,
    marginBottom: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingLogo: {
    width: 90,
    height: 90,
  },

  loadingTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },

  loadingDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'flex-end',
  },

  modalKeyboardWrap: {
    width: '100%',
    justifyContent: 'flex-end',
  },

  modalSheet: {
    backgroundColor: COLORS.modalBg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 22,
    minHeight: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 18,
    letterSpacing: -0.4,
  },

  modalBodyScroll: {
    flex: 1,
  },

  modalBodyContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },

  resultImage: {
    width: '100%',
    height: 160,
    borderRadius: 20,
    marginBottom: 14,
  },

  resultCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  resultLabel: {
    fontSize: 15,
    color: '#7B857B',
    fontWeight: '700',
  },

  resultValue: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '900',
  },

  sectionBlock: {
    backgroundColor: '#F8FBF6',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 10,
  },

  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
  },

  helperBox: {
    backgroundColor: '#F8FBF6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },

  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },

  manualWrap: {
    marginTop: 4,
    marginBottom: 8,
  },

  manualTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 10,
  },

  manualInput: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 15,
  },

  modalFooter: {
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.modalBg,
    borderTopWidth: 1,
    borderTopColor: '#EDF3EA',
  },

  confirmRow: {
    flexDirection: 'row',
    gap: 12,
  },

  confirmPrimaryBtn: {
    flex: 1,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmPrimaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },

  confirmSecondaryBtn: {
    flex: 1,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmSecondaryBtnText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
  },

  closeTextBtn: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 15,
    color: COLORS.subText,
    fontWeight: '700',
  },

  permissionWrap: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  permissionText: {
    color: '#fff',
    marginBottom: 14,
    textAlign: 'center',
  },

  permissionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  permissionBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});