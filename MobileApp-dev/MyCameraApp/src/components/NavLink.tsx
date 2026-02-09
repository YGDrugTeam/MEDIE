import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
// 만약 React Navigation을 사용 중이라면 아래 주석을 해제하세요.
// import { useNavigation, useRoute } from '@react-navigation/native';

interface NavLinkProps {
  to: string;               // 이동할 화면 이름
  children: React.ReactNode;
  className?: string;        // (웹 호환용, 실제론 스타일 객체 사용 권장)
  style?: ViewStyle;         // 기본 컨테이너 스타일
  activeStyle?: ViewStyle;   // 활성화 시 컨테이너 스타일
  textStyle?: TextStyle;     // 기본 텍스트 스타일
  activeTextStyle?: TextStyle; // 활성화 시 텍스트 스타일
  isActive?: boolean;        // 현재 활성화 여부 (수동 제어용)
  onPress?: () => void;
}

export const NavLink = ({ 
  to, 
  children, 
  style, 
  activeStyle, 
  textStyle, 
  activeTextStyle,
  isActive: manualIsActive,
  onPress 
}: NavLinkProps) => {
  // 실제 앱이라면 route.name === to 로 isActive를 판단합니다.
  const isActive = manualIsActive; 

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.base, 
        style, 
        isActive && styles.activeBase, 
        isActive && activeStyle
      ]}
      activeOpacity={0.7}
    >
      {typeof children === "string" ? (
        <Text style={[
          styles.textBase, 
          textStyle, 
          isActive && styles.activeText, 
          isActive && activeTextStyle
        ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBase: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // 연한 파란색 배경
  },
  textBase: {
    fontSize: 16,
    color: '#64748b', // 기본 무채색
    fontWeight: '500',
  },
  activeText: {
    color: '#3b82f6', // 활성화 시 파란색
    fontWeight: '700',
  },
});