import * as React from "react";
import { TextInput, StyleSheet, View, TextInputProps } from "react-native";
import { cn } from "../../lib/utils"; // 경로 확인!

// 1. Props 타입 정의 (className 지원 및 TextInput 속성 확장)
export interface TextareaProps extends TextInputProps {
  className?: string;
}

const Textarea = React.forwardRef<
  React.ComponentRef<typeof TextInput>, 
  TextareaProps
>(({ style, className, ...props }, ref) => {
  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        // 여러 줄 입력을 위한 핵심 설정
        multiline={true}
        // iOS에서 텍스트가 상단에 위치하도록 설정
        textAlignVertical="top"
        placeholderTextColor="#64748b" // text-muted-foreground 색상
        style={[
          styles.textarea,
          style
        ]}
        {...props}
      />
    </View>
  );
});

Textarea.displayName = "Textarea";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  textarea: {
    minHeight: 80,             // min-h-[80px]
    width: "100%",
    borderRadius: 6,           // rounded-md
    borderWidth: 1,
    borderColor: "#e2e8f0",    // border-input
    backgroundColor: "#ffffff", // bg-background
    paddingHorizontal: 12,     // px-3
    paddingVertical: 8,        // py-2
    fontSize: 14,              // text-sm
    color: "#0f172a",          // text-foreground
  },
});

export { Textarea };