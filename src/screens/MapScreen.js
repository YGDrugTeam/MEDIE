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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

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

const DOG_IMAGE =
  'https://i.postimg.cc/13mM3Lxv/Chat-GPT-Image-2026-3-23-08-51-37.png';

const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;

// ─── 카카오맵 HTML 생성 ────────────────────────────────────────────────────
function buildKakaoMapHtml(pharmacies, kakaoKey) {
  const markersJs = pharmacies.slice(0, 10).map((p, i) => `
    (function() {
      var pos = new kakao.maps.LatLng(${p.lat}, ${p.lng});
      var marker = new kakao.maps.Marker({ map: map, position: pos });
      var infowindow = new kakao.maps.InfoWindow({
        content: '<div style="padding:6px 10px;font-size:13px;font-weight:700;color:#065809;">${p.name.replace(/'/g, "\\'")}</div>'
      });
      kakao.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MARKER_CLICK',
          name: '${p.name.replace(/'/g, "\\'")}',
          lat: ${p.lat},
          lng: ${p.lng},
          address: '${(p.address || '').replace(/'/g, "\\'")}',
        }));
      });
    })();
  `).join('\n');

  const center = pharmacies.length > 0
    ? `{lat: ${pharmacies[0].lat}, lng: ${pharmacies[0].lng}}`
    : `{lat: 37.5665, lng: 126.9780}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services"></script>
      <script>
        var center = ${center};
        var container = document.getElementById('map');
        var options = {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 4
        };
        var map = new kakao.maps.Map(container, options);
        ${markersJs}
      </script>
    </body>
    </html>
  `;
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────
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

  // 마커 탭 → 카카오맵 길찾기
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MARKER_CLICK') {
        const kakaoNavi = `kakaomap://route?ep=${data.lat},${data.lng}&by=FOOT`;
        const kakaoWeb = `https://map.kakao.com/link/to/${encodeURIComponent(data.name)},${data.lat},${data.lng}`;
        Linking.canOpenURL(kakaoNavi)
          .then(ok => Linking.openURL(ok ? kakaoNavi : kakaoWeb))
          .catch(() => Linking.openURL(kakaoWeb));
      }
    } catch (e) { }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 📍 [수정] 터치 간섭을 완전히 제거한 헤더 구조 */}
      <View style={styles.header}>
        {/* 1층: 배경으로 깔리는 제목 (zIndex: -1) */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>주변 약국</Text>
        </View>

        {/* 2층: 실제 클릭되는 버튼들 (터치 영역 확장) */}
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setAppMode?.('HOME')}
            style={styles.backButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 30 }} // 📍 터치 민감도 대폭 상향
          >
            <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
          </TouchableOpacity>
          {/* 로고 배치 */}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
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

        {/* 🗺️ 카카오맵 WebView */}
        <View style={styles.mapCard}>
          <WebView
            source={{ html: buildKakaoMapHtml(nearbyPharmacies, KAKAO_JS_KEY) }}
            style={styles.mapImage}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            scrollEnabled={false}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 64, // 마이페이지와 규격 통일
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    zIndex: 10, // 헤더 전체를 상단으로
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20, // 버튼 영역을 제목보다 위로
  },
  headerTitleContainer: {
    position: 'absolute', // 제목을 바닥에 깔기
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, // 📍 이게 핵심! 제목이 버튼 터치를 방해하지 않음
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
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
    overflow: 'hidden', // WebView 모서리 둥글게
  },

  mapImage: {
    width: '100%',
    height: Math.min(width * 0.58, 260),
    borderRadius: 18,
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

  bottomTabItem: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});