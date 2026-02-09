import React, { forwardRef } from "react";
import { ScrollView, StyleSheet, View, ScrollViewProps } from "react-native";

// 1. ScrollViewProps를 직접 확장하여 속성들을 명확히 전달합니다.
export interface ScrollAreaProps extends ScrollViewProps {
  children: React.ReactNode;
  className?: string; // 웹 코드 호환용
  horizontal?: boolean;
}

const ScrollArea = forwardRef<ScrollView, ScrollAreaProps>(
  ({ children, style, horizontal = false, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <ScrollView
          ref={ref}
          style={[styles.viewport, style]}
          // 모바일 표준: 스크롤 시에만 잠시 바가 나타남
          showsVerticalScrollIndicator={!horizontal}
          showsHorizontalScrollIndicator={horizontal}
          horizontal={horizontal}
          {...props}
        >
          {children}
        </ScrollView>
      </View>
    );
  }
);

ScrollArea.displayName = "ScrollArea";

// 2. ScrollBar: 웹에서는 직접 구현하지만 모바일은 시스템 바를 따르거나 View로 커스텀
export const ScrollBar = () => null; // 모바일은 시스템 스크롤바를 사용하는 것이 표준이라 생략 가능합니다.

const styles = StyleSheet.create({
  container: {
    flex: 1, // 부모 영역을 꽉 채우도록 설정
    overflow: "hidden",
  },
  viewport: {
    flex: 1,
    width: "100%",
  },
});

export { ScrollArea };