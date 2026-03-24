import React, { useState } from 'react';
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
import { registerWithEmail } from '../services/authService';

export default function RegisterScreen({ setAppMode, setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !nickname.trim() || !password.trim() || !passwordConfirm.trim()) {
      Alert.alert('안내', '모든 항목을 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('안내', '비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerWithEmail({
        email: email.trim(),
        nickname: nickname.trim(),
        password: password.trim(),
      });

      if (!result.success) {
        Alert.alert('회원가입 실패', result.message);
        return;
      }

      setIsLoggedIn(true);
      setUser(result.data?.user || null);
      setAppMode('HOME');
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
        <Text style={styles.title}>회원가입</Text>

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

        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임을 입력하세요"
          placeholderTextColor="#999"
          value={nickname}
          onChangeText={setNickname}
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

        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 다시 입력하세요"
          placeholderTextColor="#999"
          secureTextEntry
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />

        <TouchableOpacity onPress={() => setAppMode('LOGIN')}>
          <Text style={styles.link}>로그인 화면으로 돌아가기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '처리 중...' : '회원가입'}
          </Text>
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
    height: 79,
    width:88,
    borderRadius: 100,
    backgroundColor: '#10B981',
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
  link: {
    textAlign: 'center',
    color: '#000000',
    marginBottom:6,
    fontWeight: '600',
  },
  cancelLink: {
    textAlign: 'center',
    marginTop: 10,
    color: '#777',
    fontWeight: '500',
  },
});