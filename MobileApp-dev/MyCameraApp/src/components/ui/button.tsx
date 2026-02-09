import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, TextProps } from 'react-native';

// 1. 타입 정의
export interface ButtonProps {
  children?: React.ReactNode;
  title?: string; // 편리함을 위해 title 추가
  onPress?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

// 2. Button 컴포넌트
export const Button = ({ 
  children, 
  title,
  onPress, 
  variant = 'default', 
  size = 'default', 
  disabled = false, 
  loading = false,
  style 
}: ButtonProps) => {
  
  // 상태에 따른 스타일 결합
  const containerStyles = [
    styles.base,
    // variant에 맞는 스타일을 가져오되, default일 때는 defaultVariant 사용
    variant === 'default' ? styles.defaultVariant : (styles as any)[variant],
    // size에 맞는 스타일을 가져오되, default일 때는 defaultSize 사용
    size === 'default' ? styles.defaultSize : (styles as any)[size],
    disabled && styles.disabled,
    style
  ];

  const textStyles = [
    styles.textBase,
    variant === 'default' || variant === 'destructive' ? styles.textLight : styles.textDark,
    variant === 'link' && styles.textLink,
    size === 'sm' && { fontSize: 12 },
  ];

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      style={containerStyles}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'default' ? "#fff" : "#1d7edb"} />
      ) : (
        <>
          {title ? <Text style={textStyles}>{title}</Text> : null}
          {children}
        </>
      )}
    </TouchableOpacity>
  );
};

// --- 3. 여기에 Button.Text를 위한 컴포넌트를 정의합니다 ---
const InternalButtonText = ({ children, style, ...props }: TextProps) => {
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
};

// --- 4. Button 객체에 Text 속성을 연결합니다 ---
// (기존 export const Button 선언 방식 때문에 아래와 같이 할당합니다)
Object.assign(Button, { Text: InternalButtonText });

// 이제 외부에서는 Button.Text로 접근 가능합니다.

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    gap: 8,
  },
  // 1. Variants (이름 뒤에 Variant를 붙여 구분)
  defaultVariant: { backgroundColor: '#1d7edb' },
  destructive: { backgroundColor: '#ef4444' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e2e8f0' },
  secondary: { backgroundColor: '#f1f5f9' },
  ghost: { backgroundColor: 'transparent' },
  link: { backgroundColor: 'transparent' },
  // size styles
  defaultSize: { height: 40, paddingHorizontal: 16, paddingVertical: 8 },
  sm: { height: 36, paddingHorizontal: 12, borderRadius: 6 },
  lg: { height: 44, paddingHorizontal: 32, borderRadius: 6 },
  icon: { height: 40, width: 40 },

  disabled: { opacity: 0.5 },
  // Text styles
  textBase: { fontSize: 14, fontWeight: '500' },
  textLight: { color: '#ffffff' },
  textDark: { color: '#0f172a' },
  textLink: { color: '#1d7edb', textDecorationLine: 'underline' },
});