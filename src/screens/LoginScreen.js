import React, { useState } from 'react';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
import { loginWithEmail } from '../services/authService';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://20.106.40.121';

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
      console.log('✅ 이메일 로그인 버튼 눌림');

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

    <LinearGradient
      colors={['#E8F5E9', '#FFFDE7']} // 원하는 색
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <View style={styles.inner}>
          <Text style={styles.title}> </Text>

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

          <TouchableOpacity onPress={() => setAppMode('REGISTER')}>
            <Text style={styles.link}>회원가입 하러가기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '처리 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleKakaoLogin}
            disabled={loading}
            style={{ alignSelf: 'center', marginTop: 8 }}
          >
            <Image
              source={require('../../assets/kakaologin.png')}
              style={{ width: 87, height: 48 }}
              resizeMode="contain"
            />
          </TouchableOpacity>



          <TouchableOpacity onPress={() => setAppMode('HOME')}>
            <Text style={styles.cancelLink}>취소</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
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
    height: 43,
    width: 87,
    borderRadius: 12,
    backgroundColor: '#67A369',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
    color: '#000000',
    marginBottom: 6,
    fontWeight: '600',
  },
  cancelLink: {
    textAlign: 'center',
    marginTop: 10,
    color: '#777',
    fontWeight: '500',
  },
});