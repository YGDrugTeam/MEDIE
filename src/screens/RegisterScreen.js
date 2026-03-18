import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../styles/commonStyles';

const API_BASE = 'https://medichubs-backend.azurewebsites.net';

function getErrorMessage(data, fallback = '회원가입에 실패했습니다.') {
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

export default function RegisterScreen({ setAppMode, setIsLoggedIn, setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPasswordConfirm = passwordConfirm.trim();

    if (!trimmedName) {
      Alert.alert('입력 확인', '이름을 입력해주세요.');
      return;
    }

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

    if (!trimmedPasswordConfirm) {
      Alert.alert('입력 확인', '비밀번호 확인을 입력해주세요.');
      return;
    }

    if (trimmedPassword !== trimmedPasswordConfirm) {
      Alert.alert('입력 확인', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('회원가입 응답 원문:', text);
        throw new Error('서버 응답을 읽는 중 문제가 발생했습니다.');
      }

      console.log('회원가입 status =', res.status);
      console.log('회원가입 data =', data);

      if (!res.ok) {
        throw new Error(getErrorMessage(data, '회원가입에 실패했습니다.'));
      }

      if (!data?.access_token) {
        throw new Error('회원가입 응답에 access_token이 없습니다.');
      }

      if (!data?.user) {
        throw new Error('회원가입 응답에 사용자 정보가 없습니다.');
      }

      await SecureStore.setItemAsync('access_token', String(data.access_token));
      await SecureStore.setItemAsync('user_id', String(data.user.id ?? ''));
      await SecureStore.setItemAsync('user_name', String(data.user.name ?? ''));
      await SecureStore.setItemAsync('user_email', String(data.user.email ?? ''));

      setUser(data.user);
      setIsLoggedIn(true);

      Alert.alert('완료', '회원가입이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => setAppMode('HOME'),
        },
      ]);
    } catch (e) {
      console.error('❌ register 실패:', e);
      Alert.alert('오류', e?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>회원가입</Text>

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
              이름
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력하세요"
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
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#eee',
                color: '#111',
              }}
              placeholderTextColor="#999"
            />

            <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
              비밀번호 확인
            </Text>
            <TextInput
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="비밀번호를 다시 입력하세요"
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
            onPress={handleRegister}
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
              {isSubmitting ? '가입 중...' : '회원가입'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAppMode('LOGIN')}
            style={{
              marginTop: 12,
              backgroundColor: '#999',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              로그인으로 돌아가기
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}