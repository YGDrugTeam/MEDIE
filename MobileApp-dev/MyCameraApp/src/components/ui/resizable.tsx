import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import { GripVertical } from "lucide-react-native";

// 1. Group: 전체 레이아웃 컨테이너
export const ResizablePanelGroup = ({ children, direction = "horizontal" }: any) => {
  return (
    <View style={[styles.group, direction === "vertical" ? styles.vertical : styles.horizontal]}>
      {children}
    </View>
  );
};

// 2. Panel: 실제 컨텐츠가 담기는 공간
export const ResizablePanel = ({ children, flex = 1 }: any) => {
  return <View style={{ flex }}>{children}</View>;
};

// 3. Handle: 사용자가 잡고 끄는 구분선
export const ResizableHandle = ({ withHandle }: { withHandle?: boolean }) => {
  // 실제 앱에서는 이 핸들을 통해 부모의 flex 값을 조절하는 로직이 추가되어야 하지만,
  // Expo에서는 보통 고정된 분할 비율을 토글하거나 슬라이더를 사용하는 것이 더 안정적입니다.
  return (
    <View style={styles.handleContainer}>
      <View style={styles.line} />
      {withHandle && (
        <View style={styles.handleVisual}>
          <GripVertical size={12} color="#64748b" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  horizontal: {
    flexDirection: "row",
  },
  vertical: {
    flexDirection: "column",
  },
  handleContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 20, // 터치 영역 확보를 위해 웹보다 넓게 설정
    backgroundColor: "transparent",
    zIndex: 10,
  },
  line: {
    width: 1,
    height: "100%",
    backgroundColor: "#e2e8f0",
  },
  handleVisual: {
    position: "absolute",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 2,
  },
});