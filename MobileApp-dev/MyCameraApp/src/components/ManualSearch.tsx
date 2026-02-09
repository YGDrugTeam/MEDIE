import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Search } from "lucide-react-native";
// 앞서 우리가 Expo용으로 고친 컴포넌트들
import { Input } from "./ui/input"; 
import { Button as UIButton } from "./ui/button"; // 이름을 UIButton으로 임시 변경

// 1. Button에 Text 속성이 있음을 TypeScript에게 알려줍니다.
const Button = UIButton as typeof UIButton & {
  Text: React.ComponentType<any>;
};

interface ManualSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const ManualSearch = ({ onSearch, isLoading = false }: ManualSearchProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <View style={styles.container}>
      {/* 검색 입력창 영역 */}
      <View style={styles.inputWrapper}>
        <View style={styles.iconContainer}>
          <Search size={20} color="#64748b" />
        </View>
        <Input
          placeholder="약 이름 또는 각인 문자 입력..."
          value={query}
          onChangeText={setQuery} // onChange 대신 onChangeText 사용
          editable={!isLoading}
          returnKeyType="search" // 키보드 엔터키를 '검색'으로 변경
          onSubmitEditing={handleSearch} // 키보드에서 검색 버튼 눌렀을 때
          style={styles.inputCustom}
        />
      </View>

      {/* 검색 버튼 */}
      <Button
        onPress={handleSearch}
        disabled={!query.trim() || isLoading}
        style={[
          styles.searchButton,
          (!query.trim() || isLoading) && styles.disabledButton
        ]}
      >
        <View style={styles.buttonContent}>
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" style={styles.loader} />
              <Button.Text style={styles.buttonText}>검색 중...</Button.Text>
            </>
          ) : (
            <>
              <Search size={20} color="#ffffff" style={styles.loader} />
              <Button.Text style={styles.buttonText}>검색하기</Button.Text>
            </>
          )}
        </View>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: "100%",
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  inputCustom: {
    paddingLeft: 48, // 아이콘 공간 확보
    height: 56,
    fontSize: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchButton: {
    height: 52,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginRight: 4,
  },
});