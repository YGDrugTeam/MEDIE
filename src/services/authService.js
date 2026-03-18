import axios from "axios";
import { Alert } from "react-native";
import { getErrorMessage } from "../utils/getErrorMessage";
import { validateRegisterForm, validateLoginForm } from "../utils/validateAuthForm";

// 예시:
// const API_BASE_URL = "http://192.168.0.10:8000";
// const API_BASE_URL = "https://너의백엔드주소.azurewebsites.net";
const API_BASE_URL = "https://medichubs-backend.azurewebsites.net";

export async function registerUser({ email, password, name }) {
  const validationMessage = validateRegisterForm({ email, password, name });

  if (validationMessage) {
    Alert.alert("입력 오류", validationMessage);
    return { success: false, message: validationMessage };
  }

  try {
    const payload = {
      email: email.trim(),
      password: password.trim(),
      name: name.trim(),
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, payload);

    return {
      success: true,
      data: response.data,
      message: response?.data?.message || "회원가입이 완료되었습니다.",
    };
  } catch (error) {
    console.log("❌ register 실패 원본 =", error?.response?.data || error);

    const message = getErrorMessage(error, "회원가입에 실패했습니다.");

    return {
      success: false,
      message,
    };
  }
}

export async function loginUser({ email, password }) {
  const validationMessage = validateLoginForm({ email, password });

  if (validationMessage) {
    Alert.alert("입력 오류", validationMessage);
    return { success: false, message: validationMessage };
  }

  try {
    const payload = {
      email: email.trim(),
      password: password.trim(),
    };

    const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);

    return {
      success: true,
      data: response.data,
      message: response?.data?.message || "로그인되었습니다.",
    };
  } catch (error) {
    console.log("❌ login 실패 원본 =", error?.response?.data || error);

    const message = getErrorMessage(error, "로그인에 실패했습니다.");

    return {
      success: false,
      message,
    };
  }
}