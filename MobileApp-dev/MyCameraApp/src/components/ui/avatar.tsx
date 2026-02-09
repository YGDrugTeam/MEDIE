import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

// 1. Avatar Root: 전체 원형 틀
export const Avatar = ({ children, style }: any) => {
  return <View style={[styles.avatar, style]}>{children}</View>;
};

// 2. AvatarImage: 실제 프로필 사진
export const AvatarImage = ({ src, style }: { src: string, style?: any }) => {
  const [isError, setIsError] = useState(false);

  // 이미지 로딩 실패 시 아무것도 안 보여줌 (Fallback이 보여야 하므로)
  if (isError) return null;

  return (
    <Image 
      source={{ uri: src }} 
      style={[styles.full, style]} 
      onError={() => setIsError(true)}
    />
  );
};

// 3. AvatarFallback: 이미지가 없을 때 보여줄 대체 UI
export const AvatarFallback = ({ children, style }: any) => {
  return (
    <View style={[styles.fallback, style]}>
      <Text style={styles.fallbackText}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    position: 'relative',
    flexDirection: 'row',
    height: 40,
    width: 40,
    borderRadius: 20, // h-10 w-10 대응 (반지름만큼 주면 원이 됨)
    overflow: 'hidden',
    backgroundColor: '#f1f5f9', // bg-muted
  },
  full: {
    height: '100%',
    width: '100%',
    aspectRatio: 1,
  },
  fallback: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f1f5f9', // bg-muted
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});