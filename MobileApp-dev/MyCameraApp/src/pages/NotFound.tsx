import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// 만약 React Navigation을 사용한다면 아래 주석을 해제하세요.
// import { useNavigation } from "@react-navigation/native";

const NotFound = () => {
  // const navigation = useNavigation();

  useEffect(() => {
    // 앱 환경에서는 pathname 대신 로그만 남기거나 에러 트래킹 서비스를 호출합니다.
    console.error("404 Error: User attempted to access a non-existent screen.");
  }, []);

  const handleGoHome = () => {
    // 홈 화면으로 이동하는 로직 (예시)
    // navigation.navigate("Home"); 
    console.log("홈으로 이동 버튼 클릭");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.message}>Oops! Page not found</Text>
        
        <TouchableOpacity onPress={handleGoHome} style={styles.button}>
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9", // bg-muted 대용
  },
  content: {
    alignItems: "center",
  },
  errorCode: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  message: {
    fontSize: 20,
    color: "#64748b", // text-muted-foreground 대용
    marginBottom: 24,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#3b82f6", // text-primary 대용
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default NotFound;