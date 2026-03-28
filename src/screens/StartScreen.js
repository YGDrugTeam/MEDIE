import React, { useRef, useEffect } from 'react';
import { Text, View, Animated, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MASCOT_IMG from '../../assets/MASCOT_IMG.png';

const { height } = Dimensions.get('window');

export default function StartScreen({ onStart, user }) {
  // 애니메이션을 위한 값들
  const fadeBg = useRef(new Animated.Value(0)).current;
  const fadeText = useRef(new Animated.Value(0)).current;
  const moveText = useRef(new Animated.Value(20)).current;
  const fadeMascot = useRef(new Animated.Value(0)).current;
  const scaleMascot = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeBg, { toValue: 1, duration: 1000, useNativeDriver: true }),

      Animated.parallel([
        Animated.timing(fadeText, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(moveText, { toValue: 0, duration: 1200, useNativeDriver: true }),
        Animated.timing(fadeMascot, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.spring(scaleMascot, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();


    const timer = setTimeout(() => {
      onStart();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onStart}>
      <Animated.View style={[styles.fullContainer, { opacity: fadeBg }]}>
        <LinearGradient colors={['#F0F9F0', '#FFFDF0']} style={styles.fullGradient}>

          <Animated.View style={[
            styles.textContainer,
            { opacity: fadeText, transform: [{ translateY: moveText }] }
          ]}>
            <Text style={styles.brandTitle}>
              {user?.name
                ? `안녕하세요, ${user.name}님\n오늘도 건강한 하루에요.`
                : `안녕하세요,\n오늘도 건강한 하루에요.`}
            </Text>
          </Animated.View>

          <Animated.View style={[
            styles.mascotContainer,
            {
              opacity: fadeMascot,
              transform: [
                { scale: scaleMascot },
                { translateY: floatAnim }
              ]
            }
          ]}>
            <Image
              source={MASCOT_IMG}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View style={{ opacity: fadeText }}>
            <Text style={styles.tapGuide}>화면을 터치하여 시작하기</Text>
          </Animated.View>

        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  fullGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  textContainer: {
    marginBottom: 50,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B5E20', // 갤럭시 가독성을 위해 진한 초록색 고정
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  mascotContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    // 그림자 제거하여 깔끔하게 처리 for 갤럭시
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  tapGuide: {
    marginTop: 80,
    fontSize: 15,
    color: '#8BA38B',
    fontWeight: '500',
    letterSpacing: 2,
  }
});