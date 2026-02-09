import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

// 안드로이드에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 1. Root 컨테이너
export const NavigationMenu = ({ children, style }: any) => {
  return <View style={[styles.menuContainer, style]}>{children}</View>;
};

// 2. List (항목들을 감싸는 래퍼)
export const NavigationMenuList = ({ children }: any) => {
  return <View style={styles.list}>{children}</View>;
};

// 3. 개별 메뉴 아이템 (상태 관리 포함)
export const NavigationMenuItem = ({ children }: any) => {
  return <View style={styles.item}>{children}</View>;
};

// 4. 트리거 (제목 부분)
export const NavigationMenuTrigger = ({ children, isOpen, onPress }: any) => {
  return (
    <TouchableOpacity style={styles.trigger} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.triggerText}>{children}</Text>
      <ChevronDown
        size={16}
        color="#64748b"
        style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
      />
    </TouchableOpacity>
  );
};

// 5. 컨텐츠 (펼쳐지는 부분)
export const NavigationMenuContent = ({ isOpen, children }: any) => {
  if (!isOpen) return null;
  return (
    <View style={styles.content}>
      {children}
    </View>
  );
};

// 6. 실제 링크 버튼
export const NavigationMenuLink = ({ children, onPress }: any) => (
  <TouchableOpacity style={styles.link} onPress={onPress}>
    <Text style={styles.linkText}>{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  menuContainer: {
    width: '100%',
    backgroundColor: '#fff',
  },
  list: {
    flexDirection: 'column',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  linkText: {
    fontSize: 15,
    color: '#475569',
  },
});