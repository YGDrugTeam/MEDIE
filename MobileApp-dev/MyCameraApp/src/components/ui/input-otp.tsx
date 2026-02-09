import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

interface OTPProps {
  maxLength: number;
  onCodeFilled?: (code: string) => void;
}

export const InputOTP = ({ maxLength = 6, onCodeFilled }: OTPProps) => {
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);

  // 입력창 어디를 눌러도 실제 TextInput에 포커스가 가도록 함
  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleChangeText = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, ""); // 숫자만 허용
    setCode(numericText);
    if (numericText.length === maxLength && onCodeFilled) {
      onCodeFilled(numericText);
    }
  };

  // 각각의 숫자 칸(Slot) 생성
  const renderSlots = () => {
    const slots = [];
    for (let i = 0; i < maxLength; i++) {
      const char = code[i] || "";
      const isFocused = code.length === i;

      slots.push(
        <View 
          key={i} 
          style={[
            styles.slot, 
            isFocused && styles.slotFocused,
            char !== "" && styles.slotFilled
          ]}
        >
          <Text style={styles.slotText}>{char}</Text>
          {isFocused && <View style={styles.caret} />}
        </View>
      );
    }
    return slots;
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* 실제 입력은 숨겨진 TextInput이 담당 */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChangeText}
        maxLength={maxLength}
        keyboardType="number-pad" // 숫자 키패드 강제
        style={styles.hiddenInput}
        autoFocus={true}
      />
      <View style={styles.slotsContainer}>
        {renderSlots()}
      </View>
    </Pressable>
  );
};

// 장식용 구분자
export const InputOTPSeparator = () => (
  <View style={styles.separator}>
    <View style={styles.dot} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  slotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  slot: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotFocused: {
    borderColor: '#1d7edb',
    borderWidth: 2,
  },
  slotFilled: {
    borderColor: '#94a3b8',
  },
  slotText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  caret: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#1d7edb',
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748b',
  }
});