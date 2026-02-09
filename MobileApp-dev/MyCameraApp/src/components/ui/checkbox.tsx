import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

// 1. 타입 정의
interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  style?: any;
  disabled?: boolean;
}

// 2. Checkbox 컴포넌트
export const Checkbox = ({ 
  checked = false, 
  onCheckedChange, 
  style, 
  disabled = false 
}: CheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(checked);

  const handlePress = () => {
    if (disabled) return;
    const nextState = !internalChecked;
    setInternalChecked(nextState);
    if (onCheckedChange) onCheckedChange(nextState);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.checkboxBase,
        internalChecked && styles.checkboxChecked,
        disabled && styles.disabled,
        style
      ]}
    >
      {internalChecked && (
        <Check size={14} color="#ffffff" strokeWidth={3} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxBase: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1d7edb', // 조원의 Primary 색상
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#1d7edb', // 체크 시 배경색 채움
  },
  disabled: {
    opacity: 0.5,
    borderColor: '#cbd5e1',
  },
});