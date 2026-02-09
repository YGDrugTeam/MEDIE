import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 1. 타입 정의 (에러 방지를 위해 any 대신 인터페이스 사용)
interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  style?: any;
}

// 2. Alert 메인 컨테이너
export const Alert = ({ children, variant = 'default', style }: AlertProps) => {
  return (
    <View style={[
      styles.alertBase, 
      variant === 'destructive' ? styles.alertDestructive : styles.alertDefault,
      style
    ]}>
      {children}
    </View>
  );
};

// 3. AlertTitle
export const AlertTitle = ({ children, style }: { children: React.ReactNode, style?: any }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

// 4. AlertDescription
export const AlertDescription = ({ children, style }: { children: React.ReactNode, style?: any }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  alertBase: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
    flexDirection: 'column',
    marginVertical: 8,
  },
  alertDefault: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0', // --border
  },
  alertDestructive: {
    backgroundColor: '#fef2f2', // 매우 연한 빨강 배경
    borderColor: '#ef4444',     // --destructive
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a', // --foreground
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#64748b', // --muted-foreground
    lineHeight: 20,
  },
});