import * as React from "react";
import { Switch as NativeSwitch, StyleSheet, View, Platform } from "react-native";
import { cn } from "../../lib/utils"; // 경로 확인!

// React.ComponentRef를 사용하여 최신 TypeScript 경고 방지
const Switch = React.forwardRef<
  React.ComponentRef<typeof NativeSwitch>,
  React.ComponentPropsWithoutRef<typeof NativeSwitch> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <View style={styles.container}>
      <NativeSwitch
        ref={ref}
        // 조원분의 코드 색상을 반영 (Checked: Primary, Unchecked: Input)
        trackColor={{ 
          false: "#e2e8f0", // data-[state=unchecked]:bg-input
          true: "#0f172a"   // data-[state=checked]:bg-primary
        }}
        // 동그란 버튼 부분의 색상
        thumbColor={Platform.OS === 'ios' ? undefined : "#ffffff"}
        // iOS 환경에서 테두리 색상 처리
        ios_backgroundColor="#e2e8f0"
        {...props}
      />
    </View>
  );
});

Switch.displayName = "Switch";

const styles = StyleSheet.create({
  container: {
    // 웹의 inline-flex h-6 w-11 느낌을 살리기 위한 컨테이너
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
});

export { Switch };