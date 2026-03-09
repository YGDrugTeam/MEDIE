import React from 'react';
import { useEffect, useState } from 'react';
import {View,Text,TouchableOpacity,Modal,ActivityIndicator,Image,ScrollView,SafeAreaView} from 'react-native';
import { CameraView, Camera } from 'expo-camera'; // ✅ Camera 추가
import * as Speech from 'expo-speech';

import { styles } from '../styles/commonStyles';

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

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync(); // ✅ 권한 요청
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          '카메라 권한 필요',
          '알약 스캔을 위해 카메라 권한을 허용해주세요.\n설정에서 권한을 켜주세요.'
        );
      }
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 12 }}>
          카메라 권한이 꺼져있습니다.
        </Text>
        <TouchableOpacity
          style={{ padding: 12, backgroundColor: '#FF7F50', borderRadius: 10 }}
          onPress={() => setAppMode('HOME')}
        >
          <Text style={{ color: '#fff' }}>홈으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ 권한 OK일 때만 CameraView 렌더



  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} />

      {/* 🧊 스캔 가이드 마스크 */}
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


      {/* 📸 스캔 버튼 */}
      <View style={styles.bottomOverlay}>
        <TouchableOpacity
          style={[
            styles.premiumScanBtn,
            isAnalyzing && styles.scanBtnDisabled,
          ]}
          onPress={onScan}
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
      <Modal
        visible={showResult}
        animationType="slide"
        transparent
        onRequestClose={onCloseResult}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💊 AI 분석 결과</Text>

            {drugImageUrl && (
              <Image
                source={{ uri: drugImageUrl }}
                style={styles.resultImage}
              />
            )}

            <ScrollView style={styles.scrollContainer}>
              <Text style={styles.resultBody}>{aiResponse}</Text>
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.secondaryBtn]}
                onPress={onRegisterPill}
              >
                <Text style={styles.secondaryBtnText}>
                  복용 알약 등록
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, styles.primaryBtn]}
                onPress={onCloseResult}
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