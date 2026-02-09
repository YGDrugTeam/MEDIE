import React, { type ReactNode, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
// lucide-react 대신 expo용 아이콘 사용 (설치 필요: npx expo install expo-symbols 또는 lucide-react-native)
import { ChevronDown } from 'lucide-react-native';

// 1. Accordion Root (상태 관리 로직)
export const Accordion = ({ children }: { children: React.ReactNode }) => {
  return <View style={styles.accordionRoot}>{children}</View>;
};

// 2. Accordion Item
export const AccordionItem = ({ children, className }: any) => {
  return <View style={styles.accordionItem}>{children}</View>;
};

// 3. Accordion Trigger (클릭 부분)
export const AccordionTrigger = ({ children, isOpen, onPress }: any) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.trigger}>
      <Text style={styles.triggerText}>{children}</Text>
      {/* isOpen 상태에 따라 아이콘 회전 효과 */}
      <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
        <ChevronDown size={20} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
};

// 4. Accordion Content (펼쳐지는 부분)
export const AccordionContent = ({ children, isOpen }: any) => {
  if (!isOpen) return null; // 닫혀있으면 안 보임
  return (
    <View style={styles.content}>
      <Text style={styles.contentText}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  accordionRoot: {
    width: '100%',
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // 조원의 border-b 대응
  },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16, // py-4 대응
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  content: {
    paddingBottom: 16, // pb-4 대응
    paddingTop: 0,
  },
  contentText: {
    fontSize: 14,
    color: '#64748b', // text-muted-foreground 대응
  }
});