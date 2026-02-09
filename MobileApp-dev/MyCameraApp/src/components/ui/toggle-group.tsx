import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewProps } from "react-native";
import { cn } from "../../lib/utils"; // 경로 확인!

// 1. 타입 정의
interface ToggleGroupProps extends ViewProps {
  value?: string | string[];
  onValueChange?: (value: any) => void;
  type?: "single" | "multiple";
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const ToggleGroupContext = React.createContext<{
  value?: any;
  onValueChange?: (val: string) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}>({});

// 메인 Root 컨테이너
const ToggleGroup = React.forwardRef<View, ToggleGroupProps>(
  ({ type = "single", value, onValueChange, variant = "default", size = "default", children, style, ...props }, ref) => {
    
    const handlePress = (itemValue: string) => {
      if (type === "single") {
        onValueChange?.(itemValue === value ? "" : itemValue);
      } else {
        const prevValue = Array.isArray(value) ? value : [];
        const newValue = prevValue.includes(itemValue)
          ? prevValue.filter((v) => v !== itemValue)
          : [...prevValue, itemValue];
        onValueChange?.(newValue);
      }
    };

    return (
      <ToggleGroupContext.Provider value={{ value, onValueChange: handlePress, variant, size }}>
        <View ref={ref} style={[styles.container, style]} {...props}>
          {children}
        </View>
      </ToggleGroupContext.Provider>
    );
  }
);

// 개별 아이템 (ToggleGroupItem) 수정 버전
const ToggleGroupItem = React.forwardRef<
  React.ComponentRef<typeof TouchableOpacity>, // 1. 여기를 수정했습니다!
  { value: string; children: React.ReactNode; style?: any; className?: string }
>(({ value, children, style, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);
  
  // 현재 아이템이 선택되었는지 확인
  const isSelected = Array.isArray(context.value)
    ? context.value.includes(value)
    : context.value === value;

  return (
    <TouchableOpacity
      ref={ref as any}
      onPress={() => context.onValueChange?.(value)}
      style={[
        styles.itemBase,
        context.variant === "outline" ? styles.outline : styles.default,
        isSelected && styles.selected,
        context.size === "sm" && styles.sizeSm,
        style,
      ]}
      activeOpacity={0.7}
      {...(props as any)}
    >
      <Text style={[styles.text, isSelected && styles.selectedText]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  itemBase: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  default: {
    backgroundColor: "transparent",
  },
  outline: {
    borderColor: "#e2e8f0",
    backgroundColor: "transparent",
  },
  selected: {
    backgroundColor: "#f1f5f9", // bg-muted
    borderColor: "#e2e8f0",
  },
  text: {
    fontSize: 14,
    color: "#64748b", // text-muted-foreground
    fontWeight: "500",
  },
  selectedText: {
    color: "#0f172a", // text-foreground
  },
  sizeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

ToggleGroup.displayName = "ToggleGroup";
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };