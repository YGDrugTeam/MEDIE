import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import usePillSearch from '../hooks/usePillSearch';

const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  primaryDark: '#006E07',
  secondary: '#67A369',
  warm: '#FFFDE7',
  muted: '#8C8C8C',
  border: '#C8D8B5',
};

const DEV_MOCK_PILL_SEARCH = false;

const createMockPill = (pillName) => ({
  name: pillName || '타이레놀',
  company: '임시 제조사',
  effect:
    '타이레놀은 주로 해열제 및 진통제로 사용돼. 두통, 몸살, 치통, 발열 완화에 도움을 줄 수 있어.',
  caution:
    '간 질환이 있거나 다른 해열진통제와 함께 복용 중이면 주의가 필요해.',
  schedule: '매일 AM 08:00',
  confidence: '89.8%',
});

export default function SearchPillScreen({ setAppMode, initialKeyword, onSearch }) {
  const apiBaseUrl = useMemo(() => 'http://20.106.40.121', []);

  const {
    query,
    setQuery,
    canSearch,
    isSearching,
    selected,
    hasSearchedOnce,  // ✅ 추가
    search,
  } = usePillSearch({ apiBaseUrl });

  const [mockSelected, setMockSelected] = useState(null);
  const [mockSearching, setMockSearching] = useState(false);

  const finalSelected = DEV_MOCK_PILL_SEARCH ? mockSelected : selected;
  const finalIsSearching = DEV_MOCK_PILL_SEARCH ? mockSearching : isSearching;

  const hasSearched = DEV_MOCK_PILL_SEARCH ? !!mockSelected : hasSearchedOnce;

  const handleSearch = (searchQuery) => {
    const q = (searchQuery || query || '').toString();  // ← toString() 추가
    if (!q.trim()) return;

    Keyboard.dismiss();

    if (DEV_MOCK_PILL_SEARCH) {
      setMockSearching(true);
      setTimeout(() => {
        const fakeItem = createMockPill(q.trim());
        setMockSelected(fakeItem);
        setMockSearching(false);
      }, 350);
      return;
    }

    if (!canSearch || isSearching) return;
    search();
  };

  useEffect(() => {
    if (initialKeyword) {
      setQuery(initialKeyword);
      handleSearch(initialKeyword);
      if (onSearch) onSearch();
    }
  }, [initialKeyword]);

  const handleResetMock = () => {
    if (DEV_MOCK_PILL_SEARCH) {
      setMockSelected(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={10}
        >
          {/* 📍 [수정] 통일된 헤더 구조: 제목 간섭 제거 + 버튼 여백 확보 */}
          <View style={styles.header}>
            {/* 1층: 배경 중앙 제목 */}
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitleText}>약 검색</Text>
            </View>

            {/* 2층: 실제 버튼들 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAppMode('HOME')}
              style={styles.backButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAppMode('SCAN')}
              style={styles.scanButton}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color={COLORS.secondary}
                style={styles.scanIcon}
              />
              <Text style={styles.scanButtonText}>약 스캔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!hasSearched ? (
              <>
                <View style={styles.titleArea}>
                  <Text style={styles.title}>약 검색</Text>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.searchInputContainer}>
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      placeholder="약에 대해 궁금한점을 물어보세요!"
                      placeholderTextColor={COLORS.muted}
                      style={styles.input}
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="search"
                      onSubmitEditing={handleSearch}
                    />

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleSearch}
                      style={styles.searchIconBtn}
                    >
                      <Ionicons
                        name="search"
                        size={22}
                        color={COLORS.primaryDark}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {finalIsSearching ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator color={COLORS.primary} />
                    <Text style={styles.loadingText}>약 정보를 찾는 중이야...</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <ScrollView
                style={styles.resultScroll}
                contentContainerStyle={styles.resultContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onTouchStart={Keyboard.dismiss}
              >
                <View style={styles.inputWrapper}>
                  <View style={styles.searchInputContainer}>
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      placeholder="약에 대해 궁금한점을 물어보세요!"
                      placeholderTextColor={COLORS.muted}
                      style={styles.input}
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="search"
                      onSubmitEditing={handleSearch}
                    />

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleSearch}
                      style={styles.searchIconBtn}
                    >
                      <Ionicons
                        name="search"
                        size={22}
                        color={COLORS.primaryDark}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {finalIsSearching ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator color={COLORS.primary} />
                    <Text style={styles.loadingText}>약 정보를 찾는 중이야...</Text>
                  </View>
                ) : null}

                {!finalIsSearching && finalSelected ? (
                  <View style={styles.resultDetailCard}>
                    <Text style={styles.resultTitle}>AI 분석결과</Text>

                    <Text style={styles.resultConfidence}>
                      신뢰도 {finalSelected.confidence || '89.8%'}
                    </Text>

                    <Text style={styles.resultSection}>복용 목적</Text>
                    <Text style={styles.resultText}>
                      {finalSelected.effect || '정보 없음'}
                    </Text>

                    <Text style={styles.resultWarning}>주의사항</Text>
                    <Text style={styles.resultText}>
                      {finalSelected.caution || '복용 전 전문가 상담이 필요할 수 있어요.'}
                    </Text>

                    <Text style={styles.resultSection}>복약시간</Text>
                    <Text style={styles.resultText}>
                      {finalSelected.schedule || '매일 AM 08:00'}
                    </Text>

                    <Text style={styles.resultAlarm}>
                      ⏰ 핸드폰 알람 설정하기 →
                    </Text>
                  </View>
                ) : null}

                {!finalIsSearching && hasSearchedOnce && !finalSelected ? (
                  <View style={{ alignItems: 'center', marginTop: 30 }}>
                    <Text style={{ fontSize: 16, color: '#888' }}>
                      '{query}' 검색 결과가 없어요.
                    </Text>
                    <Text style={{ fontSize: 14, color: '#aaa', marginTop: 8 }}>
                      다른 약 이름으로 검색해보세요.
                    </Text>
                  </View>
                ) : null}

                {DEV_MOCK_PILL_SEARCH ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleResetMock}
                    style={styles.devResetBtn}
                  >
                  </TouchableOpacity>
                ) : null}
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // 📍 [통일] 마이페이지 규격 헤더 스타일
  header: {
    height: 64,
    paddingHorizontal: 20, // 📍 양옆 여백을 주어 버튼이 벽에 붙지 않게 함
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    zIndex: 1,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, // 제목이 버튼 터치를 방해하지 않음
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10, // 터치 영역 확보를 위한 마이너스 마진
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 18,
    paddingHorizontal: 15, // 📍 내부 여백 조절
    paddingVertical: 8,
    marginRight: -5, // 📍 오른쪽 벽에서 살짝 떼기
  },
  scanIcon: {
    marginRight: 6,
  },
  scanButtonText: {
    fontSize: 14, // 16에서 14로 살짝 줄여서 다른 페이지와 통일
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 110,
  },
  titleArea: {
    marginTop: 120,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 28,
  },
  inputWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  searchInputContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    minHeight: 70,
    backgroundColor: COLORS.warm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingLeft: 20,
    paddingRight: 58,
    paddingVertical: 18,
    fontSize: 18,
    color: COLORS.primary,
  },
  searchIconBtn: {
    position: 'absolute',
    right: 18,
    top: '50%',
    marginTop: -14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.muted,
  },
  resultScroll: {
    flex: 1,
    width: '100%',
  },
  resultContent: {
    paddingTop: 20,
    paddingBottom: 200,  // 100 → 200
  },
  resultDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 16,
  },
  resultConfidence: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  resultSection: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
  resultWarning: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E30000',
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

  tabItem: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});