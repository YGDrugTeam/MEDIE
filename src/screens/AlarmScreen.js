// src/screens/AlarmScreen.js
import React, { useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../styles/commonStyles';
import BackToMenuBtn from '../components/BackToMenuBtn';

export default function AlarmScreen({
  myPills = [],
  setAppMode,
  togglePillAlarm,
  changePillAlarmTime,
  deletePillAlarm,
}) {
  // 화면 옵션(네가 원한 토글)
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedPillId, setSelectedPillId] = useState(null);

  const list = Array.isArray(myPills) ? myPills : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>⏰ 복약 알람</Text>

        {/* 옵션 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => setSoundOn((v) => !v)}>
            <Text>🔊 소리 {soundOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setVibrationOn((v) => !v)}>
            <Text>📳 진동 {vibrationOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ marginTop: 20 }}>
          {list.map((pill) => {
            const time = pill?.schedules?.[0]?.time ?? '08:00';

            return (
              <View key={pill.id} style={styles.dataCard}>
                <View>
                  <Text style={styles.cardTitle}>{pill.name}</Text>

                  {/* 시간 */}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPillId(pill.id);
                      setShowTimePicker(true);
                    }}
                  >
                    <Text style={styles.cardSub}>⏰ {time}</Text>
                  </TouchableOpacity>

                  {/* ON/OFF */}
                  <TouchableOpacity
                    onPress={() => togglePillAlarm?.(pill.id, { soundOn, vibrationOn })}
                    style={{ marginTop: 8 }}
                  >
                    <Text style={{ color: '#5E35B1', fontWeight: 'bold' }}>
                      {pill.alarmEnabled ? '🔕 알람 끄기' : '🔔 알람 켜기'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 삭제(=알람만 삭제) */}
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('알람 삭제', '이 알람을 삭제(비활성화)할까요?', [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '삭제',
                        style: 'destructive',
                        onPress: () => deletePillAlarm?.(pill.id),
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

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            is24Hour
            onChange={async (event, selectedDate) => {
              setShowTimePicker(false);
              if (event.type === 'dismissed') return;
              if (!selectedDate || !selectedPillId) return;

              const hh = selectedDate.getHours().toString().padStart(2, '0');
              const mm = selectedDate.getMinutes().toString().padStart(2, '0');
              const timeStr = `${hh}:${mm}`;

              await changePillAlarmTime?.(selectedPillId, timeStr, { soundOn, vibrationOn });
            }}
          />
        )}

        <BackToMenuBtn onPress={() => setAppMode('HOME')} />
      </View>
    </SafeAreaView>
  );
}