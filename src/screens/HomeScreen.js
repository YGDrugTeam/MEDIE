import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import MASCOT_IMG from '../../assets/MASCOT_IMG.png';
import CAMERA_ICON from '../../assets/camera.png';
import FIND_ICON from '../../assets/find.png';
import PILL_ICON from '../../assets/redpill.png';
import CHECK_PILL_ICON from '../../assets/greenpill.png';

const { width } = Dimensions.get('window');

export default function HomeScreen({
  setAppMode,
  onPressMap,
  isLoggedIn,
  user,
  myPills = [],
  refreshData,
}) {
  const [loading, setLoading] = useState(false);
  const userName = user?.nickname || user?.name || '사용자';

  const { hasPills, nextDose, isAllCompleted } = useMemo(() => {
    const pillExists = Array.isArray(myPills) && myPills.length > 0;

    if (!pillExists) {
      return { hasPills: false, nextDose: null, isAllCompleted: false };
    }

    const allSchedules = myPills.flatMap((pill) => {
      const schedules = pill.schedules || [];
      return schedules.map((sch) => ({
        ...sch,
        pillName: pill.name,
        pillId: pill.id,
        isTaken: sch.takenToday === true || sch.completed === true || sch.is_taken === true
      }));
    });

    if (allSchedules.length === 0) {
      return { hasPills: false, nextDose: null, isAllCompleted: false };
    }

    const sorted = allSchedules.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
    const next = sorted.find(sch => !sch.isTaken) || null;
    const allDone = sorted.every(sch => sch.isTaken);

    return { hasPills: true, nextDose: next, isAllCompleted: allDone };
  }, [myPills]);

  const handleMainAction = async () => {
    if (!hasPills) {
      setAppMode('SCAN');
      return;
    }

    if (isAllCompleted) {
      Alert.alert('복용 완료', '오늘 복용할 약을 모두 드셨습니다.');
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('accessToken');

      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch('http://20.106.40.121/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user?.id,
          pill_name: nextDose?.pillName || '복약',
          scheduled_time: nextDose?.time || '08:00',
          taken_at: new Date().toISOString(),
        })
      });

      if (response.ok) {
        Alert.alert('성공', `${nextDose?.pillName} 복용을 확인했습니다.`);
        if (refreshData) refreshData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '서버 응답 오류');
      }
    } catch (e) {
      Alert.alert('오류', e.message === 'Failed to fetch' ? '서버 연결 실패 (IP 확인 필요)' : e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderButtonContent = () => {
    if (!hasPills) return "복용약 설정하러 가기";
    if (isAllCompleted) return "복용 완료";
    const label = nextDose?.label || nextDose?.timeLabel || nextDose?.time || '다음';
    return `${label} 복용 완료 >`;
  };

  return (
    <SafeAreaView style={screenStyles.safeArea}>
      <View style={screenStyles.fixedContent}>
        <View style={screenStyles.topRow}>
          <Image source={MASCOT_IMG} style={screenStyles.logo} resizeMode="contain" />
          <TouchableOpacity onPress={() => setAppMode('SCAN')} style={screenStyles.scanButton}>
            <Image source={CAMERA_ICON} style={screenStyles.scanIcon} />
            <Text style={screenStyles.scanButtonText}>약 스캔</Text>
          </TouchableOpacity>
        </View>

        <View style={screenStyles.titleWrap}>
          <Text style={screenStyles.title}>{userName}님, 오늘도{"\n"}건강한 하루 되세요. 🌱</Text>
          <Text style={screenStyles.subtitle}>복용 체크로 하루를 시작해보세요.</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleMainAction}
          disabled={loading}
          style={[screenStyles.ctaButton, isAllCompleted && screenStyles.ctaButtonDone]}
        >
          <View style={screenStyles.ctaInner}>
            <Image source={CHECK_PILL_ICON} style={screenStyles.ctaIcon} resizeMode="contain" />
            <Text style={screenStyles.ctaText}>{renderButtonContent()}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAppMode('HISTORY')} style={screenStyles.historyButton}>
          <Image source={FIND_ICON} style={screenStyles.historyIcon} />
          <Text style={screenStyles.historyButtonText}>내 복용 내역 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAppMode('MY_PILL')} style={screenStyles.pillCard}>
          <View style={screenStyles.pillCardBody}>
            <View style={screenStyles.cardTitleRow}>
              <Image source={PILL_ICON} style={screenStyles.hugePillIcon} />
              <Text style={screenStyles.pillCardTitle}>내 복용약</Text>
            </View>

            {!hasPills ? (
              <Text style={screenStyles.emptyText}>등록된 복용약이 없어요.</Text>
            ) : (
              myPills.slice(0, 2).map((pill) => (
                <View key={pill.id || Math.random().toString()} style={screenStyles.pillRow}>
                  <Text style={screenStyles.pillName} numberOfLines={1}>• {pill.name}</Text>
                  <Text style={screenStyles.pillUsage}>
                    {pill.usage?.replace(/[\[\]"]/g, '').slice(0, 10)}
                  </Text>
                </View>
              ))
            )}
          </View>
          <View style={screenStyles.pillCardFooter}>
            <Text style={screenStyles.pillCardFooterText}>상세정보 전체보기 →</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCFFF9' },
  fixedContent: { flex: 1, paddingHorizontal: 22, paddingTop: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  logo: { width: 65, height: 65 },
  scanButton: { width: 105, height: 44, borderRadius: 12, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee', elevation: 2 },
  scanIcon: { width: 28, height: 28, marginRight: 4 },
  scanButtonText: { fontSize: 14, fontWeight: '700', color: '#065809' },
  titleWrap: { alignItems: 'flex-start', marginVertical: 15 },
  title: { fontSize: 28, fontWeight: '800', color: '#065809', lineHeight: 36 },
  subtitle: { fontSize: 16, color: '#67A369', marginTop: 8 },
  ctaButton: { width: '100%', height: 90, backgroundColor: '#67A369', borderRadius: 20, marginTop: 20, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  ctaButtonDone: { backgroundColor: '#67A369' },
  ctaInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  ctaIcon: { width: 50, height: 68, marginRight: 10 },
  ctaText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  historyButton: { width: '100%', height: 54, backgroundColor: '#fff', borderRadius: 15, marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1.2, borderColor: '#E8F5E9' },
  historyIcon: { width: 28, height: 28, marginRight: 8 },
  historyButtonText: { fontSize: 17, fontWeight: '700', color: '#065809' },
  pillCard: { width: '100%', marginTop: 25, borderRadius: 22, backgroundColor: '#F9FAF9', overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  pillCardBody: { padding: 22 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  hugePillIcon: { width: 45, height: 45, marginRight: 15, resizeMode: 'contain' },
  pillCardTitle: { fontSize: 24, fontWeight: '900', color: '#065809' },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  pillName: { fontSize: 20, fontWeight: '700', color: '#065809', flex: 1 },
  pillUsage: { fontSize: 18, color: '#67A369', fontWeight: '600' },
  emptyText: { fontSize: 15, color: '#8C8C8C', textAlign: 'center', paddingVertical: 10 },
  pillCardFooter: { height: 52, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  pillCardFooterText: { fontSize: 14, color: '#8C8C8C', fontWeight: '600' },
});