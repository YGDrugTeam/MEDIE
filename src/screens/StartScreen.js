import React, { useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from '../styles/commonStyles';

const MASCOT_IMAGE = 'https://i.postimg.cc/XJQN2c1M/image-4.jpg';

export default function StartScreen({ onStart }) {

  /* 🎯 Animated 값은 컴포넌트 내부에서 생성 */
  const mascotScale = useRef(new Animated.Value(0.8)).current;

  /* 🌱 시작 시 자연스러운 확대 애니메이션 */
  useEffect(() => {
    Animated.spring(mascotScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.startContainer}>
      <LinearGradient
        colors={['#F3E5F5', '#FFF9C4', '#E8EAF6']}
        style={styles.fullGradient}
      >
        <View style={styles.mainContent}>
          {/* 🐣 마스코트 */}
          <Animated.View style={{ transform: [{ scale: mascotScale }] }}>
            <Image
              source={{ uri: MASCOT_IMAGE }}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={styles.brandTitle}>MEDIC LENS</Text>
          <Text style={styles.teamText}>Team YG</Text>

          <View style={styles.divider} />

          <Text style={styles.slogan}>
            약을 약(樂)답게,{"\n"}
            당신의 건강한 일상을 비추는 렌즈
          </Text>
        </View>

        {/* 🚀 시작 버튼 */}
        <TouchableOpacity style={styles.premiumBtn} onPress={onStart}>
          <Text style={styles.premiumBtnText}>분석 시작하기</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}