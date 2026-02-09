import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewProps } from "react-native";
import { cn } from "../../lib/utils"; // 경로 확인!

// 1. 타입 정의
export interface ToggleProps extends ViewProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  className?: string; // 타입 에러 방지
}

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TouchableOpacity>,
  ToggleProps
>(({ pressed, onPressedChange, variant = "default", size = "default", disabled, style, children, ...props }, ref) => {
  
  const handlePress = () => {
    if (disabled) return;
    onPressedChange?.(!pressed);
  };

  return (
    <TouchableOpacity
      ref={ref}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        variant === "outline" && styles.outline,
        pressed && styles.on, // 켜진 상태 스타일
        size === "sm" && styles.sm,
        size === "lg" && styles.lg,
        disabled && styles.disabled,
        style,
      ]}
      {...(props as any)}
    >
      <Text style={[
        styles.text, 
        pressed && styles.onText,
        size === "sm" && styles.textSm
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40, // default height
    backgroundColor: "transparent",
  },
  outline: {
    borderWidth: 1,
    borderColor: "#e2e8f0", // border-input
  },
  on: {
    backgroundColor: "#f1f5f9", // bg-accent (data-[state=on])
  },
  sm: {
    height: 36,
    paddingHorizontal: 10,
  },
  lg: {
    height: 44,
    paddingHorizontal: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  onText: {
    color: "#0f172a", // accent-foreground
  },
  textSm: {
    fontSize: 13,
  },
});

Toggle.displayName = "Toggle";

export { Toggle };