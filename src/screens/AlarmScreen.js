import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// 📍 MapScreen과 동일한 COLORS 설정
const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  secondary: '#67A369',
  warm: '#FFFDE7',
  muted: '#8C8C8C',
  border: '#DCE8C8',
  soft: '#FCFFF9', // 추가
};

export default function AlarmScreen({
  myPills = [],
  setAppMode,
  togglePillAlarm,
  changePillAlarmTime,
  deletePill,
}) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [doneModalVisible, setDoneModalVisible] = useState(false);

  useEffect(() => {
    if (doneModalVisible) {
      const timer = setTimeout(() => setDoneModalVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [doneModalVisible]);

  const alarmItems = useMemo(() => {
    return (myPills || []).flatMap((pill) =>
      (pill.schedules || []).map((schedule, index) => ({
        pillId: pill.id,
        pillName: pill.name || '복용약',
        scheduleIndex: index,
        enabled: pill?.alarmEnabled ?? schedule?.enabled ?? false,
        time: schedule?.time || '08:00',
        label: '',
      }))
    );
  }, [myPills]);

  const handleDeletePress = (item) => {
    Alert.alert(
      "알람 삭제",
      `'${item.pillName}' 정보를 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => deletePill?.(item.pillId)
        }
      ]
    );
  };

  const splitDisplayTime = (time) => {
    const [hour = '08', minute = '00'] = (time || '08:00').split(':');
    const hourNum = Number(hour);
    const isAm = hourNum < 12;
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return {
      meridiem: isAm ? 'AM' : 'PM',
      hour: String(displayHour).padStart(2, '0'),
      minute: String(minute).padStart(2, '0'),
    };
  };

  const openTimePicker = (item) => {
    const [hour = '8', minute = '0'] = (item.time || '08:00').split(':');
    const nextDate = new Date();
    nextDate.setHours(Number(hour), Number(minute), 0, 0);
    setSelectedAlarm(item);
    setPickerDate(nextDate);
    setPickerVisible(true);
  };

  const handleIosConfirm = () => {
    setPickerVisible(false);
    const nextTime = `${String(pickerDate.getHours()).padStart(2, '0')}:${String(pickerDate.getMinutes()).padStart(2, '0')}`;
    changePillAlarmTime?.(selectedAlarm.pillId, nextTime);
  };

  const handleConfirmTime = (event, date) => {
    if (event.type === 'dismissed') {
      setPickerVisible(false);
      return;
    }
    if (date) {
      setPickerDate(date);
      if (Platform.OS === 'android' && event.type === 'set') {
        setPickerVisible(false);
        const nextTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        changePillAlarmTime?.(selectedAlarm.pillId, nextTime);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 📍 MapScreen과 동일한 헤더 디자인 적용 */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAppMode?.('MY_PILL')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>알람 관리</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.scanButton}
          onPress={() => setAppMode?.('SCAN')}
        >
          <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
          <Text style={styles.scanButtonText}>약 스캔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>⏰ 복약 알람</Text>
        </View>

        {alarmItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>등록된 약 정보가 없어요. 멍멍!</Text>
          </View>
        ) : (
          alarmItems.map((item, idx) => {
            const timeParts = splitDisplayTime(item.time);
            return (
              <View key={`${item.pillId}-${idx}`} style={styles.alarmCard}>
                <View style={styles.alarmTopRow}>
                  <View style={styles.pillInfoRow}>
                    <Text style={styles.pillEmoji}>💊</Text>
                    <Text style={styles.pillName}>{item.pillName}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const nextStatus = !item.enabled;
                      togglePillAlarm?.(item.pillId);
                      if (nextStatus) setDoneModalVisible(true);
                    }}
                    style={[styles.toggleWrap, item.enabled ? styles.toggleWrapOn : styles.toggleWrapOff]}
                  >
                    <View style={[styles.toggleKnob, item.enabled ? styles.toggleKnobOn : styles.toggleKnobOff]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.alarmBottomRow}>
                  <TouchableOpacity style={styles.timeCapsule} onPress={() => openTimePicker(item)}>
                    <Text style={styles.timeText}>
                      {timeParts.meridiem}  {timeParts.hour} : {timeParts.minute}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeletePress(item)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 시간 선택 모달 */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setPickerVisible(false)}><Text style={{ color: 'red', fontSize: 16 }}>취소</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleIosConfirm}><Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 16 }}>확인</Text></TouchableOpacity>
            </View>
            <DateTimePicker
              value={pickerDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleConfirmTime}
              locale="ko-KR"
            />
          </View>
        </View>
      </Modal>

      <Modal visible={doneModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.doneCard}>
            <Text style={styles.doneText}>🐶 알람설정 완료!</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  // 📍 헤더 스타일 MapScreen과 동일하게 수정
  header: {
    height: 64, // 마이페이지와 동일한 높이
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 44, // 터치 영역 확보
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10, // 마이페이지와 동일한 여백 조정
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065809",
    // 중앙 정렬을 위해 필요시 position: 'absolute' 사용 가능
  },
  scanButton: {
    minWidth: 96,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.soft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scroll: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  sectionTitleRow: { marginBottom: 20 },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  alarmCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#eee', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  alarmTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pillInfoRow: { flexDirection: 'row', alignItems: 'center' },
  pillEmoji: { fontSize: 22, marginRight: 10 },
  pillName: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  toggleWrap: { width: 54, height: 30, borderRadius: 15, padding: 3 },
  toggleWrapOn: { backgroundColor: '#A9D18E' },
  toggleWrapOff: { backgroundColor: '#ddd' },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  toggleKnobOff: { alignSelf: 'flex-start' },
  alarmBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeCapsule: { flex: 1, backgroundColor: '#fdfdfd', padding: 14, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  timeText: { fontSize: 17, color: '#333', textAlign: 'center', fontWeight: '700', letterSpacing: 0.5 },
  deleteBtn: { backgroundColor: '#E48E8E', padding: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', width: 50 },
  emptyWrap: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerContainer: { backgroundColor: '#fff', width: '90%', borderRadius: 24, paddingBottom: 20 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 22, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  doneCard: { backgroundColor: '#fff', padding: 24, borderRadius: 24, borderWidth: 2, borderColor: COLORS.secondary },
  doneText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary }
});