import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';


const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  primaryDark: '#006E07',
  secondary: '#67A369',
  warm: '#FFFDE7',
  muted: '#8C8C8C',
  border: '#C8D8B5',
  softBg: '#F8FBF5',
  cardBg: '#FFFFFF',
};

export default function AlarmScreen({
  myPills = [],
  setAppMode,
  togglePillAlarm,
  changePillAlarmTime,
  deletePillAlarm,
}) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [doneModalVisible, setDoneModalVisible] = useState(false);

  const alarmItems = useMemo(() => {
    return (myPills || []).flatMap((pill) =>
      (pill.schedules || []).map((schedule, index) => ({
        pillId: pill.id,
        pillName: pill.name || '복용약',
        scheduleIndex: index,
        enabled: pill?.alarmEnabled ?? schedule?.enabled ?? false,
        time: schedule?.time || '08:00',
        label: schedule?.label || '매일',
      }))
    );
  }, [myPills]);

  const openTimePicker = (item) => {
    const [hour = '8', minute = '0'] = (item.time || '08:00').split(':');
    const nextDate = new Date();
    nextDate.setHours(Number(hour), Number(minute), 0, 0);

    setSelectedAlarm(item);
    setPickerDate(nextDate);
    setPickerVisible(true);
  };

  const formatTime = (date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
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

  const handleConfirmTime = (event, date) => {
    if (Platform.OS === 'android') {
      setPickerVisible(false);
    }

    if (!date || !selectedAlarm) return;

    setPickerDate(date);

    const nextTime = formatTime(date);

    changePillAlarmTime?.(
      selectedAlarm.pillId,
      nextTime
    );

    setDoneModalVisible(true);

    if (Platform.OS === 'ios') {
      setPickerVisible(false);
    }
  };

  const renderAlarmItem = (item) => {
    const timeParts = splitDisplayTime(item.time);

    return (
      <View key={`${item.pillId}-${item.scheduleIndex}`} style={styles.alarmCard}>
        <View style={styles.alarmTopRow}>
          <View style={styles.pillInfoRow}>
            <Text style={styles.pillEmoji}>💊</Text>
            <Text style={styles.pillName}>{item.pillName}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              togglePillAlarm?.(item.pillId)
            }
            style={[
              styles.toggleWrap,
              item.enabled ? styles.toggleWrapOn : styles.toggleWrapOff,
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                item.enabled ? styles.toggleKnobOn : styles.toggleKnobOff,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.alarmBottomRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.timeCapsule}
            onPress={() => openTimePicker(item)}
          >
            <Text style={styles.timeCapsuleText}>{item.label}</Text>
            <Text style={styles.timeCapsuleText}>{timeParts.meridiem}</Text>
            <Text style={styles.timeCapsuleText}>{timeParts.hour}</Text>
            <Text style={styles.timeCapsuleText}>{timeParts.minute}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.deleteBtn}
            onPress={() =>
              deletePillAlarm?.(item.pillId)
            }
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAppMode('MY_PILL')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>알람 관리</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.scanButton}
          onPress={() => setAppMode('SCAN')}
        >
          <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
          <Text style={styles.scanButtonText}>약 스캔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionEmoji}>⏰</Text>
          <Text style={styles.sectionTitle}>복약 알람</Text>
        </View>

        {alarmItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>등록된 알람이 아직 없어</Text>
            <Text style={styles.emptyDesc}>
              약을 등록하거나 복약 시간을 추가하면 여기서 관리할 수 있어.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setAppMode('SCAN')}
            >
              <Text style={styles.emptyBtnText}>약 등록하러 가기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          alarmItems.map(renderAlarmItem)
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setAppMode('HOME')}
          style={styles.bottomTabItem}
        >
          <Ionicons name="home" size={28} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAppMode('ALARM')}
          style={styles.bottomTabItem}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAppMode('SEARCH_PILL')}
          style={styles.bottomTabItem}
        >
          <Ionicons name="search" size={28} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAppMode('COMMUNITY')}
          style={styles.bottomTabItem}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={28}
            color={COLORS.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAppMode('MY_PAGE')}
          style={styles.bottomTabItem}
        >
          <Ionicons name="person" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {pickerVisible && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleConfirmTime}
        />
      )}

      <Modal
        visible={doneModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDoneModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.doneModalCard}>
            <Text style={styles.doneMascot}>🐶</Text>
            <Text style={styles.doneModalText}>알람설정 완료!</Text>
          </View>

          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCloseLayer}
            onPress={() => setDoneModalVisible(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },

  scanButton: {
    minWidth: 96,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    backgroundColor: '#FCFFF9',
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

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 160,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionEmoji: {
    fontSize: 22,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },

  alarmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCE8C8',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  alarmTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  pillInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  pillEmoji: {
    fontSize: 24,
    marginRight: 8,
  },

  pillName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },

  toggleWrap: {
    width: 54,
    height: 30,
    borderRadius: 999,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },

  toggleWrapOn: {
    backgroundColor: '#A9D18E',
  },

  toggleWrapOff: {
    backgroundColor: '#D9D9D9',
  },

  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  toggleKnobOn: {
    alignSelf: 'flex-end',
  },

  toggleKnobOff: {
    alignSelf: 'flex-start',
  },

  alarmBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timeCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 42,
    flex: 1,
    marginRight: 10,
  },

  timeCapsuleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginRight: 18,
  },

  deleteBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E48E8E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCard: {
    backgroundColor: COLORS.warm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },

  emptyDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 16,
  },

  emptyBtn: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  bottomSpacer: {
    height: 70,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    backgroundColor: COLORS.warm,
    borderTopWidth: 1,
    borderTopColor: '#DCE8C8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  bottomTabItem: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  doneModalCard: {
    minWidth: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.4,
    borderColor: COLORS.secondary,
    paddingVertical: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 2,
  },

  doneMascot: {
    fontSize: 20,
    marginRight: 10,
  },

  doneModalText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },

  modalCloseLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});