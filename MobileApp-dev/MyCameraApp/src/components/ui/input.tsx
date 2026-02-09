import React, { forwardRef } from 'react';
import { TextInput, StyleSheet, View, Platform } from 'react-native';

// 1. Props 타입 정의 (웹의 ComponentProps와 유사하게 구성)
export interface InputProps extends React.ComponentProps<typeof TextInput> {
  className?: string; // 기존 코드와의 호환성을 위해 유지
}

const Input = forwardRef<TextInput, InputProps>(
  ({ style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          // 모바일 편의 기능 설정
          placeholderTextColor="#94a3b8" // text-muted-foreground 색상
          autoCapitalize="none"
          {...props}
        />
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  input: {
    width: '100%',
    height: 44, // 모바일 터치 영역 확보 (최소 44px 권장)
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0', // border-input 색상
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16, // iOS에서 16px 미만은 자동 줌이 발생하므로 16px 권장
    color: '#0f172a',
    // 그림자 (선택 사항)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});

export { Input };