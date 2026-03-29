import { loginWithKakaoAccount, logout, getProfile } from '@react-native-seoul/kakao-login';

const API_BASE = 'http://20.106.40.121';

function getErrorMessage(error, fallback = '카카오 로그인에 실패했습니다.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
}

export async function loginWithKakao() {
  try {
    const token = await loginWithKakaoAccount();

    if (!token?.accessToken) {
      throw new Error('카카오 access token을 받지 못했습니다.');
    }

    let profile = null;
    try {
      profile = await getProfile();
    } catch (e) {
      profile = null;
    }

    return {
      success: true,
      data: {
        access_token: token.accessToken,
        user: {
          id: profile?.id ? String(profile.id) : '',
          name: profile?.nickname || '카카오사용자',
          email: profile?.email || '',
        },
      },
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