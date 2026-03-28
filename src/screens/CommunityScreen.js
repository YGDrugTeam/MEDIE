import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BOARD_API_BASE = 'http://20.106.40.121';

const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  primaryDark: '#006E07',
  secondary: '#67A369',
  warm: '#FFFDE7',
  muted: '#8C8C8C',
  border: '#C8D8B5',
  softBg: '#F7FBF4',
  cardBg: '#FFFFFF',
  chipBg: '#FFFFFF',
  chipActive: '#A9D18E',
  tabBg: '#EAF4E3',
};

const CATEGORY_ITEMS = [
  { key: 'free', label: '자유수다', icon: '💊' },
  { key: 'question', label: '복약질문', icon: '💬' },
  { key: 'hospital', label: '복용후기', icon: '🏥' },
  { key: 'review', label: '공지사항', icon: '💭' },
  { key: 'support', label: '고객센터', icon: '🐶' },
];

export default function CommunityScreen({
  setAppMode,
  onOpenBoard,
  setWriteBoardType,
}) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('free');
  const [selectedTab, setSelectedTab] = useState('recommend');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const selectedCategoryInfo = useMemo(() => {
    return (
      CATEGORY_ITEMS.find((category) => category.key === selectedCategory) ||
      CATEGORY_ITEMS[0]
    );
  }, [selectedCategory]);

  const isBoardCategory = selectedCategory !== 'support';

  // 📍 [수정] 서버가 인식하는 boardType으로 정규화
  const normalizedBoardType = useMemo(() => {
    if (selectedCategory === 'hospital') return 'review'; // 복용후기 -> review
    if (selectedCategory === 'question') return 'qna';    // 복약질문 -> qna
    return selectedCategory;
  }, [selectedCategory]);

  const getBoardUrl = useCallback(() => {
    const boardType = normalizedBoardType;
    if (selectedTab === 'latest') {
      return `${BOARD_API_BASE}/boards/type/${boardType}`;
    }
    return `${BOARD_API_BASE}/boards/type/${boardType}/${selectedTab}`;
  }, [normalizedBoardType, selectedTab]);

  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = getBoardUrl();
      let res = await fetch(url);

      if (!res.ok && (selectedTab === 'popular' || selectedTab === 'recommend')) {
        url = `${BOARD_API_BASE}/boards/type/${normalizedBoardType}`;
        res = await fetch(url);
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || '목록 조회 실패');
      }
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('❌ fetchBoards 실패:', e);
      Alert.alert('오류', '게시글 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getBoardUrl, normalizedBoardType, selectedTab]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleRefresh = () => {
    if (!isBoardCategory) return;
    setIsRefreshing(true);
    fetchBoards();
  };

  const handleCategoryPress = (categoryKey) => {
    if (categoryKey === 'support') {
      setAppMode('SUPPORT');
      return;
    }
    setSelectedCategory(categoryKey);
    setSelectedTab('recommend');
    setSearchKeyword('');
  };

  const handlePressWrite = () => {
    if (!isBoardCategory) {
      Alert.alert('안내', '고객센터는 전용 화면을 이용해주세요.');
      return;
    }
    if (typeof setWriteBoardType === 'function') {
      setWriteBoardType(normalizedBoardType);
    }
    setAppMode('WRITE_BOARD');
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    try {
      setIsSearching(true);
      const url = `${BOARD_API_BASE}/boards/search?q=${encodeURIComponent(searchKeyword.trim())}&board_type=${encodeURIComponent(normalizedBoardType)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error('검색 실패');
      setPosts(Array.isArray(data) ? data : []);
      setIsSearchOpen(false);
    } catch (e) {
      Alert.alert('오류', '검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleResetSearch = useCallback(() => {
    setSearchKeyword('');
    setIsSearchOpen(false);
    fetchBoards();
  }, [fetchBoards]);

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={() => onOpenBoard(item, selectedCategoryInfo.label)}
      style={styles.postCard}
    >
      <View style={styles.postCardInner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.postMeta} numberOfLines={1}>
            {item.author || '익명'} ・ {item.created_at ? item.created_at.slice(0, 10) : ''}
          </Text>
          <View style={styles.postStatsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color="#A9C68A" />
              <Text style={styles.statText}>{item.views ?? 0}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color="#B9D49D" />
              <Text style={styles.statText}>{item.likes ?? 0}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={30} color="#B6CFA7" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 📍 [수정] 헤더 구조: 제목이 버튼을 가리지 않도록 층을 나눔 */}
        <View style={styles.header}>
          {/* 1층: 배경처럼 깔리는 중앙 제목 */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>커뮤니티</Text>
          </View>

          {/* 2층: 실제 클릭되는 버튼들 */}
          <TouchableOpacity
            onPress={() => setAppMode('HOME')}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 📍 터치 민감도 상향
          >
            <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAppMode('SCAN')} style={styles.scanButton}>
            <Ionicons name="camera-outline" size={18} color={COLORS.secondary} style={{ marginRight: 6 }} />
            <Text style={styles.scanButtonText}>약 스캔</Text>
          </TouchableOpacity>
        </View>

        {/* 📍 [수정] 카테고리 영역 높이 고정으로 레이아웃 밀림 해결 */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {CATEGORY_ITEMS.map((category) => {
              const isSelected = selectedCategory === category.key;
              return (
                <TouchableOpacity
                  key={category.key}
                  onPress={() => handleCategoryPress(category.key)}
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.tabOuter}>
          {['recommend', 'latest', 'popular'].map((key) => {
            const labels = { recommend: '추천', latest: '최신', popular: '인기' };
            const isSelected = selectedTab === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedTab(key)}
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>{labels[key]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primaryDark} />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item, index) => item?.id ? String(item.id) : String(index)}
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={<View style={styles.emptyWrap}><Text style={styles.emptyText}>게시글이 없습니다.</Text></View>}
          />
        )}

        <TouchableOpacity onPress={handlePressWrite} style={styles.writeFab}>
          <Ionicons name="pencil" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.writeFabText}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* 📍 [삭제] 중복 하단바 코드 제거됨 (App.js에서 관리) */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },

  // 📍 [수정] 마이페이지 규격 반영 + 터치 간섭 제거
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    zIndex: 1, // 헤더가 위로 오게 함
  },
  headerTitleContainer: {
    position: 'absolute', // 📍 제목을 바닥에 깔아서 버튼 터치를 방해하지 않게 함
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, // 📍 버튼보다 뒤로 보냄
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065809",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
    backgroundColor: 'transparent', // 📍 영역 확인용 (필요시 색상 넣어보세요)
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  scanButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },

  // 📍 [수정] 높이 고정 컨테이너
  categoryContainer: { height: 60, marginTop: 10 },
  categoryScrollContent: { paddingRight: 8, alignItems: 'center' },
  categoryChip: { height: 42, paddingHorizontal: 16, marginRight: 10, borderRadius: 21, borderWidth: 1.2, borderColor: '#D9E7D0', backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center' },
  categoryChipActive: { backgroundColor: COLORS.chipActive, borderColor: COLORS.chipActive },
  categoryIcon: { fontSize: 16, marginRight: 6 },
  categoryLabel: { fontSize: 14, fontWeight: '700', color: '#4A5E43' },
  categoryLabelActive: { color: '#FFFFFF' },

  tabOuter: { marginTop: 10, marginBottom: 15, alignSelf: 'center', flexDirection: 'row', backgroundColor: COLORS.tabBg, borderRadius: 25, padding: 4, width: '100%' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 21 },
  tabBtnActive: { backgroundColor: '#FFFFFF', elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6E8067' },
  tabTextActive: { color: COLORS.primaryDark, fontWeight: '800' },

  listContent: { paddingBottom: 100 },
  postCard: { marginBottom: 16, borderRadius: 24, backgroundColor: '#FFF', elevation: 3, shadowOpacity: 0.05 },
  postCardInner: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  postTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 8 },
  postMeta: { fontSize: 12, color: '#7D8A75', marginBottom: 10 },
  postStatsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { marginLeft: 5, fontSize: 12, color: '#7A8E6F' },
  statDivider: { width: 1, height: 12, backgroundColor: '#EEE', marginHorizontal: 10 },
  writeFab: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#A9D18E', borderRadius: 30, paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  writeFabText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.muted }
});