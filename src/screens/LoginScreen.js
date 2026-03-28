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
  Image,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store'; 
import { loginWithEmail } from '../services/authService';
import { loginWithKakao } from '../services/kakaoAuthService';

export default function LoginScreen({ setAppMode, setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 로그인 로직 수정 ---
  async function handleEmailLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('안내', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithEmail({ email: email.trim(), password: password.trim() });
      if (!result.success) {
        Alert.alert('로그인 실패', result.message);
        return;
      }

      const token = result.data?.access_token || result.data?.token;
      const userObj = result.data?.user;

      if (token) {
        // App.js에서 사용하는 키값('accessToken')으로 통일해서 저장
        await SecureStore.setItemAsync('accessToken', token);
        await SecureStore.setItemAsync('userId', String(userObj?.id || ''));
        await SecureStore.setItemAsync('userName', userObj?.name || userObj?.nickname || '');
        await SecureStore.setItemAsync('userEmail', userObj?.email || '');
      }

      setUser(userObj || null);
      setIsLoggedIn(true);
      setAppMode('MEDICATION_ONBOARDING');
    } catch (e) {
      Alert.alert('로그인 실패', e?.message || '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }

  // 카카오 로그인도 동일하게 수정 
  async function handleKakaoLogin() {
    setLoading(true);
    try {
      const result = await loginWithKakao();
      if (!result.success) { Alert.alert('카카오 로그인 실패', result.message); return; }

      const token = result.data?.access_token || result.data?.token;
      const userObj = result.data?.user;

      if (token) {
        await SecureStore.setItemAsync('accessToken', token);
        await SecureStore.setItemAsync('userId', String(userObj?.id || ''));
      }

      setUser(userObj || null);
      setIsLoggedIn(true);
      setAppMode('MEDICATION_ONBOARDING');
    } catch (e) {
      Alert.alert('카카오 로그인 실패', e?.message || '알 수 없는 오류');
    } finally { setLoading(false); }
  }

  return (
    <LinearGradient colors={['#F9FFF9', '#F0F4F0']} style={styles.flex}>
      {/* ... (기존 return 내부 UI 코드는 동일) ... */}
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
          >
            <View style={styles.headerArea}>
              <Text style={styles.welcomeText}>반가워요!</Text>
              <Text style={styles.subText}>로그인하고 건강을 관리해보세요.</Text>
            </View>

            <View style={styles.formArea}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#aaa"
              />

              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#aaa"
              />

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? '처리 중...' : '로그인'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleKakaoLogin}
                style={styles.kakaoWrap}
              >
                <Image
                  source={require('../../assets/kakaologin.png')}
                  style={{ width: '100%', height: 52 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => setAppMode('REGISTER')}>
                <Text style={styles.footerText}>
                  계정이 없으신가요? <Text style={styles.linkText}>회원가입</Text>
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
    paddingTop: 60, // 상단 여백을 충분히 주어 글자가 덜 올라가게 함
    paddingBottom: 40,
  },
  headerArea: {
    marginBottom: 60, // 글자와 입력창 사이 간격 확보
  },
  welcomeText: {
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
    marginTop: 10,
    // 그림자 살짝 넣어주면 더 고급져요
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
  kakaoWrap: {
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  footer: {
    marginTop: 'auto', // 내용이 적을 때 바닥에 붙도록 함
    paddingTop: 30,
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