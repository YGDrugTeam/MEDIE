import * as React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Circle } from "lucide-react-native";

// 1. RadioGroup: 전체 아이템을 감싸고 상태를 관리하는 컨테이너
interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  style?: any;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const RadioGroup = ({ value, onValueChange, children, style }: RadioGroupProps) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <View style={[styles.group, style]}>{children}</View>
    </RadioGroupContext.Provider>
  );
};

// 2. RadioGroupItem: 개별 선택 동그라미 버튼
interface RadioGroupItemProps {
  value: string;
  disabled?: boolean;
  style?: any;
}

const RadioGroupItem = ({ value, disabled, style }: RadioGroupItemProps) => {
  const context = React.useContext(RadioGroupContext);
  const isSelected = context.value === value;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => context.onValueChange?.(value)}
      style={[
        styles.item,
        isSelected && styles.itemSelected,
        disabled && styles.disabled,
        style,
      ]}
    >
      {isSelected && (
        <View style={styles.indicator}>
          <Circle size={10} color="#0f172a" fill="#0f172a" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  group: {
    gap: 8, // 조원 코드의 gap-2 반영
  },
  item: {
    height: 20, // 조원 코드 h-4(16px)보다 터치하기 편하게 20px로 조정
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0f172a", // border-primary
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  itemSelected: {
    borderColor: "#0f172a",
  },
  indicator: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});

export { RadioGroup, RadioGroupItem };