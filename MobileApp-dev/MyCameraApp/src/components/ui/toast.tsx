import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewProps } from "react-native";
import { X } from "lucide-react-native"; // 모바일용 아이콘
import { cn } from "../../lib/utils";

// 1. 타입 정의 (className 및 Variant 대응)
interface ToastProps extends ViewProps {
  variant?: "default" | "destructive";
  className?: string;
}

// 2. 제목 (ToastTitle)
const ToastTitle = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

// 3. 설명 (ToastDescription)
const ToastDescription = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

// 4. 메인 컴포넌트 (Toast)
const Toast = React.forwardRef<View, ToastProps>(
  ({ variant = "default", children, style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          styles.toastBase,
          variant === "destructive" ? styles.destructive : styles.default,
          style,
        ]}
        {...props}
      >
        <View style={styles.textContainer}>
          {children}
        </View>
        <TouchableOpacity style={styles.closeButton}>
          <X size={16} color={variant === "destructive" ? "#fee2e2" : "#94a3b8"} />
        </TouchableOpacity>
      </View>
    );
  }
);

// 1. ToastProvider가 무엇인지 정의합니다.
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const styles = StyleSheet.create({
  toastBase: {
    position: 'absolute',
    top: 50, // 화면 상단 배치
    left: 20,
    right: 20,
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5, // Android 그림자
    shadowColor: "#000", // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
  },
  default: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  destructive: {
    backgroundColor: "#ef4444", // bg-destructive
    borderColor: "#ef4444",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#64748b",
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

// 타이틀과 디스크립션에서 색상 반전 (Destructive일 경우)
// 실제 사용 시 스타일을 직접 입히거나 헬퍼 함수를 쓸 수 있습니다.

export { Toast, ToastTitle, ToastDescription, ToastProvider };