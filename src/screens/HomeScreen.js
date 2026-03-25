import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


import MASCOT_IMG from '/Users/lifeiscabaret/Final-Project/LastMobileApp/assets/MASCOT_IMG.png';
import CAMERA_ICON from '/Users/lifeiscabaret/Final-Project/LastMobileApp/assets/camera.png';
import FIND_ICON from '/Users/lifeiscabaret/Final-Project/LastMobileApp/assets/find.png';
import PILL_ICON from '/Users/lifeiscabaret/Final-Project/LastMobileApp/assets/redpill.png';
import CHECK_PILL_ICON from '/Users/lifeiscabaret/Final-Project/LastMobileApp/assets/greenpill.png';

const { width } = Dimensions.get('window');

export default function HomeScreen({
  setAppMode,
  onPressMap,
  isLoggedIn,
  user,
  myPills = [],
  onCompleteNextDose,
}) {
  const { nextDose, isAllCompleted } = useMemo(() => {
    const schedules = myPills.flatMap((pill) =>
      (pill.schedules || []).map((schedule, index) => ({
        ...schedule,
        pillId: pill.id,
        pillName: pill.name,
        order: index,
      }))
    );

    const sortedSchedules = schedules.sort((a, b) => {
      const aTime = a.time || '99:99';
      const bTime = b.time || '99:99';
      return aTime.localeCompare(bTime);
    });

    const next = sortedSchedules.find((item) => !item.takenToday) || null;
    const takenCount = sortedSchedules.filter((item) => item.takenToday).length;

    return {
      nextDose: next,
      isAllCompleted:
        sortedSchedules.length > 0 && takenCount === sortedSchedules.length,
    };
  }, [myPills]);

  const ctaLabel = isAllCompleted
    ? '복용 완료 >'
    : `${nextDose?.label ? `${nextDose.label} ` : ''}복용 완료 >`;

  const getShortUsage = (usage) => {
    if (Array.isArray(usage)) return usage[0] || '복용 정보';
    if (typeof usage !== 'string') return '복용 정보';

    const cleaned = usage.replace(/[\[\]"]/g, '').trim();

    if (
      cleaned.includes('해열') ||
      cleaned.includes('진통') ||
      cleaned.includes('소염')
    ) {
      return '해열제';
    }
    if (
      cleaned.includes('비타민') ||
      cleaned.includes('영양') ||
      cleaned.includes('오메가')
    ) {
      return '영양제';
    }
    if (cleaned.includes('소화')) return '소화제';
    if (cleaned.includes('감기')) return '감기약';

    return cleaned.length > 6 ? `${cleaned.slice(0, 6)}...` : cleaned;
  };

  return (
    <SafeAreaView style={screenStyles.safeArea}>
      <ScrollView
        style={screenStyles.scroll}
        contentContainerStyle={screenStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 */}
        <View style={screenStyles.topRow}>
          <Image source={MASCOT_IMG} style={screenStyles.logo} resizeMode="contain" />

          <View style={screenStyles.topRight}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setAppMode('SCAN')}
              style={screenStyles.scanButton}
            >
              <Image source={CAMERA_ICON} style={screenStyles.scanIcon} />
              <Text style={screenStyles.scanButtonText}>약 스캔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 타이틀 */}
        <View style={screenStyles.titleWrap}>
          <Text style={screenStyles.title}>오늘도 건강한 하루 되세요. 🌱</Text>
          <Text style={screenStyles.subtitle}>복용 체크로 하루를 시작해보세요.</Text>
        </View>

        {/* 복용 완료 버튼 */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isAllCompleted}
          onPress={() => {
            if (!isAllCompleted) onCompleteNextDose?.();
          }}
          style={screenStyles.ctaButton}
        >
          <View style={screenStyles.ctaIconCircle}>
            <Image
              source={CHECK_PILL_ICON}
              style={screenStyles.ctaIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={screenStyles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>

        {/* 내 복용 내역 */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setAppMode('HISTORY')}
          style={screenStyles.historyButton}
        >
          <Image source={FIND_ICON} style={screenStyles.historyIcon} />
          <Text style={screenStyles.historyButtonText}>내 복용 내역</Text>
        </TouchableOpacity>

        {/* 내 복용약 카드 */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setAppMode('MY_PILL')}
          style={screenStyles.pillCard}
        >
          <View style={screenStyles.pillCardBody}>
            <View style={screenStyles.cardTitleRow}>
              <Text style={screenStyles.pillCardTitle}>내 복용약</Text>
              <Image source={PILL_ICON} style={screenStyles.smallPillIcon} />
            </View>

            {myPills.length === 0 ? (
              <Text style={screenStyles.emptyText}>등록된 복용약이 없어요.</Text>
            ) : (
              myPills.slice(0, 2).map((pill) => (
                <View key={pill.id} style={screenStyles.pillRow}>
                  <View style={screenStyles.pillLeft}>
                    <Image source={PILL_ICON} style={screenStyles.rowPillIcon} />
                    <Text style={screenStyles.pillName} numberOfLines={1}>
                      {pill.name}
                    </Text>
                  </View>

                  <Text style={screenStyles.pillUsage} numberOfLines={1}>
                    {getShortUsage(pill.usage)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={screenStyles.pillCardFooter}>
            <Text style={screenStyles.pillCardFooterText}>전체보기 →</Text>
          </View>
        </TouchableOpacity>

        {/* 매디멍 자리 확보용 여백 */}
        <View style={screenStyles.chatSpace} />

        {/* 하단 탭바 */}
        <View style={screenStyles.tabBar}>
          <TouchableOpacity style={screenStyles.tabItem} onPress={() => setAppMode('HOME')}>
            <Ionicons name="home" size={30} color="#065809" />
            <Text style={screenStyles.tabLabel}>홈</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={screenStyles.tabItem}
            onPress={() => {
              onPressMap?.();
            }}
          >
            <Ionicons name="location" size={30} color="#065809" />
            <Text style={screenStyles.tabLabel}>주변약국</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={screenStyles.tabItem}
            onPress={() => setAppMode('SEARCH_PILL')}
          >
            <Ionicons name="search" size={30} color="#065809" />
            <Text style={screenStyles.tabLabel}>약 검색</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={screenStyles.tabItem}
            onPress={() => setAppMode('COMMUNITY')}
          >
            <Ionicons name="chatbubble-ellipses" size={30} color="#065809" />
            <Text style={screenStyles.tabLabel}>커뮤니티</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={screenStyles.tabItem}
            onPress={() => setAppMode('MY_PAGE')}
          >
            <Ionicons name="person" size={30} color="#065809" />
            <Text style={screenStyles.tabLabel}>마이페이지</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFFF9',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#FCFFF9',
  },

  content: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 190,
    minHeight: '100%',
    backgroundColor: '#FCFFF9',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
  },

  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 70,
    height: 70,
  },

  scanButton: {
    width: 116,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FCFFF9',
    borderWidth: 1.2,
    borderColor: 'rgba(0,110,7,0.65)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  scanIcon: {
    width: 40,
    height: 40,
    marginRight: 6,
    resizeMode: 'contain',
  },

  scanButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065809',
  },

  titleWrap: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 12,
  },

  title: {
    width: '100%',
    maxWidth: 340,
    fontSize: 28,
    fontWeight: '600',
    color: '#065809',
    textAlign: 'center',
    lineHeight: 34,
  },

  subtitle: {
    width: '100%',
    maxWidth: 340,
    marginTop: 12,
    fontSize: 16,
    fontWeight: '400',
    color: '#67A369',
    textAlign: 'center',
    lineHeight: 24,
  },

  ctaButton: {
    width: Math.min(width - 48, 310),
    height: 82,
    marginTop: 28,
    alignSelf: 'center',
    borderRadius: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#67A369',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  ctaIcon: {
    width: 60,
    height: 97,
  },

  ctaText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  historyButton: {
    width: 170,
    height: 42,
    alignSelf: 'center',
    marginTop: 22,
    borderRadius: 21,
    backgroundColor: '#F9FFFA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  historyIcon: {
    width: 30,
    height: 30,
    marginRight: 6,
    resizeMode: 'contain',
  },

  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065809',
    letterSpacing: 0.2,
  },

  pillCard: {
    width: Math.min(width - 32, 341),
    alignSelf: 'center',
    marginTop: 26,
    borderRadius: 22,
    backgroundColor: '#F9FAF9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  pillCardBody: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 18,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  pillCardTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#065809',
    marginRight: 8,
  },

  smallPillIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  emptyText: {
    fontSize: 15,
    color: '#8C8C8C',
  },

  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  pillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  rowPillIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },

  pillName: {
    flex: 1,
    fontSize: 21,
    fontWeight: '500',
    color: '#065809',
  },

  pillUsage: {
    maxWidth: 110,
    fontSize: 21,
    fontWeight: '500',
    color: '#065809',
    textAlign: 'right',
  },

  pillCardFooter: {
    width: '100%',
    height: 52,
    backgroundColor: '#E8F5E9',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  pillCardFooterText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8C8C8C',
  },

  chatSpace: {
    height: 92,
  },

  tabBar: {
    width: Math.min(width - 20, 370),
    height: 92,
    alignSelf: 'center',
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },

  tabIconImg: {
    width: 40,
    height: 40,
    marginBottom: 6,
    resizeMode: 'contain',
  },

  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065809',
  },
});