import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Scan, Eye, FileText, Sparkles } from "lucide-react-native";

interface AnalysisLoaderProps {
  stage: "quality" | "ocr" | "matching" | "summarizing";
}

const stages = {
  quality: { icon: Eye, title: "품질 검사 중", description: "이미지 선명도와 초점을 확인하고 있습니다..." },
  ocr: { icon: Scan, title: "문자 인식 중", description: "알약의 각인과 표면 문자를 분석하고 있습니다..." },
  matching: { icon: FileText, title: "데이터베이스 매칭 중", description: "분석 결과를 약품 정보와 대조하고 있습니다..." },
  summarizing: { icon: Sparkles, title: "정보 요약 중", description: "약품 정보를 이해하기 쉽게 정리하고 있습니다..." },
};

export const AnalysisLoader = ({ stage }: AnalysisLoaderProps) => {
  const [dots, setDots] = useState("");
  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  // 애니메이션 값 설정
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 점(...) 애니메이션
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // 펄스 애니메이션 (아이콘 둥둥 뜨기)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // 스캔 라인 애니메이션
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 120, // 원형 높이에 맞춰 조절
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => clearInterval(interval);
  }, [stage]);

  const stageOrder: (keyof typeof stages)[] = ["quality", "ocr", "matching", "summarizing"];
  const currentIndex = stageOrder.indexOf(stage);

  return (
    <View style={styles.container}>
      {/* Animated Icon Container */}
      <View style={styles.iconWrapper}>
        <Animated.View style={[styles.circle, { transform: [{ scale: pulseAnim }] }]}>
          <Icon size={48} color="#ffffff" />
        </Animated.View>
        
        {/* Scanning Line Effect */}
        <View style={styles.scanContainer}>
          <Animated.View 
            style={[
              styles.scanLine, 
              { transform: [{ translateY: scanLineAnim }] }
            ]} 
          />
        </View>
      </View>

      {/* Stage Info */}
      <Text style={styles.title}>{currentStage.title}{dots}</Text>
      <Text style={styles.description}>{currentStage.description}</Text>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {stageOrder.map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressBar,
              { backgroundColor: i <= currentIndex ? "#3b82f6" : "#e2e8f0" }
            ]}
          />
        ))}
      </View>

      {/* Stage Labels */}
      <View style={styles.labelContainer}>
        {["품질", "인식", "매칭", "요약"].map((label, i) => (
          <Text 
            key={label}
            style={[styles.label, i <= currentIndex && styles.activeLabel]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    position: "relative",
    marginBottom: 32,
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#3b82f6", // 기본 테마 컬러 (gradient 대용)
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  scanContainer: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 280,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
  },
  progressBar: {
    height: 8,
    width: 40,
    borderRadius: 4,
  },
  labelContainer: {
    flexDirection: "row",
    gap: 24,
    marginTop: 16,
  },
  label: {
    fontSize: 12,
    color: "#94a3b8",
  },
  activeLabel: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});