import React, { useMemo, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  secondary: '#67A369',
  warm: '#FFFDE7',
  muted: '#8C8C8C',
  border: '#DCE8C8',
  text: '#111111',
  danger: '#D32F2F',
};


export default function MyPillScreen({
  myPills = [],
  onToggleAlarm,
  onDeletePill,
  setAppMode,
  selectedPill,
  setSelectedPill,
}) {

  const displayPills = useMemo(() => {
    const mockPills = [
      {
        id: 'pill-001',
        name: '더블자임정',
        confidence: '94.2',
        usage: '소화효소 보충제로, 소화불량 및 식후 복부 팽만감 완화에 도움을 줄 수 있습니다.',
        warning: '과민반응이 있는 경우 복용을 중단하고 전문가 상담이 필요합니다. 소아 복용 시 주의가 필요합니다.',
        scheduleLabel: '매일',
        scheduleTime: '08:00',
        doseInfo: '소화효소제 · 식후 복용',
        alarmEnabled: true,
        schedules: [{ time: '08:00', enabled: true }],
      },
      {
        id: 'pill-002',
        name: '베스티딘정20밀리그램(파모티딘)',
        confidence: '91.7',
        usage: '위산 분비를 억제하여 위궤양, 십이지장궤양, 역류성 식도염 치료 및 증상 완화에 도움을 줄 수 있습니다.',
        warning: '신장 기능 저하 환자는 용량 조절이 필요합니다. 임산부 및 수유부는 복용 전 반드시 전문가 상담이 필요합니다.',
        scheduleLabel: '매일',
        scheduleTime: '20:00',
        doseInfo: '위산억제제 · 20mg',
        alarmEnabled: true,
        schedules: [{ time: '20:00', enabled: true }],
      },
    ];

    if (myPills && myPills.length > 0) {
      return myPills.map((pill, index) => ({
        ...pill,
        id: pill?.id ?? `pill-${index}`,
        confidence: pill?.confidence ?? '89.8',
        usage: pill?.usage || pill?.effect || '해열 및 통증 완화에 도움을 줄 수 있는 약입니다.',
        warning: pill?.warning || pill?.caution || '임산부, 수유부, 특정 질환자라면 복용 전 전문가 상담이 필요합니다.',
        scheduleLabel: pill?.scheduleLabel || '매일',
        scheduleTime: pill?.schedules?.[0]?.time ?? '08:00',
        doseInfo: pill?.doseInfo || pill?.dosage || pill?.strength || '해열제 · 500mg',
      }));
    }

    return mockPills;
  }, [myPills]);

  const handleDelete = (pillId) => {
    Alert.alert('삭제', '이 알약을 목록에서 제거할까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          if (selectedPill?.id === pillId) {
            setSelectedPill(null);
          }
          onDeletePill?.(pillId);
        },
      },
    ]);
  };

  const renderHeader = (isDetail = false) => (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (isDetail) {
            setSelectedPill(null);
          } else {
            setAppMode?.('HOME');
          }
        }}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>내 복용약</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.scanButton}
        onPress={() => setAppMode?.('SCAN')}
      >
        <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
        <Text style={styles.scanButtonText}>약 스캔</Text>
      </TouchableOpacity>
    </View>
  );



  if (selectedPill) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader(true)}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailTop}>
            <Text style={styles.detailPillEmoji}>💊</Text>
            <Text style={styles.detailPillName}>
              {selectedPill.name || '타이레놀'}
            </Text>
          </View>

          <View style={styles.resultDetailCard}>
            <Text style={styles.resultTitle}>AI 분석결과</Text>

            <Text style={styles.resultConfidence}>
              신뢰도 {selectedPill.confidence}%
            </Text>

            <Text style={styles.resultSection}>복용 목적</Text>
            <Text style={styles.resultText}>{selectedPill.usage}</Text>

            <Text style={styles.resultWarning}>주의사항</Text>
            <Text style={styles.resultText}>{selectedPill.warning}</Text>

            <Text style={styles.resultSection}>복약시간</Text>
            <Text style={styles.resultText}>
              {selectedPill.scheduleLabel} AM {selectedPill.scheduleTime}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setAppMode?.('ALARM')}
            >
            </TouchableOpacity>
          </View>

          <View style={styles.detailActionRow}>
            <TouchableOpacity
              style={styles.alarmActionBtn}
              activeOpacity={0.85}
              onPress={() => onToggleAlarm?.(selectedPill.id)}
            >
              <Text style={styles.alarmActionBtnText}>
                {selectedPill.alarmEnabled ? '알람 끄기' : '알람 켜기'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteActionBtn}
              activeOpacity={0.85}
              onPress={() => handleDelete(selectedPill.id)}
            >
              <Text style={styles.deleteActionBtnText}>삭제하기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader(false)}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.listTitle}>내 복용약</Text>
        <Text style={styles.listSubTitle}>
          내가 현재 먹고 있는 약에 대한 정보를 알려드려요.
        </Text>

        {displayPills.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>등록된 알약이 아직 없습니다.</Text>
            <Text style={styles.emptyDesc}>
              약을 스캔하고 복용약으로 등록하면 여기서 확인할 수 있습니다.
            </Text>

            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setAppMode?.('SCAN')}
            >
              <Text style={styles.emptyBtnText}>약 스캔하러 가기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayPills.map((pill) => (
            <TouchableOpacity
              key={pill.id}
              activeOpacity={0.9}
              style={styles.pillCard}
              onPress={() => setSelectedPill(pill)}
            >
              <View style={styles.pillCardLeft}>
                <Text style={styles.pillCardEmoji}>💊</Text>

                <View style={styles.pillCardTextWrap}>
                  <Text style={styles.pillCardTitle}>{pill.name}</Text>
                  <Text style={styles.pillCardSub}>{pill.doseInfo}</Text>
                </View>
              </View>

              <View style={styles.pillCardRight}>
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => handleDelete(pill.id)}
                >
                  <Text style={styles.moreDots}>···</Text>
                </TouchableOpacity>

                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="#C7C7C7"
                />
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },

  listTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 8,
  },

  listSubTitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 26,
  },

  pillCard: {
    minHeight: 92,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  pillCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },

  pillCardEmoji: {
    fontSize: 30,
    marginRight: 12,
  },

  pillCardTextWrap: {
    flex: 1,
  },

  pillCardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },

  pillCardSub: {
    fontSize: 15,
    color: '#8B8B8B',
  },

  pillCardRight: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },

  moreDots: {
    fontSize: 24,
    color: '#D2D2D2',
    lineHeight: 24,
    marginBottom: 6,
  },

  detailContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },

  detailTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 22,
  },

  detailPillEmoji: {
    fontSize: 30,
    marginRight: 8,
  },

  detailPillName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },

  resultDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },

  resultConfidence: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },

  resultSection: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },

  resultWarning: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.danger,
    marginTop: 6,
    marginBottom: 8,
  },

  resultText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#1E6A1E',
    marginBottom: 18,
  },

  resultAlarm: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
    marginTop: 4,
  },

  detailActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },

  alarmActionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  alarmActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  deleteActionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F4DCDC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteActionBtnText: {
    color: '#A13A3A',
    fontSize: 15,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: COLORS.warm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C8D8B5',
    padding: 22,
    alignItems: 'center',
    marginTop: 20,
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

});