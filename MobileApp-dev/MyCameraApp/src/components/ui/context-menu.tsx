import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  TouchableWithoutFeedback 
} from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';

// 1. 메인 컨테이너 (상태 관리)
export const ContextMenu = ({ children }: any) => {
  return <View>{children}</View>;
};

// 2. 트리거 (길게 누르는 영역)
export const ContextMenuTrigger = ({ children, onLongPress }: any) => {
  return (
    <TouchableOpacity onLongPress={onLongPress} delayLongPress={500} activeOpacity={0.8}>
      {children}
    </TouchableOpacity>
  );
};

// 3. 실제 메뉴 내용 (모달 형태)
export const ContextMenuContent = ({ visible, onClose, children }: any) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// 4. 각 메뉴 항목
export const ContextMenuItem = ({ children, onPress, inset }: any) => (
  <TouchableOpacity style={[styles.item, inset && { paddingLeft: 30 }]} onPress={onPress}>
    <Text style={styles.itemText}>{children}</Text>
  </TouchableOpacity>
);

// 5. 구분선
export const ContextMenuSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  itemText: {
    fontSize: 14,
    color: '#1e293b',
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
});