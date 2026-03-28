import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registerWithEmail } from '../services/authService';

export default function RegisterScreen({ setAppMode, setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 회원가입 로직 ---
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
      setAppMode('MEDICATION_ONBOARDING'); // 가입 성공 시 온보딩으로 이동
    } catch (error) {
      Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#F9FFF9', '#F0F4F0']} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollInner}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerArea}>
              <Text style={styles.titleText}>회원가입</Text>
              <Text style={styles.subText}>간편하게 가입하고 건강 관리를 시작하세요.</Text>
            </View>

            <View style={styles.formArea}>
              <Text style={styles.label}>이메일 주소</Text>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#aaa"
              />

              <Text style={styles.label}>닉네임</Text>
              <TextInput
                style={styles.input}
                placeholder="사용하실 닉네임을 입력하세요"
                value={nickname}
                onChangeText={setNickname}
                placeholderTextColor="#aaa"
              />

              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="6자리 이상 입력하세요"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#aaa"
              />

              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
                placeholderTextColor="#aaa"
              />

              {/* 📍 회원가입 버튼 */}
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? '처리 중...' : '회원가입 완료'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 📍 푸터 영역 */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => setAppMode('LOGIN')}>
                <Text style={styles.footerText}>
                  이미 계정이 있으신가요? <Text style={styles.linkText}>로그인</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollInner: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerArea: {
    marginBottom: 45,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1B5E20',
    marginBottom: 10,
    letterSpacing: -1,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  formArea: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 58,
    borderWidth: 1.5,
    borderColor: '#E2E8E2',
    borderRadius: 15,
    paddingHorizontal: 18,
    marginBottom: 18,
    backgroundColor: '#fff',
    color: '#222',
    fontSize: 16,
  },
  button: {
    height: 58,
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#67A369', 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#777',
  },
  linkText: {
    color: '#67A369',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});