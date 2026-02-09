import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewProps } from "react-native";
import { cn } from "../../lib/utils"; // 경로를 파일 위치에 맞게 수정하세요

interface SkeletonProps extends ViewProps {
  className?: string; // 웹 코드 호환성 유지
}

function Skeleton({ style, className, ...props }: SkeletonProps) {
  // 애니메이션을 위한 투명도 값 설정 (0.3에서 0.7 사이를 반복)
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // 무한히 반복되는 깜빡임(Pulse) 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { opacity: pulseAnim }, // 애니메이션 값 적용
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#e2e8f0", // bg-muted에 해당하는 색상
    borderRadius: 6,           // rounded-md에 해당하는 곡률
  },
});

export { Skeleton };