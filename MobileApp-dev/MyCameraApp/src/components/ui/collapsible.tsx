import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

// 안드로이드에서 애니메이션 활성화 설정
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 1. Root 컨테이너
export const Collapsible = ({ children, style }: any) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

// 2. Trigger (클릭하는 부분)
export const CollapsibleTrigger = ({ children, onPress }: any) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      style={styles.trigger}
    >
      {children}
    </TouchableOpacity>
  );
};

// 3. Content (나타나고 사라지는 부분)
export const CollapsibleContent = ({ children, isOpen }: { children: any, isOpen: boolean }) => {
  if (!isOpen) return null;
  
  return <View style={styles.content}>{children}</View>;
};

// --- 사용 편의를 위한 통합 컴포넌트 예시 ---
export const CollapsibleItem = ({ title, children }: { title: React.ReactNode, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <Collapsible style={styles.itemBorder}>
      <CollapsibleTrigger onPress={toggleOpen}>
        <View style={styles.triggerInner}>
          {title}
          {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
        </View>
      </CollapsibleTrigger>
      <CollapsibleContent isOpen={isOpen}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  trigger: {
    paddingVertical: 12,
  },
  triggerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 12,
    overflow: 'hidden',
  },
});