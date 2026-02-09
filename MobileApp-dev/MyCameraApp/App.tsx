import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
// ❗ 중요: 상대 경로 체크 (App.tsx가 루트에 있다면 아래 경로가 맞습니다)
import Index from "./src/pages/Index"; 

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {/* 드디어 동료의 UI가 여기서 나타납니다! */}
        <Index />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}