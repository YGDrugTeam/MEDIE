import * as React from "react";
import { View, Text, StyleSheet, Pressable, Modal, Dimensions, ViewProps } from "react-native";

// 1. 타입 정의
interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
}

// 2. 공급자 (웹 구조 유지를 위해 빈 껍데기로 생성)
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// 3. 메인 Tooltip 컴포넌트
const Tooltip = ({ children, content }: TooltipProps) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      {/* 트리거 역할을 하는 부분 (길게 누르면 툴팁 등장) */}
      <Pressable 
        onPress={() => setVisible(!visible)}
        onLongPress={() => setVisible(true)}
      >
        {children}
      </Pressable>

      {/* 툴팁 본문 (모달이나 절대 위치로 구현) */}
      {visible && (
        <View style={styles.tooltipWrapper}>
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
          <View style={styles.content}>
            {typeof content === "string" ? (
              <Text style={styles.text}>{content}</Text>
            ) : (
              content
            )}
            {/* 말꼬리 화살표 */}
            <View style={styles.arrow} />
          </View>
        </View>
      )}
    </View>
  );
};

// 웹용 구조와 호환을 위한 더미 컴포넌트들
const TooltipTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
  },
  tooltipWrapper: {
    position: "absolute",
    bottom: "120%", // 트리거 위로 배치
    zIndex: 1000,
    alignItems: "center",
    width: 200, // 기본 너비
  },
  backdrop: {
    position: "absolute", // ✅ React Native에서는 absolute를 사용합니다.
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
  },
  content: {
    backgroundColor: "#0f172a", // bg-popover (다크톤)
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: "#ffffff", // text-popover-foreground
    fontSize: 12,
    fontWeight: "500",
  },
  arrow: {
    position: "absolute",
    bottom: -4,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    backgroundColor: "#0f172a",
    transform: [{ rotate: "45deg" }],
  },
});

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };