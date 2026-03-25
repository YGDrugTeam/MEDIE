import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../styles/commonStyles';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');
const DOG_IMAGE =
  'https://i.postimg.cc/13mM3Lxv/Chat-GPT-Image-2026-3-23-08-51-37.png';

export default function HomeScreen({
  setAppMode,
  onPressMap,
  isLoggedIn,
  user,
  setIsLoggedIn,
  setUser,
  myPills = [],
  onCompleteNextDose,
}) {
  const displayName = user?.nickname || user?.name || '사용자';

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('user_id');
          await SecureStore.deleteItemAsync('user_name');
          await SecureStore.deleteItemAsync('user_nickname');
          await SecureStore.deleteItemAsync('user_email');
          await SecureStore.deleteItemAsync('login_type');

          setIsLoggedIn(false);
          setUser(null);
        },
      },
    ]);
  };

  const { nextDose, isAllCompleted, totalTakenCount, totalDoseCount } = useMemo(() => {
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
      isAllCompleted: sortedSchedules.length > 0 && takenCount === sortedSchedules.length,
      totalTakenCount: takenCount,
      totalDoseCount: sortedSchedules.length,
    };
  }, [myPills]);

  const ctaLabel = isAllCompleted
    ? '오늘 복용 완료'
    : `${nextDose?.label || '다음'} 복용 완료`;

  const ctaSubText = isAllCompleted
    ? '오늘 약을 모두 챙겨 드셨어요'
    : `${nextDose?.pillName || '등록된 약'} ${nextDose?.time || ''}`;

  const rightIcon = isAllCompleted ? '✔' : '💊';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.TEXT_SUB,
                marginBottom: 6,
                fontWeight: '500',
              }}
            >
              안녕하세요,
            </Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '800',
                color: COLORS.TEXT_MAIN,
                marginBottom: 8,
              }}
            >
              {displayName}님 🌿
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.TEXT_SUB,
                lineHeight: 20,
              }}
            >
              오늘 복약 상태를 확인하고{'\n'}
              필요한 기능을 바로 이용해보세요.
            </Text>
          </View>

          <Image
            source={{ uri: DOG_IMAGE }}
            style={{
              width: Math.min(width * 0.22, 88),
              height: Math.min(width * 0.22, 88),
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* 로그인 / 로그아웃 */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginBottom: 16,
          }}
        >
          {!isLoggedIn ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setAppMode('LOGIN')}
              style={{
                backgroundColor: COLORS.WHITE,
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: COLORS.BORDER,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: COLORS.PRIMARY_DARK,
                }}
              >
                로그인
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogout}
              style={{
                backgroundColor: COLORS.WHITE,
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: COLORS.BORDER,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: COLORS.PRIMARY_DARK,
                }}
              >
                로그아웃
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 메인 복용 카드 */}
        <View
          style={{
            backgroundColor: COLORS.WHITE,
            borderRadius: 28,
            padding: 22,
            borderWidth: 1,
            borderColor: COLORS.BORDER,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.TEXT_SUB,
                  marginBottom: 6,
                  fontWeight: '600',
                }}
              >
                오늘의 복약 상태
              </Text>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: COLORS.TEXT_MAIN,
                  marginBottom: 8,
                }}
              >
                {ctaLabel}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.TEXT_SUB,
                  lineHeight: 20,
                  marginBottom: 6,
                }}
              >
                {ctaSubText}
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.TEXT_MUTED,
                  fontWeight: '600',
                }}
              >
                {totalTakenCount}/{totalDoseCount}회 완료
              </Text>
            </View>

            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: isAllCompleted ? '#DDF1E2' : COLORS.SECONDARY_LIGHT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>{rightIcon}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (!isAllCompleted) {
                onCompleteNextDose?.();
              }
            }}
            disabled={isAllCompleted}
            style={{
              backgroundColor: isAllCompleted ? '#B8D7C0' : COLORS.PRIMARY,
              borderRadius: 20,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: COLORS.WHITE,
              }}
            >
              {ctaLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 내 복용 내역 */}
        <View
          style={{
            backgroundColor: COLORS.WHITE,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: COLORS.BORDER,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: COLORS.TEXT_MAIN,
              marginBottom: 6,
            }}
          >
            내 복용 내역
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: COLORS.TEXT_SUB,
              lineHeight: 20,
              marginBottom: 12,
            }}
          >
            오늘, 이번 주, 전체 기록을 한눈에 확인해보세요.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setAppMode('HISTORY')}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: COLORS.SURFACE_SOFT,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 7,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: COLORS.PRIMARY_DARK,
              }}
            >
              전체보기 →
            </Text>
          </TouchableOpacity>
        </View>

        {/* 내 복용약 */}
        <View
          style={{
            backgroundColor: COLORS.WHITE,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: COLORS.BORDER,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: COLORS.TEXT_MAIN,
              }}
            >
              내 복용약
            </Text>

            <View
              style={{
                backgroundColor: COLORS.SECONDARY_LIGHT,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#8C7A28',
                }}
              >
                {myPills.length}개
              </Text>
            </View>
          </View>

          {myPills.length === 0 ? (
            <Text
              style={{
                fontSize: 14,
                color: COLORS.TEXT_SUB,
                lineHeight: 20,
              }}
            >
              아직 등록된 복용약이 없어요.
            </Text>
          ) : (
            <>
              {myPills.slice(0, 2).map((pill, index) => (
                <View
                  key={pill.id}
                  style={{
                    paddingVertical: 10,
                    borderTopWidth: index === 0 ? 1 : 1,
                    borderTopColor: '#EEF2EC',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: COLORS.TEXT_MAIN,
                      marginBottom: 4,
                    }}
                  >
                    {pill.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      color: COLORS.TEXT_SUB,
                    }}
                  >
                    {pill.usage || '복용 정보 없음'}
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setAppMode('MY_PILL')}
                style={{
                  marginTop: 12,
                  alignSelf: 'flex-start',
                  backgroundColor: COLORS.SURFACE_SOFT,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: COLORS.PRIMARY_DARK,
                  }}
                >
                  내 복용약 보기 →
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 하단 바로가기 */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setAppMode('SCAN')}
            style={{
              flex: 1,
              marginRight: 5,
              backgroundColor: COLORS.SURFACE_SOFT,
              borderRadius: 22,
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22, marginBottom: 6 }}>📷</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: COLORS.PRIMARY_DARK,
              }}
            >
              약 스캔
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              onPressMap?.();
            }}
            style={{
              flex: 1,
              marginLeft: 5,
              backgroundColor: COLORS.SECONDARY_LIGHT,
              borderRadius: 22,
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22, marginBottom: 6 }}>✚</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#8C7A28',
              }}
            >
              주변 약국
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}