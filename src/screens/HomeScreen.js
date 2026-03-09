import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/commonStyles';

export default function HomeScreen({ setAppMode, onPressMap }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F3E5F5', '#E8EAF6']} style={styles.menuContainer}>
        {/* 💊 내 복용중 알약 버튼 */}
        <TouchableOpacity
          style={styles.myPillButton}
          activeOpacity={0.85}
          onPress={() => setAppMode('MY_PILL')}
        >
          <Text style={styles.myPillText}>내 복용중 알약</Text>
        </TouchableOpacity>

        <View style={styles.menuHeaderWrapper}>
          <Text style={styles.menuHeader}>무엇을 도와드릴까요?</Text>
          <View style={styles.headerUnderline} />
        </View>

        <View style={styles.menuGrid}>
          {[
            { id: 'SCAN', label: '카메라 스캔', icon: '📸' },
            { id: 'MAP', label: '당번 약국', icon: '📍' },
            { id: 'ALARM', label: '복약 알람', icon: '⏰' },
            { id: 'SEARCH_PILL', label: '알약 검색', icon: '🔍' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                setAppMode(item.id);

                // ✅ MAP일 때만 App.js에서 내려준 함수 호출
                if (item.id === 'MAP') {
                  onPressMap?.(); // 없으면 그냥 무시(안전)
                }
              }}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}