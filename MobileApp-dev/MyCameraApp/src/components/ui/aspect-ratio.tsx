import React from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';

interface AspectRatioProps {
  ratio?: number; // 가로 / 세로 비율 (예: 16/9, 4/3, 1)
  children: React.ReactNode;
  style?: any;
}

export const AspectRatio = ({ ratio = 1, children, style }: AspectRatioProps) => {
  return (
    <View style={[style, { aspectRatio: ratio, width: '100%' }]}>
      {children}
    </View>
  );
};