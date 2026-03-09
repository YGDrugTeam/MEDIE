// src/screens/MyPillScreen.js
import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from '../styles/commonStyles';
import BackToMenuBtn from '../components/BackToMenuBtn';

export default function MyPillScreen({
  myPills = [],
  onToggleAlarm,
  onDeletePill,
  setAppMode,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F3E5F5', '#E8EAF6']} style={styles.subContainer}>
        <Text style={styles.mapHeader}>💊 내 복용중 알약</Text>

        {myPills.length === 0 ? (
          <View style={{ marginTop: 80, alignItems: 'center', opacity: 0.6 }}>
            <Text style={{ fontSize: 15 }}>등록된 알약이 없습니다</Text>
            <Text style={{ fontSize: 13, marginTop: 6 }}>
              약을 스캔 후 복용 알약으로 등록해보세요 🙂
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.listScroll}>
            {myPills.map((pill) => {
              const time = pill?.schedules?.[0]?.time ?? '08:00';

              return (
                <View key={pill.id} style={styles.dataCard}>
                  {/* 왼쪽 정보 */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{pill.name}</Text>
                    <Text style={styles.cardSub}>신뢰도 {pill.confidence}%</Text>

                    <Text style={{ marginTop: 10, fontSize: 13, fontWeight: 'bold' }}>
                      📌 복용 목적
                    </Text>
                    <Text style={{ fontSize: 14, marginTop: 4 }}>{pill.usage}</Text>

                    <Text style={{ marginTop: 10, fontSize: 13, fontWeight: 'bold', color: '#D32F2F' }}>
                      ⚠️ 주의사항
                    </Text>
                    <Text style={{ fontSize: 14, marginTop: 4, color: '#D32F2F' }}>
                      {pill.warning}
                    </Text>

                    {/* 🔔 알람 */}
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold' }}>⏰ 복약 알람</Text>
                      <Text style={{ marginTop: 4, fontSize: 14 }}>매일 {time}</Text>

                      <TouchableOpacity
                        style={{ marginTop: 6 }}
                        onPress={() => onToggleAlarm?.(pill.id)}
                      >
                        <Text style={{ fontSize: 14, color: '#5E35B1' }}>
                          {pill.alarmEnabled ? '🔕 알람 끄기' : '🔔 알람 켜기'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 🗑️ 삭제 */}
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('삭제', '이 알약을 목록에서 제거할까요?', [
                        { text: '취소', style: 'cancel' },
                        {
                          text: '삭제',
                          style: 'destructive',
                          onPress: () => onDeletePill?.(pill.id),
                        },
                      ]);
                    }}
                  >
                    <Text style={{ fontSize: 18, marginLeft: 10 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}

        <BackToMenuBtn onPress={() => setAppMode('HOME')} />
      </LinearGradient>
    </SafeAreaView>
  );
}