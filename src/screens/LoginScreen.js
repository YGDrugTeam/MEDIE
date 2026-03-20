import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { loginWithKakao } from '../services/kakaoAuthService';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://medichubs-backend.azurewebsites.net';

function getErrorMessage(data, fallback = '로그인에 실패했습니다.') {
  if (!data) return fallback;

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join('\n');
  }

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return data.detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item?.msg === 'string') return item.msg;
        return null;
      })
      .filter(Boolean)
      .join('\n');
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }

  return fallback;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function LoginScreen({ setAppMode, setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('안내', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithEmail({
        email: email.trim(),
        password: password.trim(),
      });

      if (!result.success) {
        Alert.alert('로그인 실패', result.message);
        return;
      }

      setIsLoggedIn(true);
      setUser(result.data?.user || null);
      setAppMode('HOME');
    } finally {
      setLoading(false);
    }
  }

  async function handleKakaoLogin() {
    setLoading(true);
    try {
      const result = await loginWithKakao();

      if (!result.success) {
        Alert.alert('카카오 로그인 실패', result.message);
        return;
      }

      setIsLoggedIn(true);
      setUser(result.data?.user || null);
      setAppMode('HOME');
    } catch (e) {
      console.log('카카오 로그인 실제 에러 =', e);
      Alert.alert('카카오 로그인 실패', e?.message || '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>로그인</Text>

        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일을 입력하세요"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '처리 중...' : '일반 로그인'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.kakaoButton]}
          onPress={handleKakaoLogin}
          disabled={loading}
        >
          <Text style={[styles.buttonText, styles.kakaoButtonText]}>
            카카오 로그인
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAppMode('REGISTER')}>
          <Text style={styles.link}>회원가입 하러가기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAppMode('HOME')}>
          <Text style={styles.cancelLink}>취소</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#fff',
    color: '#222',
  },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
  },
  kakaoButtonText: {
    color: '#191919',
  },
  link: {
    textAlign: 'center',
    marginTop: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  cancelLink: {
    textAlign: 'center',
    marginTop: 10,
    color: '#777',
    fontWeight: '500',
  },
});