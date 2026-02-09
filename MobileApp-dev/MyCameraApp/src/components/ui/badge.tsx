import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 1. 타입 정의
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  style?: any;
}

// 2. Badge 컴포넌트
export const Badge = ({ children, variant = 'default', style }: BadgeProps) => {
  return (
    <View style={[
      styles.badgeBase, 
      styles[variant], // 변체(variant)에 따른 스타일 적용
      style
    ]}>
      <Text style={[
        styles.textBase,
        variant === 'outline' ? styles.textOutline : styles.textLight
      ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeBase: {
    alignSelf: 'flex-start', // 내용물 크기에 맞게 자동 조절
    paddingHorizontal: 10,   // px-2.5 대응
    paddingVertical: 2,      // py-0.5 대응
    borderRadius: 999,       // rounded-full
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 변체별 배경색 설정
  default: {
    backgroundColor: '#1d7edb', // --primary
  },
  secondary: {
    backgroundColor: '#f1f5f9', // --secondary
  },
  destructive: {
    backgroundColor: '#ef4444', // --destructive
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#e2e8f0',     // --border
  },
  // 텍스트 스타일
  textBase: {
    fontSize: 12,              // text-xs
    fontWeight: '600',         // font-semibold
  },
  textLight: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#0f172a',
  }
});