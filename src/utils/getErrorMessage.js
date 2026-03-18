export function getErrorMessage(error, defaultMessage = "요청 처리 중 오류가 발생했습니다.") {
  const data = error?.response?.data;

  // 서버 응답 없음
  if (!data) {
    if (error?.message?.includes("Network Error")) {
      return "네트워크 연결을 확인해주세요.";
    }
    return error?.message || defaultMessage;
  }

  // 문자열 응답
  if (typeof data === "string") {
    return data;
  }

  // 백엔드 통일 message
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  // FastAPI 기본 detail 문자열
  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  // errors 배열
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join("\n");
  }

  // detail 배열
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const first = data.detail[0];

    if (typeof first === "string") return first;
    if (typeof first?.msg === "string") return first.msg;
  }

  return defaultMessage;
}