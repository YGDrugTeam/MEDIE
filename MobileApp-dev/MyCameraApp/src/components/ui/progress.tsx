import * as React from "react";
import { View, StyleSheet, Animated, LayoutChangeEvent } from "react-native";

interface ProgressProps {
  value?: number; // 0 ~ 100 사이의 값
  max?: number;
  className?: string; // 기존 코드 호환성 유지
  style?: any;
}

const Progress = React.forwardRef<View, ProgressProps>(
  ({ value = 0, max = 100, style }, ref) => {
    const [width, setWidth] = React.useState(0);
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    // 전체 너비를 측정하여 애니메이션 계산에 활용
    const onLayout = (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
    };

    React.useEffect(() => {
      // 값이 바뀔 때마다 바가 부드럽게 움직이도록 애니메이션 처리
      Animated.timing(animatedValue, {
        toValue: value > max ? max : value,
        duration: 500,
        useNativeDriver: false, // width 애니메이션은 false 설정
      }).start();
    }, [value, max]);

    // 퍼센트 계산
    const progressWidth = animatedValue.interpolate({
      inputRange: [0, max],
      outputRange: ["0%", "100%"],
    });

    return (
      <View
        ref={ref}
        onLayout={onLayout}
        style={[styles.root, style]}
      >
        <Animated.View
          style={[
            styles.indicator,
            { width: progressWidth },
          ]}
        />
      </View>
    );
  }
);

Progress.displayName = "Progress";

const styles = StyleSheet.create({
  root: {
    position: "relative",
    height: 16, // h-4(1rem) 기준
    width: "100%",
    overflow: "hidden",
    borderRadius: 999, // rounded-full
    backgroundColor: "#e2e8f0", // bg-secondary (shadcn default)
  },
  indicator: {
    height: "100%",
    backgroundColor: "#0f172a", // bg-primary (shadcn default)
    // 원본의 transition-all 효과는 Animated API가 대신함
  },
});

export { Progress };