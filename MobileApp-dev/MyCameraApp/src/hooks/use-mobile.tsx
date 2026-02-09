import * as React from "react";
import { useWindowDimensions } from "react-native";

// 모바일/태블릿 기준점 (필요에 따라 조절하세요)
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // useWindowDimensions는 화면 크기가 변할 때마다(회전 등) 자동으로 리렌더링을 일으킵니다.
  const { width } = useWindowDimensions();

  // 너비가 기준점보다 작으면 true를 반환합니다.
  return width < MOBILE_BREAKPOINT;
}