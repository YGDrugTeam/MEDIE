// src/hooks/useCameraScan.js
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

const API_URL = 'https://mediclens-backend.azurewebsites.net/pill/analyze';

export default function useCameraScan({ onRegisterPill } = {}) {
  const cameraRef = useRef(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [drugImageUrl, setDrugImageUrl] = useState(null);

  const handleScan = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });

      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        name: 'pill.jpg',
        type: 'image/jpeg',
      });

      const res = await fetch(API_URL, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.result === 'NOT_MEDICINE') {
        Alert.alert('알약 인식 실패', '다시 촬영해주세요');
        return;
      }

      const analysis = data.analysis;
      const confidence = data.confidence;

      // ✅ 안전 검증(구버전 App.js에 있던 방어 로직)
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
          '⚠️ 알약 인식 실패',
          '알약을 인식하지 못했습니다.\n밝은 곳에서 약만 다시 촬영해주세요.',
          [{ text: '확인' }]
        );
        return;
      }

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
      Speech.speak('알약 분석이 완료되었습니다', { language: 'ko-KR', rate: 0.9 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('오류', '서버 연결 실패');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    Speech.stop();
  };

  // ✅ 등록 버튼: 저장은 App.js가 담당(암호화 포함)
  const handleRegisterPill = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!aiResponse) {
        Alert.alert('오류', '등록할 분석 결과가 없습니다');
        return;
      }

      // 🔥 App.js(구버전) 그대로: aiResponse 파싱해서 pill 데이터 생성/저장
      await onRegisterPill?.(aiResponse);

      // 모달 닫기
      closeResult();
    } catch (e) {
      console.error('❌ handleRegisterPill 실패:', e);
      Alert.alert('오류', '알약 등록 중 문제가 발생했습니다.');
    }
  };

  return {
    cameraRef,
    isAnalyzing,
    showResult,
    aiResponse,
    drugImageUrl,
    handleScan,
    handleRegisterPill,
    closeResult,
    setShowResult, // BackHandler hook에서 필요하면 쓰라고 노출
  };
}