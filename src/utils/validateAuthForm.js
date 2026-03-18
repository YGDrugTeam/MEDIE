export function validateRegisterForm({ email, password, name }) {
  if (!email?.trim()) {
    return "이메일을 입력해주세요.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "올바른 이메일 형식으로 입력해주세요.";
  }

  if (!password?.trim()) {
    return "비밀번호를 입력해주세요.";
  }

  if (password.trim().length < 4) {
    return "비밀번호는 최소 4자 이상 입력해주세요.";
  }

  if (!name?.trim()) {
    return "이름을 입력해주세요.";
  }

  return null;
}

export function validateLoginForm({ email, password }) {
  if (!email?.trim()) {
    return "이메일을 입력해주세요.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "올바른 이메일 형식으로 입력해주세요.";
  }

  if (!password?.trim()) {
    return "비밀번호를 입력해주세요.";
  }

  if (password.trim().length < 4) {
    return "비밀번호는 최소 4자 이상 입력해주세요.";
  }

  return null;
}