import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BOARD_CATEGORIES } from '../constants/boardCategories';
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
} from 'react-native';

import { styles } from '../styles/commonStyles';
import BackToMenuBtn from '../components/BackToMenuBtn';

const BOARD_API_BASE = 'https://172.169.59.206';

export default function CommunityScreen({
  setAppMode,
  onOpenBoard,
  setWriteBoardType,
}) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('free');
  const [selectedTab, setSelectedTab] = useState('latest');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const selectedCategoryInfo = useMemo(() => {
    return (
      BOARD_CATEGORIES.find((category) => category.key === selectedCategory) ||
      BOARD_CATEGORIES[0]
    );
  }, [selectedCategory]);

  const isBoardCategory = selectedCategory !== 'support';

  const getBoardUrl = useCallback(() => {
    if (selectedTab === 'latest') {
      return `${BOARD_API_BASE}/boards/type/${selectedCategory}`;
    }

    return `${BOARD_API_BASE}/boards/type/${selectedCategory}/${selectedTab}`;
  }, [selectedCategory, selectedTab]);

  const fetchBoards = useCallback(async () => {
    if (!isBoardCategory) {
      setPosts([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);

      let url = getBoardUrl();
      let res = await fetch(url);

      if (!res.ok && (selectedTab === 'popular' || selectedTab === 'recommend')) {
        url = `${BOARD_API_BASE}/boards/type/${selectedCategory}`;
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
  }, [getBoardUrl, isBoardCategory, selectedCategory, selectedTab]);

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
    setSelectedTab('latest');
    setSearchKeyword('');
  };

  const handlePressWrite = () => {
    if (selectedCategory === 'support') {
      setAppMode('SUPPORT_WRITE');
      return;
    }

    if (typeof setWriteBoardType === 'function') {
      setWriteBoardType(selectedCategory);
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
        `&board_type=${encodeURIComponent(selectedCategory)}`;

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

  const handleResetSearch = () => {
    setSearchKeyword('');
    fetchBoards();
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onOpenBoard(item)}
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '700',
          color: '#222',
          marginBottom: 6,
        }}
        numberOfLines={1}
      >
        {item.title}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 12, color: '#777' }}>
          {item.author || '작성자 없음'}
        </Text>
        <Text style={{ fontSize: 12, color: '#999' }}>
          {item.created_at ? item.created_at.slice(0, 10) : ''}
        </Text>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <Text style={{ fontSize: 11, color: '#999', marginRight: 10 }}>
          👁 {item.views ?? 0}
        </Text>
        <Text style={{ fontSize: 11, color: '#999' }}>
          ❤️ {item.likes ?? 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.subContainer, { paddingBottom: 8 }]}>
        <View
          style={{
            marginTop: 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePressSearch}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#eee',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 17 }}>🔍</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 21,
              fontWeight: '800',
              color: '#222',
            }}
          >
            커뮤니티
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePressWrite}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FF7F50',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 17, color: '#fff' }}>✏️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 4,
            paddingHorizontal: 1,
          }}
          style={{ marginTop: 6, maxHeight: 56 }}
        >
          {BOARD_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.key;

            return (
              <TouchableOpacity
                key={category.key}
                activeOpacity={0.8}
                onPress={() => handleCategoryPress(category.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isSelected ? '#FFF4EE' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isSelected ? '#FF7F50' : '#E8E8E8',
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginRight: 8,
                  height: 40,
                }}
              >
                <Text style={{ fontSize: 14, marginRight: 5 }}>
                  {category.icon}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#FF7F50' : '#555',
                  }}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F6F6F6',
            borderRadius: 12,
            padding: 4,
            marginTop: 8,
            marginBottom: 6,
          }}
        >
          {[
            { key: 'recommend', label: '추천글' },
            { key: 'latest', label: '최신글' },
            { key: 'popular', label: '인기글' },
          ].map((tab) => {
            const isSelected = selectedTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setSelectedTab(tab.key)}
                style={{
                  flex: 1,
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  borderRadius: 9,
                  paddingVertical: 8,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#FF7F50' : '#666',
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={{
            marginTop: 2,
            marginBottom: 8,
            backgroundColor: '#FFF4EE',
            borderRadius: 10,
            paddingVertical: 9,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: '#FF7F50',
            }}
          >
            {selectedCategoryInfo.icon} {selectedCategoryInfo.label}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleResetSearch}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ fontSize: 11, color: '#666', fontWeight: '600' }}>
              전체 목록
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ marginTop: 24, alignItems: 'center', flex: 1 }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10, color: '#777' }}>
              게시글을 불러오는 중...
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 18, flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 34 }}>
                <Text style={{ color: '#777' }}>등록된 게시글이 없습니다.</Text>
              </View>
            }
          />
        )}

        <BackToMenuBtn onPress={() => setAppMode('HOME')} />
      </View>

      <Modal
        visible={isSearchOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSearchOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 18,
              padding: 18,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#222',
                marginBottom: 14,
              }}
            >
              게시글 검색
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: '#777',
                marginBottom: 10,
              }}
            >
              현재 게시판: {selectedCategoryInfo.label}
            </Text>

            <TextInput
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholder="제목, 내용, 작성자를 검색하세요"
              placeholderTextColor="#999"
              autoFocus
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#EAEAEA',
                color: '#111',
                marginBottom: 14,
              }}
            />

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsSearchOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#B0B0B0',
                  borderRadius: 12,
                  paddingVertical: 13,
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSearch}
                disabled={isSearching}
                style={{
                  flex: 1,
                  backgroundColor: isSearching ? '#FFB79F' : '#FF7F50',
                  borderRadius: 12,
                  paddingVertical: 13,
                  alignItems: 'center',
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>
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