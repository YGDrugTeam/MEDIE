import * as React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useToast } from "../../hooks/use-toast.ts"; // 훅 경로 확인!
import { 
  Toast, 
  ToastTitle, 
  ToastDescription, 
  ToastProvider 
} from "./toast"; 

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {/* SafeAreaView를 써야 아이폰 노치(M자 부분)에 알림이 가려지지 않습니다. */}
      <SafeAreaView style={styles.viewport} pointerEvents="box-none">
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <Toast key={id} {...props} style={styles.toastMargin}>
              <View style={styles.grid}>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </View>
              {/* 액션 버튼이 있다면 여기에 렌더링 */}
              {action && <View style={styles.actionContainer}>{action}</View>}
            </Toast>
          );
        })}
      </SafeAreaView>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  viewport: {
    // 화면 전체를 덮되 클릭은 통과하게 설정 (pointerEvents="box-none")
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: "center", // 토스트를 가운데 정렬
    paddingTop: 10,
  },
  toastMargin: {
    marginBottom: 8, // 토스트가 여러 개일 때 사이 간격
  },
  grid: {
    flexDirection: "column",
    gap: 4, // 웹의 gap-1과 유사한 효과
  },
  actionContainer: {
    marginLeft: 10,
  }
});