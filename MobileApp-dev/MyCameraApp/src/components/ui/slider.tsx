import * as React from "react";
import { View, StyleSheet } from "react-native";
// default import가 아닌 이름 있는 import로 변경 시도
import NativeSlider from "@react-native-community/slider";
import { cn } from "../../lib/utils"; // 경로 확인 필요!

// Props 타입 정의: 기존 슬라이더 속성에 className 추가
interface SliderProps extends React.ComponentPropsWithoutRef<typeof NativeSlider> {
  className?: string;
}

// React.ElementRef를 사용하여 정확한 인스턴스 타입을 추출합니다.
const Slider = React.forwardRef<React.ComponentRef<typeof NativeSlider>, SliderProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <NativeSlider
          // 타입을 강제로 맞추기 위해 as any를 일시적으로 사용하거나 
          // 정확한 인스턴스 타입을 ref에 전달합니다.
          ref={ref as any} 
          minimumTrackTintColor="#0f172a"
          maximumTrackTintColor="#e2e8f0"
          thumbTintColor="#ffffff"
          style={[styles.slider, style]}
          {...props}
        />
      </View>
    );
  }
);

Slider.displayName = "Slider";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 40,
    justifyContent: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

export { Slider };