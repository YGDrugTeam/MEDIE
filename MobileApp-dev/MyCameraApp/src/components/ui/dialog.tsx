import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback 
} from 'react-native';
import { X } from 'lucide-react-native';

// 1. Root: 상태 관리는 부모에서 하므로 View로 대체
export const Dialog = ({ children }: any) => <View>{children}</View>;

// 2. Content: 실제 팝업창의 핵심 로직
export const DialogContent = ({ 
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
      {/* 배경 터치 시 닫히도록 설정 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, style]}>
              {children}
              {/* 닫기 버튼 */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// 3. Header, Title, Description
export const DialogHeader = ({ children }: any) => <View style={styles.header}>{children}</View>;
export const DialogTitle = ({ children }: any) => <Text style={styles.title}>{children}</Text>;
export const DialogDescription = ({ children }: any) => <Text style={styles.description}>{children}</Text>;

// 4. Footer
export const DialogFooter = ({ children }: any) => <View style={styles.footer}>{children}</View>;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // 조원의 bg-black/80 반영
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    gap: 16,
    position: 'relative',
    elevation: 5, // 안드로이드 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});