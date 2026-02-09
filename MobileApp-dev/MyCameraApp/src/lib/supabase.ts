import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 추가 설치 필요
import type { Database } from '../integrations/supabase/types'; // 동료의 타입을 가져옵니다

// 1. 중요: 동료의 .env 파일에 있는 실제 값을 여기에 문자열로 직접 넣으세요.
// (또는 EXPO_PUBLIC_... 환경변수를 설정하세요)
// .env에서 찾은 실제 값들을 직접 할당합니다.
const SUPABASE_URL = "https://woaznfccusbluwoawmtn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvYXpuZmNjdXNibHV3b2F3bXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNDIzMTEsImV4cCI6MjA4NDYxODMxMX0.ZkejAR98njUm89H1DP_5j_8wR0HKn8BRxfh6j3QhWJQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // 2. localStorage 대신 AsyncStorage를 사용해야 로그인이 유지됩니다.
    storage: AsyncStorage as any, 
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // 모바일에서는 false로 설정
  },
});