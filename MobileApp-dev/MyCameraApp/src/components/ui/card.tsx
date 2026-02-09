import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 1. 메인 카드 컨테이너
export const Card = ({ children, style }: any) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

// 2. 카드 헤더
export const CardHeader = ({ children, style }: any) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

// 3. 카드 제목 (강조)
export const CardTitle = ({ children, style }: any) => {
  return <Text style={[styles.title, style]}>{children}</Text>;
};

// 4. 카드 설명 (연하게)
export const CardDescription = ({ children, style }: any) => {
  return <Text style={[styles.description, style]}>{children}</Text>;
};

// 5. 카드 본문 (패딩 조절)
export const CardContent = ({ children, style }: any) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

// 6. 카드 푸터 (하단 정렬)
export const CardFooter = ({ children, style }: any) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0', // 조원의 border 색상
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2, // 안드로이드용 그림자
    marginVertical: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});