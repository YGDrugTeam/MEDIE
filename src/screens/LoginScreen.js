import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { loginWithKakao } from '../services/kakaoAuthService';
import { styles } from '../styles/commonStyles';

const API_BASE = 'https://medichubs-backend.azurewebsites.net';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      Alert.alert('입력 확인', '이메일을 입력해주세요.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('입력 확인', '올바른 이메일 형식으로 입력해주세요.');
      return;
    }

    if (!trimmedPassword) {
      Alert.alert('입력 확인', '비밀번호를 입력해주세요.');
      return;
    }

    if (trimmedPassword.length < 4) {
      Alert.alert('입력 확인', '비밀번호는 최소 4자 이상 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('로그인 응답 원문:', text);
        throw new Error('서버 응답을 읽는 중 문제가 발생했습니다.');
      }

      console.log('로그인 status =', res.status);
      console.log('로그인 data =', data);

      if (!res.ok) {
        throw new Error(getErrorMessage(data, '로그인에 실패했습니다.'));
      }

      if (!data?.access_token) {
        throw new Error('로그인 응답에 access_token이 없습니다.');
      }

      if (!data?.user) {
        throw new Error('로그인 응답에 사용자 정보가 없습니다.');
      }

      await SecureStore.setItemAsync('access_token', String(data.access_token));
      await SecureStore.setItemAsync('user_id', String(data.user.id ?? ''));
      await SecureStore.setItemAsync('user_name', String(data.user.name ?? ''));
      await SecureStore.setItemAsync('user_email', String(data.user.email ?? ''));

      setUser(data.user);
      setIsLoggedIn(true);

      Alert.alert('완료', `${data.user.name || '사용자'}님 로그인되었습니다.`, [
        {
          text: '확인',
          onPress: () => setAppMode('HOME'),
        },
      ]);
    } catch (e) {
      console.error('❌ login 실패:', e);
      Alert.alert('오류', e?.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const result = await loginWithKakao();

      if (!result.success) {
        Alert.alert('오류', result.message || '카카오 로그인에 실패했습니다.');
        return;
      }

      const data = result.data;

      await SecureStore.setItemAsync('access_token', String(data.access_token));
      await SecureStore.setItemAsync('user_id', String(data.user?.id ?? ''));
      await SecureStore.setItemAsync('user_name', String(data.user?.name ?? ''));
      await SecureStore.setItemAsync('user_email', String(data.user?.email ?? ''));

      setUser(data.user);
      setIsLoggedIn(true);

      Alert.alert('완료', `${data.user?.name || '사용자'}님 로그인되었습니다.`, [
        {
          text: '확인',
          onPress: () => setAppMode('HOME'),
        },
      ]);
    } catch (e) {
      Alert.alert('오류', e?.message || '카카오 로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>로그인</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#eee',
            }}
          >
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
              이메일
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#eee',
                color: '#111',
              }}
              placeholderTextColor="#999"
            />

            <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
              비밀번호
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#eee',
                color: '#111',
              }}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={isSubmitting}
            style={{
              marginTop: 18,
              backgroundColor: isSubmitting ? '#ccc' : '#FF7F50',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAppMode('HOME')}
            style={{
              marginTop: 12,
              backgroundColor: '#999',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              취소
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleKakaoLogin}
            disabled={isSubmitting}
            style={{
              marginTop: 12,
              borderRadius: 12,
              overflow: 'hidden',
              height: 52,
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('../../assets/kakaologin.png')}
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="stretch"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAppMode('REGISTER')}
            style={{
              marginTop: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FF7F50', fontWeight: '700', fontSize: 14 }}>
              회원가입 하러가기
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}