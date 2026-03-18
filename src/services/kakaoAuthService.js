import { login, logout, getProfile } from '@react-native-seoul/kakao-login';

const API_BASE = 'https://medichubs-backend.azurewebsites.net';

function getErrorMessage(error, fallback = '카카오 로그인에 실패했습니다.') {
  if (!error) return fallback;

  if (typeof error === 'string') return error;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;

  return fallback;
}

export async function loginWithKakao() {
  try {
    // 1) 카카오 SDK 로그인
    const token = await login();

    if (!token?.accessToken) {
      throw new Error('카카오 access token을 받지 못했습니다.');
    }

    // 2) 선택: 프로필 미리 확인
    const profile = await getProfile().catch(() => null);

    // 3) 우리 FastAPI로 전달
    const res = await fetch(`${API_BASE}/auth/kakao/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kakao_access_token: token.accessToken,
      }),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('서버 응답을 읽는 중 문제가 발생했습니다.');
    }

    if (!res.ok) {
      throw new Error(
        data?.message ||
          data?.detail ||
          '카카오 로그인 처리 중 오류가 발생했습니다.'
      );
    }

    return {
      success: true,
      data,
      kakaoProfile: profile,
    };
  } catch (e) {
    return {
      success: false,
      message: getErrorMessage(e),
    };
  }
}

export async function logoutKakao() {
  try {
    await logout();
    return { success: true };
  } catch (e) {
    return {
      success: false,
      message: getErrorMessage(e, '카카오 로그아웃에 실패했습니다.'),
    };
  }
}