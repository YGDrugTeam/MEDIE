import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pill, Scan } from 'lucide-react-native'; // Native용 아이콘

interface MedicLensLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const MedicLensLogo = ({ size = "md", showText = true }: MedicLensLogoProps) => {
  // 사이즈별 수치 정의
  const sizes = {
    sm: { icon: 20, font: 18, sub: 10, padding: 6, radius: 8 },
    md: { icon: 28, font: 24, sub: 12, padding: 8, radius: 12 },
    lg: { icon: 40, font: 36, sub: 14, padding: 12, radius: 16 },
  };

  const { icon, font, sub, padding, radius } = sizes[size];

  return (
    <View style={styles.container}>
      {/* 로고 아이콘 영역 */}
      <View style={[styles.iconBox, { padding, borderRadius: radius }]}>
        <View style={styles.iconWrapper}>
          <Pill color="#ffffff" size={icon} />
          <Scan 
            color="rgba(255,255,255,0.8)" 
            size={icon * 0.6} 
            style={styles.scanIcon}
          />
        </View>
      </View>

      {/* 텍스트 영역 */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.mainText, { fontSize: font }]}>
            MedicLens
          </Text>
          <Text style={[styles.subText, { fontSize: sub }]}>
            약 식별 서비스
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    backgroundColor: '#3b82f6', // Medical Gradient 대용 기본색
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // 안드로이드 그림자
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  mainText: {
    fontWeight: 'bold',
    color: '#1d7edb', // 브랜드 컬러
    letterSpacing: -0.5,
  },
  subText: {
    color: '#64748b',
    marginTop: -2,
    fontWeight: '500',
  },
});