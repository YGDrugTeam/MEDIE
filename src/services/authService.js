import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  login as kakaoLogin,
  logout as kakaoLogout,
  getProfile,
} from '@react-native-seoul/kakao-login';

const API_BASE = 'http://20.106.40.121';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  USER: 'USER',
};

function getErrorMessage(error, fallback = '요청 처리 중 오류가 발생했습니다.') {
  if (!error) return fallback;

  if (typeof error === 'string') return error;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;

  return fallback;
}

async function parseResponse(res) {
  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error('서버 응답을 읽는 중 문제가 발생했습니다.');
  }

  if (!res.ok) {
    throw new Error(
      data?.message ||
      data?.detail ||
      '서버 요청 중 오류가 발생했습니다.'
    );
  }

  return data;
}

async function saveAuthData(data) {
  const accessToken = data?.access_token;
  const user = data?.user;

  if (!accessToken) {
    throw new Error('서버 access_token이 없습니다.');
  }

  if (!user) {
    throw new Error('서버 user 정보가 없습니다.');
  }

  const userId = String(user?.id ?? '');
  const userEmail = user?.email ?? '';
  const userNickname = user?.nickname ?? user?.name ?? '사용자';
  const loginType = user?.login_type ?? 'local';

  await AsyncStorage.multiSet([
    [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
    [STORAGE_KEYS.USER, JSON.stringify(user)],
  ]);

  await SecureStore.setItemAsync('access_token', accessToken);
  await SecureStore.setItemAsync('user_id', userId);
  await SecureStore.setItemAsync('user_email', userEmail);
  await SecureStore.setItemAsync('user_name', userNickname);
  await SecureStore.setItemAsync('user_nickname', userNickname);
  await SecureStore.setItemAsync('login_type', loginType);
}

export async function getStoredAccessToken() {
  return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function clearAuthData() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.USER,
  ]);

  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('user_id');
  await SecureStore.deleteItemAsync('user_email');
  await SecureStore.deleteItemAsync('user_name');
  await SecureStore.deleteItemAsync('user_nickname');
  await SecureStore.deleteItemAsync('login_type');
}

export async function registerWithEmail({ email, password, nickname }) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, nickname }),
    });

    const data = await parseResponse(res);
    await saveAuthData(data);

    return {
      success: true,
      data,
    };
  } catch (e) {
    return {
      success: false,
      message: getErrorMessage(e, '회원가입에 실패했습니다.'),
    };
  }
}

export async function loginWithEmail({ email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseResponse(res);
    await saveAuthData(data);

    return {
      success: true,
      data,
    };
  } catch (e) {
    return {
      success: false,
      message: getErrorMessage(e, '로그인에 실패했습니다.'),
    };
  }
}

export async function loginWithKakao() {
  try {
    const token = await kakaoLogin();

    if (!token?.accessToken) {
      throw new Error('카카오 access token을 받지 못했습니다.');
    }

    let kakaoProfile = null;
    try {
      kakaoProfile = await getProfile();
    } catch (e) {
      kakaoProfile = null;
    }

    const res = await fetch(`${API_BASE}/auth/kakao/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: token.accessToken,
      }),
    });

    const data = await parseResponse(res);
    await saveAuthData(data);

    return {
      success: true,
      data,
      kakaoProfile,
    };
  } catch (e) {
    console.log('loginWithKakao 원본 에러 =', e);
    console.log('loginWithKakao 원본 에러 message =', e?.message);
    console.log('loginWithKakao 원본 에러 stack =', e?.stack);

    return {
      success: false,
      message: getErrorMessage(e, '카카오 로그인에 실패했습니다.'),
    };
  }
}

export async function logoutAll() {
  try {
    try {
      await kakaoLogout();
    } catch (e) {}

    await clearAuthData();

    return { success: true };
  } catch (e) {
    return {
      success: false,
      message: getErrorMessage(e, '로그아웃에 실패했습니다.'),
    };
  }
}