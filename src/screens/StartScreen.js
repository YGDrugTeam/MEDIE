import React, { useRef, useEffect } from 'react';
import { Text, View, Animated, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MASCOT_IMG from '../../assets/MASCOT_IMG.png';
import { styles } from '../styles/commonStyles';

export default function StartScreen({ onStart  , user }) {
  const mascotScale = useRef(new Animated.Value(0.8)).current;

  /* 🌱 마스코트 애니메이션 */
  useEffect(() => {
    Animated.spring(mascotScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  /* ⏱️ 3초 후 자동 이동 */
  useEffect(() => {
    const timer = setTimeout(() => {
      onStart();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      activeOpacity={1}
      onPress={onStart} // 👈 터치하면 즉시 이동
    >
      <View style={styles.startContainer}>
        <LinearGradient
          colors={['#E8F5E9', '#FFFDE7']}
          style={styles.fullGradient}
        >
          <View style={styles.mainContent}>
            
            <View style={styles.centerContent}>
              
              <Text style={styles.brandTitle}>
                {user?.name
                  ? `안녕하세요, ${user.name}님\n오늘도 건강한 하루에요.`
                  : `안녕하세요,\n오늘도 건강한 하루에요.`}
              </Text>

              <Animated.View
                style={[
                  styles.mascotWrapper,
                  { transform: [{ scale: mascotScale }] }
                ]}
              >
                <Image
                  source={MASCOT_IMG}
                  style={styles.mascotImage}
                  resizeMode="contain"
                />
              </Animated.View>

            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}