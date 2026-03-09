// src/components/BackToMenuBtn.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/commonStyles';

export default function BackToMenuBtn({ onPress }) {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.betaText}>본 기능은 현재 Beta 서비스 중입니다.</Text>

      <TouchableOpacity
        style={styles.backBtnBottom}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#FF7F50', '#FF4500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.backGradient}
        >
          <Text style={styles.backBtnTextBold}>메뉴로 돌아가기</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}