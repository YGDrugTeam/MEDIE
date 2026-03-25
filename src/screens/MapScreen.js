import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  secondary: '#67A369',
  warm: '#FFFDE7',
  muted: '#8C8C8C',
  border: '#DCE8C8',
  text: '#111111',
  soft: '#FCFFF9',
  pharmacyCard: '#FFFBEA',
  pharmacyBorder: '#F0E6BE',
  accent: '#D88B1D',
};

const MAP_IMAGE =
  'https://i.postimg.cc/T1fYQjb8/Chat-GPT-Image-2026-3-24-10-30-20.png';
const DOG_IMAGE =
  'https://i.postimg.cc/13mM3Lxv/Chat-GPT-Image-2026-3-23-08-51-37.png';

export default function MapScreen({
  nearbyPharmacies = [],
  isSearchingMap = false,
  findNearbyPharmacies,
  makePhoneCall,
  openKakaoMapDetail,
  setAppMode,
}) {
  useEffect(() => {
    findNearbyPharmacies?.();
  }, [findNearbyPharmacies]);

  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        onPress={() => setAppMode?.('HOME')}
        style={styles.bottomTabItem}
      >
        <Ionicons name="home" size={28} color={COLORS.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setAppMode?.('MAP')}
        style={styles.bottomTabItem}
      >
        <Ionicons name="location" size={28} color={COLORS.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setAppMode?.('SEARCH_PILL')}
        style={styles.bottomTabItem}
      >
        <Ionicons name="search" size={28} color={COLORS.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setAppMode?.('COMMUNITY')}
        style={styles.bottomTabItem}
      >
        <Ionicons
          name="chatbubble-ellipses"
          size={28}
          color={COLORS.secondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setAppMode?.('MY_PAGE')}
        style={styles.bottomTabItem}
      >
        <Ionicons name="person" size={28} color={COLORS.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAppMode?.('HOME')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>주변 약국</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.scanButton}
          onPress={() => setAppMode?.('SCAN')}
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
        {/* 타이틀 */}
        <Text style={styles.pageTitle}>주변 약국</Text>
        <Text style={styles.pageSubTitle}>
          주변 약국 정보 및 위치 번호를 알려드려요.
        </Text>

        {/* 지도 이미지 */}
        <View style={styles.mapCard}>
          <Image
            source={{ uri: MAP_IMAGE }}
            style={styles.mapImage}
          />
        </View>

        {/* 로딩 */}
        {isSearchingMap ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>주변 약국을 찾는 중이에요...</Text>
          </View>
        ) : nearbyPharmacies.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>검색 결과가 없어요</Text>
            <Text style={styles.emptyDesc}>
              현재 시간 기준으로 영업 중인{'\n'}주변 약국이 없습니다.
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {nearbyPharmacies.map((p, index) => (
              <View
                key={p.id || `${p.name}-${index}`}
                style={styles.pharmacyCard}
              >
                <View style={styles.pharmacyLeft}>
                  <Text style={styles.pharmacyName}>
                    {p.name}
                    {p.dist ? ` | ${p.dist}` : ''}
                  </Text>

                  <Text style={styles.pharmacyMeta}>
                    {p.status || '영업 정보 없음'}
                  </Text>

                  {!!p.address && (
                    <Text style={styles.pharmacyMeta}>{p.address}</Text>
                  )}
                </View>

                <View style={styles.actionWrap}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => makePhoneCall?.(p.phone)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionEmoji}>☎️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => openKakaoMapDetail?.(p)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionEmoji}>🗺️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 매디멍 */}
        <View style={styles.dogWrap}>
          <Image source={{ uri: DOG_IMAGE }} style={styles.dogImage} />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderBottomBar()}
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

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 8,
  },

  pageSubTitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 18,
  },

  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 18,
  },

  mapImage: {
    width: '100%',
    height: Math.min(width * 0.58, 260),
    borderRadius: 18,
    resizeMode: 'cover',
    backgroundColor: '#F8FBF5',
  },

  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.muted,
  },

  emptyCard: {
    backgroundColor: COLORS.warm,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },

  emptyDesc: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
  },

  listWrap: {
    marginBottom: 12,
  },

  pharmacyCard: {
    backgroundColor: COLORS.pharmacyCard,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.pharmacyBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pharmacyLeft: {
    flex: 1,
    paddingRight: 10,
  },

  pharmacyName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },

  pharmacyMeta: {
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: 6,
    fontWeight: '600',
    lineHeight: 20,
  },

  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  actionEmoji: {
    fontSize: 18,
  },

  dogWrap: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },

  dogImage: {
    width: Math.min(width * 0.26, 100),
    height: Math.min(width * 0.26, 100),
    resizeMode: 'contain',
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
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  bottomTabItem: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});