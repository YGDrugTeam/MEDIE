import React, { useState } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Dimensions 
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1. Root: 상태 관리 인터페이스
export const Popover = ({ children }: { children: React.ReactNode }) => {
  return <View>{children}</View>;
};

// 2. Trigger: 팝업을 여는 버튼
export const PopoverTrigger = ({ children, onPress }: any) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

// 3. Content: 실제 나타나는 컨텐츠 영역
export const PopoverContent = ({ 
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
      {/* 바깥 영역 터치 시 닫기 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* 실제 팝업 카드 */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: SCREEN_WIDTH * 0.8, // 조원의 w-72 스타일 반영 (모바일 대응)
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    // 그림자 설정
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});