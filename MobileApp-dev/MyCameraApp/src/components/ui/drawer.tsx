import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// 1. Root 컨테이너
export const Drawer = ({ children }: any) => <View>{children}</View>;

// 2. Content: 아래에서 올라오는 핵심 영역
export const DrawerContent = ({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  children: React.ReactNode 
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide" // 아래에서 위로 올라오는 효과
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* 실제 시트 부분 */}
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              {/* 조원 코드의 Handle (가운데 짧은 선) */}
              <View style={styles.handle} />
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// 3. Header, Footer, Title, Description
export const DrawerHeader = ({ children }: any) => <View style={styles.header}>{children}</View>;
export const DrawerTitle = ({ children }: any) => <Text style={styles.title}>{children}</Text>;
export const DrawerDescription = ({ children }: any) => <Text style={styles.description}>{children}</Text>;
export const DrawerFooter = ({ children }: any) => <View style={styles.footer}>{children}</View>;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // 바닥에 붙도록 설정
  },
  content: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40, // 하단 홈 버튼 영역 여백
    maxHeight: SCREEN_HEIGHT * 0.8, // 화면의 80%까지만 올라오도록
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    gap: 10,
  }
});