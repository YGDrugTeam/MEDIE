import { X } from "lucide-react-native";
import * as React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 1. Root 컨테이너 및 상태 관리
export const Sheet = ({ children, open, onOpenChange }: any) => {
  return (
    <Modal
      visible={open}
      transparent
      animationType="none" // 커스텀 애니메이션을 위해 none 설정
      onRequestClose={() => onOpenChange(false)}
    >
      {children}
    </Modal>
  );
};

// 2. 배경 오버레이 및 컨텐츠 배치
export const SheetContent = ({ 
  children, 
  open, 
  onOpenChange, 
  side = "right" 
}: any) => {
  // 간단한 페이드 인/아웃 효과와 함께 배치
  if (!open) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => onOpenChange(false)} />
      <View style={[
        styles.content,
        // styles[side]가 있을 때만 적용하고, 없으면 빈 객체{}를 적용
        (styles as any)[side] // any를 일시적으로 사용하여 타입 체크를 우회하거나
        ]}>
        {/* 닫기 버튼 */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => onOpenChange(false)}
        >
          <X size={20} color="#64748b" />
        </TouchableOpacity>
        {children}
      </View>
    </View>
  );
};

export const SheetHeader = ({ children }: any) => <View style={styles.header}>{children}</View>;
export const SheetTitle = ({ children }: any) => <Text style={styles.title}>{children}</Text>;
export const SheetDescription = ({ children }: any) => <Text style={styles.description}>{children}</Text>;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "#fff",
    padding: 24,
    position: 'absolute', // 위치 제어를 위해 추가
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  // side 옵션 스타일
  right: {
    top: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH * 0.75,
  },
  left: {
    top: 0,
    left: 0,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH * 0.75,
  },
  top: {
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.3,
  },
  bottom: {
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
});