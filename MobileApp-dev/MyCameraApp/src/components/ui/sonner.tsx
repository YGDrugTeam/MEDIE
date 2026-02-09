import * as React from "react";
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { View, Text } from "react-native";

/**
 * 1. 토스트 스타일 커스텀 설정
 * 조원분이 주신 웹 디자인(background, border 등)을 모바일에 맞게 이식합니다.
 */
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#10b981', backgroundColor: '#ffffff' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a'
      }}
      text2Style={{
        fontSize: 13,
        color: '#64748b'
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ef4444', backgroundColor: '#ffffff' }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a'
      }}
      text2Style={{
        fontSize: 13,
        color: '#64748b'
      }}
    />
  )
};

/**
 * 2. Toaster 컴포넌트
 * 이 컴포넌트는 App.tsx(최상단)에 한 번만 배치하면 됩니다.
 */
export const Toaster = () => {
  return <Toast config={toastConfig} />;
};

/**
 * 3. toast 함수 (웹의 toast() 함수와 사용법을 맞춤)
 */
export const toast = {
  success: (title: string, description?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: description,
    });
  },
  error: (title: string, description?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: description,
    });
  },
  message: (title: string, description?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: description,
    });
  }
};