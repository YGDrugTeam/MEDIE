import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera"; // 최신 Expo Camera API
import * as ImagePicker from "expo-image-picker";
import { Camera as CameraIcon, ImagePlus, X, RotateCcw } from "lucide-react-native";

// 앞서 만든 Expo용 UI 컴포넌트
import { Button } from "./ui/button";

interface ImageCaptureProps {
  onImageCapture: (imageData: string) => void;
  isLoading?: boolean;
}

export const ImageCapture = ({ onImageCapture, isLoading = false }: ImageCaptureProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  // 1. 카메라 시작 (권한 체크 포함)
  const startCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
        return;
      }
    }
    setIsCameraActive(true);
  };

  // 2. 사진 촬영
  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      setPreviewImage(photo.uri);
      setIsCameraActive(false);
    }
  };

  // 3. 갤러리에서 선택
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPreviewImage(result.assets[0].uri);
    }
  };

  const resetCapture = () => {
    setPreviewImage(null);
    setIsCameraActive(false);
  };

  const handleSubmit = () => {
    if (previewImage) {
      onImageCapture(previewImage);
    }
  };

  return (
    <View style={styles.container}>
      {/* 촬영/미리보기 영역 */}
      <View style={styles.viewerContainer}>
        {isCameraActive ? (
          <CameraView style={styles.camera} facing="back" ref={cameraRef}>
            {/* 가이드 라인 */}
            <View style={styles.overlay}>
              <View style={styles.guideBox} />
            </View>
            
            <View style={styles.cameraControls}>
              <Button variant="outline" size="icon" onPress={() => setIsCameraActive(false)} style={styles.closeBtn}>
                <X color="#ffffff" size={24} />
              </Button>
              <Button onPress={capturePhoto} style={styles.captureBtn}>
                <CameraIcon color="#ffffff" size={24} />
                <Text style={styles.captureText}> 촬영</Text>
              </Button>
            </View>
          </CameraView>
        ) : previewImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="contain" />
            <TouchableOpacity onPress={resetCapture} style={styles.retryBtn}>
              <RotateCcw color="#ffffff" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.iconCircle}>
              <CameraIcon size={40} color="#64748b" />
            </View>
            <Text style={styles.placeholderText}>
              알약 사진을 촬영하거나{"\n"}갤러리에서 선택해주세요
            </Text>
          </View>
        )}
      </View>

      {/* 하단 버튼 영역 */}
      {!isCameraActive && !previewImage && (
        <View style={styles.buttonGrid}>
          <Button variant="outline" onPress={startCamera} style={styles.mainBtn}>
            <CameraIcon size={20} color="#0f172a" />
            <Text style={styles.btnText}> 카메라 촬영</Text>
          </Button>
          <Button variant="outline" onPress={pickImage} style={styles.mainBtn}>
            <ImagePlus size={20} color="#0f172a" />
            <Text style={styles.btnText}> 갤러리 선택</Text>
          </Button>
        </View>
      )}

      {/* 분석 제출 버튼 */}
      {previewImage && !isLoading && (
        <Button onPress={handleSubmit} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>이 사진으로 분석하기</Text>
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 24 },
  viewerContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },
  guideBox: { width: 200, height: 200, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", borderRadius: 20 },
  cameraControls: { position: "absolute", bottom: 20, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 16 },
  closeBtn: { backgroundColor: "rgba(0,0,0,0.5)", borderColor: "transparent" },
  captureBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 32, height: 50 },
  captureText: { color: "#ffffff", fontWeight: "bold" },
  previewContainer: { flex: 1, backgroundColor: "#000" },
  previewImage: { flex: 1 },
  retryBtn: { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 20 },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  placeholderText: { textAlign: "center", color: "#64748b", lineHeight: 20 },
  buttonGrid: { flexDirection: "row", gap: 12 },
  mainBtn: { flex: 1, height: 56, flexDirection: "row" },
  btnText: { fontSize: 16, color: "#0f172a", fontWeight: "500" },
  submitBtn: { width: "100%", height: 56, backgroundColor: "#3b82f6" },
  submitBtnText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
});