import React, { forwardRef } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

// 1. 스타일 변형(Variant) 정의
// 조원의 cva 스타일(text-sm, font-medium)을 이식했습니다.
const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a', // 기본 텍스트 색상
    lineHeight: 14,   // leading-none 반영
  },
  disabled: {
    opacity: 0.7,     // peer-disabled:opacity-70 반영
  }
});

// 2. Props 타입 정의
export interface LabelProps extends React.ComponentProps<typeof Text> {
  disabled?: boolean;
}

const Label = forwardRef<Text, LabelProps>(
  ({ style, disabled, children, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        style={[
          styles.label,
          disabled && styles.disabled,
          style as TextStyle,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

Label.displayName = "Label";

export { Label };
