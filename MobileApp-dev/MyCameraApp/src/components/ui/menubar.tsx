import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ScrollView, 
  TouchableWithoutFeedback 
} from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';

// 1. 메인 컨테이너 (가로 스크롤 지원)
export const Menubar = ({ children }: any) => {
  return (
    <View style={styles.menubarContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
};

// 2. 메뉴 트리거 (파일, 편집 등 제목 버튼)
export const MenubarMenu = ({ children }: any) => <View>{children}</View>;

export const MenubarTrigger = ({ children, onPress }: any) => (
  <TouchableOpacity style={styles.trigger} onPress={onPress}>
    <Text style={styles.triggerText}>{children}</Text>
  </TouchableOpacity>
);

// 3. 메뉴 내용 (팝업 모달)
export const MenubarContent = ({ visible, onClose, children }: any) => {
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

// 4. 메뉴 항목들
export const MenubarItem = ({ children, onPress }: any) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Text style={styles.itemText}>{children}</Text>
  </TouchableOpacity>
);

export const MenubarSeparator = () => <View style={styles.separator} />;

export const MenubarLabel = ({ children }: any) => (
  <Text style={styles.label}>{children}</Text>
);

const styles = StyleSheet.create({
  menubarContainer: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 4,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#334155',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
});