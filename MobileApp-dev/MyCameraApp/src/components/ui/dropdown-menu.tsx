import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  TouchableWithoutFeedback 
} from 'react-native';
import { ChevronRight, Check, Circle } from 'lucide-react-native';

// 1. Root: 상태 관리를 위한 Wrapper
export const DropdownMenu = ({ children }: any) => <View>{children}</View>;

// 2. Trigger: 메뉴를 여는 버튼 영역
export const DropdownMenuTrigger = ({ children, onPress }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    {children}
  </TouchableOpacity>
);

// 3. Content: 실제 메뉴가 뜨는 모달 영역
export const DropdownMenuContent = ({ 
  visible, 
  onClose, 
  children, 
  style 
}: { 
  visible: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  style?: any;
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
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

// 4. Items & Elements
export const DropdownMenuItem = ({ children, onPress, disabled }: any) => (
  <TouchableOpacity 
    style={[styles.item, disabled && { opacity: 0.5 }]} 
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.itemText}>{children}</Text>
  </TouchableOpacity>
);

export const DropdownMenuLabel = ({ children }: any) => (
  <Text style={styles.label}>{children}</Text>
);

export const DropdownMenuSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', // 모바일에서는 중앙 배치가 가장 깔끔합니다.
    alignItems: 'center',
  },
  content: {
    minWidth: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  itemText: {
    fontSize: 15,
    color: '#0f172a',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
});
