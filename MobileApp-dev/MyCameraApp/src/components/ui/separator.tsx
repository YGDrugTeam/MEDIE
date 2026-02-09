import * as React from "react";
import { View, StyleSheet, ViewProps } from "react-native";

// 1. Props 타입 정의
interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical";
  className?: string; // 기존 코드 호환성용
}

const Separator = React.forwardRef<View, SeparatorProps>(
  ({ style, orientation = "horizontal", ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          styles.base,
          orientation === "horizontal" ? styles.horizontal : styles.vertical,
          style,
        ]}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#e2e8f0", // bg-border 색상 (기본 회색)
    flexShrink: 0, // shrink-0 반영
  },
  horizontal: {
    height: 1, // h-[1px]
    width: "100%", // w-full
  },
  vertical: {
    width: 1, // w-[1px]
    height: "100%", // h-full
  },
});

export { Separator };