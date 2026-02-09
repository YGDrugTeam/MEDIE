import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react-native";

// 1. Root 컨테이너
export const Pagination = ({ children, style }: any) => (
  <View style={[styles.container, style]}>{children}</View>
);

// 2. Content (가로 정렬 래퍼)
export const PaginationContent = ({ children, style }: any) => (
  <View style={[styles.content, style]}>{children}</View>
);

// 3. Link (개별 숫자 버튼)
export const PaginationLink = ({ 
  isActive, 
  onPress, 
  children, 
  disabled 
}: { 
  isActive?: boolean; 
  onPress?: () => void; 
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.link,
      isActive && styles.activeLink,
      disabled && { opacity: 0.3 }
    ]}
  >
    <Text style={[styles.linkText, isActive && styles.activeLinkText]}>
      {children}
    </Text>
  </TouchableOpacity>
);

// 4. Previous / Next 버튼
export const PaginationPrevious = ({ onPress, disabled }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={disabled} 
    style={[styles.navButton, disabled && { opacity: 0.3 }]}
  >
    <ChevronLeft size={18} color={disabled ? "#cbd5e1" : "#0f172a"} />
    <Text style={styles.navText}>이전</Text>
  </TouchableOpacity>
);

export const PaginationNext = ({ onPress, disabled }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={disabled} 
    style={[styles.navButton, disabled && { opacity: 0.3 }]}
  >
    <Text style={styles.navText}>다음</Text>
    <ChevronRight size={18} color={disabled ? "#cbd5e1" : "#0f172a"} />
  </TouchableOpacity>
);

// 5. Ellipsis (...)
export const PaginationEllipsis = () => (
  <View style={styles.ellipsis}>
    <MoreHorizontal size={18} color="#94a3b8" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  link: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  activeLink: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  linkText: {
    fontSize: 14,
    color: "#0f172a",
  },
  activeLinkText: {
    fontWeight: "700",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 4,
  },
  navText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});