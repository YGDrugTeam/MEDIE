import React, { useState } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Text 
} from 'react-native';

// 1. Root 컨테이너 (상태 관리용)
export const HoverCard = ({ children }: { children: React.ReactNode }) => {
  return <View>{children}</View>;
};

// 2. Trigger (터치 시 카드를 띄우는 버튼)
export const HoverCardTrigger = ({ children, onPress }: any) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

// 3. Content (실제 나타나는 정보 카드)
export const HoverCardContent = ({ 
  isOpen, 
  onClose, 
  children,
  style 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  style?: any;
}) => {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 배경 터치 시 닫기 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* 실제 카드 영역 */}
          <TouchableWithoutFeedback>
            <View style={[styles.content, style]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent', // 배경을 투명하게 하거나 rgba(0,0,0,0.1)로 조절
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 260, // 조원의 w-64 반영
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    // 그림자 설정
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});