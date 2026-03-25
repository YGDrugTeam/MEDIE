import { login, logout, getProfile } from '@react-native-seoul/kakao-login';

const API_BASE = 'https://172.169.59.206';

function getErrorMessage(error, fallback = '카카오 로그인에 실패했습니다.') {
  if (!error) return fallback;

  if (typeof error === 'string') return error;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;

  return fallback;
}

export async function loginWithKakao() {
  try {
    console.log('========== 카카오 SDK 로그인 시작 ==========');

    // 1) 카카오 SDK 로그인
    const token = await login();

    console.log('카카오 SDK token 전체 =', token);
    console.log('카카오 SDK accessToken =', token?.accessToken);
    console.log('카카오 SDK refreshToken =', token?.refreshToken);
    console.log('카카오 SDK idToken =', token?.idToken);

    if (!token?.accessToken) {
      throw new Error('카카오 access token을 받지 못했습니다.');
    }

    // 2) 선택: 프로필 미리 확인
    let profile = null;
    try {
      profile = await getProfile();
      console.log('카카오 프로필 조회 성공 =', profile);
    } catch (profileError) {
      console.log('카카오 프로필 조회 실패 =', profileError);
      profile = null;
    }

    const requestBody = {
      access_token: token.accessToken,
    };

    console.log('백엔드로 보낼 body =', requestBody);
    console.log('백엔드로 보낼 access_token =', requestBody.access_token);

    // 3) 우리 FastAPI로 전달
    const res = await fetch(`${API_BASE}/auth/kakao/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const text = await res.text();

    console.log('백엔드 응답 status =', res.status);
    console.log('백엔드 응답 text =', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.log('백엔드 응답 JSON 파싱 실패 =', parseError);
      throw new Error('서버 응답을 읽는 중 문제가 발생했습니다.');
    }

    console.log('백엔드 응답 data =', data);
    console.log('백엔드 응답 access_token =', data?.access_token);
    console.log('백엔드 응답 user =', data?.user);

    if (!res.ok) {
      throw new Error(
        data?.message ||
          data?.detail ||
          '카카오 로그인 처리 중 오류가 발생했습니다.'
      );
    }

    if (!data?.access_token) {
      throw new Error('백엔드 응답에 우리 서비스 access_token이 없습니다.');
    }

    if (!data?.user) {
      throw new Error('백엔드 응답에 user 정보가 없습니다.');
    }

    console.log('========== 카카오 로그인 최종 성공 ==========');

    return {
      success: true,
      data,
      kakaoProfile: profile,
    };
  } catch (e) {
    console.log('========== 카카오 로그인 실패 ==========');
    console.log('카카오 로그인 에러 원본 =', e);

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