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
const DEV_MOCK_COMMUNITY = true;

const MOCK_POSTS = [
  {
    id: 1001,
    title: '타이레놀 효과 좋나요?',
    author: '약잘알',
    created_at: '2026-04-22T09:00:00',
    views: 120,
    likes: 23,
  },
  {
    id: 1002,
    title: 'OO약 쓸 때 주의해야 할 점',
    author: '약잘알',
    created_at: '2026-04-23T10:30:00',
    views: 95,
    likes: 18,
  },
];


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

  const normalizedBoardType = useMemo(() => {
    if (selectedCategory === 'hospital') return 'question';
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
    if (DEV_MOCK_COMMUNITY) {
      setPosts(MOCK_POSTS);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

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
        console.error('응답 원문:', text);
        throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
      }

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || '게시글 목록 조회 실패');
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('❌ fetchBoards 실패:', e);
      Alert.alert('오류', '게시글 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getBoardUrl, isBoardCategory, normalizedBoardType, selectedTab]);

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
      Alert.alert('안내', '고객센터는 고객센터 화면에서 작성해주세요.');
      return;
    }

    if (typeof setWriteBoardType === 'function') {
      setWriteBoardType(normalizedBoardType);
    }
    setAppMode('WRITE_BOARD');
  };

  const handlePressSearch = () => {
    if (!isBoardCategory) {
      Alert.alert('안내', '고객센터는 별도 화면에서 검색 또는 확인해주세요.');
      return;
    }
    setIsSearchOpen(true);
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('입력 확인', '검색어를 입력해주세요.');
      return;
    }

    try {
      setIsSearching(true);

      const url =
        `${BOARD_API_BASE}/boards/search?q=${encodeURIComponent(searchKeyword.trim())}` +
        `&board_type=${encodeURIComponent(normalizedBoardType)}`;

      const res = await fetch(url);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('검색 응답 원문:', text);
        throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
      }

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || '게시글 검색 실패');
      }

      setPosts(Array.isArray(data) ? data : []);
      setIsSearchOpen(false);
    } catch (e) {
      console.error('❌ searchBoards 실패:', e);
      Alert.alert('오류', '게시글 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={() => onOpenBoard(item, selectedCategoryInfo.label)}
      style={styles.postCard}
    >
      <View style={styles.postCardInner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.postTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={styles.postMeta} numberOfLines={1}>
            {item.author || '작성자 없음'} ・{' '}
            {item.created_at ? item.created_at.slice(0, 10) : ''}
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

        <Ionicons
          name="chevron-forward"
          size={30}
          color="#B6CFA7"
          style={styles.postChevron}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 상단 - 네 피그마 기준 */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAppMode('HOME')}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>커뮤니티</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAppMode('SCAN')}
            style={styles.scanButton}
          >
            <Ionicons
              name="camera-outline"
              size={18}
              color={COLORS.secondary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.scanButtonText}>약 스캔</Text>
          </TouchableOpacity>
        </View>

        {/* 카테고리 - 가로 스크롤, 고객센터 포함 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
          style={styles.categoryScroll}
        >
          {CATEGORY_ITEMS.map((category) => {
            const isSelected = selectedCategory === category.key;

            return (
              <TouchableOpacity
                key={category.key}
                activeOpacity={0.85}
                onPress={() => handleCategoryPress(category.key)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 정렬 탭 */}
        <View style={styles.tabOuter}>
          {[
            { key: 'recommend', label: '추천' },
            { key: 'latest', label: '최신' },
            { key: 'popular', label: '인기' },
          ].map((tab) => {
            const isSelected = selectedTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                onPress={() => setSelectedTab(tab.key)}
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              >
                <Text
                  style={[styles.tabText, isSelected && styles.tabTextActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 리스트 */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primaryDark} />
            <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item, index) =>
              item?.id ? String(item.id) : `${item.title}-${index}`
            }
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primaryDark}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>등록된 게시글이 없습니다.</Text>
              </View>
            }
          />
        )}

        {/* 글쓰기 버튼 */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePressWrite}
          style={styles.writeFab}
        >
          <Ionicons
            name="pencil"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.writeFabText}>글쓰기</Text>
        </TouchableOpacity>

        {/* 하단바 - 약검색과 동일 톤, 두번째는 위치 아이콘 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={() => setAppMode('HOME')}
            style={styles.bottomTabItem}
          >
            <Ionicons name="home" size={28} color={COLORS.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAppMode('MAP')}
            style={styles.bottomTabItem}
          >
            <Ionicons name="location" size={28} color={COLORS.secondary} />
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
            onPress={() => setAppMode('MYPAGE')}
            style={styles.bottomTabItem}
          >
            <Ionicons name="person" size={28} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색 모달 */}
      <Modal
        visible={isSearchOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSearchOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>게시글 검색</Text>

            <Text style={styles.modalSub}>
              현재 게시판: {selectedCategoryInfo.label}
            </Text>

            <TextInput
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholder="제목, 내용, 작성자를 검색하세요"
              placeholderTextColor={COLORS.muted}
              autoFocus
              style={styles.modalInput}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsSearchOpen(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSearch}
                disabled={isSearching}
                style={[
                  styles.searchBtn,
                  isSearching && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.searchBtnText}>
                  {isSearching ? '검색 중...' : '검색'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    top: 14,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

  categoryScroll: {
    marginTop: 14,
    maxHeight: 54,
  },
  categoryScrollContent: {
    paddingRight: 8,
  },
  categoryChip: {
    height: 42,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: '#D9E7D0',
    backgroundColor: COLORS.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: COLORS.chipActive,
    borderColor: COLORS.chipActive,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5E43',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },

  tabOuter: {
    marginTop: 16,
    marginBottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: COLORS.tabBg,
    borderRadius: 999,
    padding: 4,
    minWidth: 220,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6E8067',
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },

  listContent: {
    paddingBottom: 140,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: COLORS.cardBg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  postCardInner: {
    minHeight: 124,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  postMeta: {
    fontSize: 13,
    color: '#7D8A75',
    marginBottom: 14,
  },
  postStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#7A8E6F',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#D9E7D0',
    marginHorizontal: 12,
  },
  postChevron: {
    marginLeft: 10,
  },

  loadingWrap: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
  },
  emptyWrap: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.muted,
  },

  writeFab: {
    position: 'absolute',
    right: 22,
    bottom: 122,
    backgroundColor: '#A9D18E',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 3,
  },
  writeFabText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
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
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#F8FBF5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#DFEADB',
    color: '#111',
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#B8B8B8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBtn: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});