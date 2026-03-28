import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackToMenuBtn from '../components/BackToMenuBtn';

const API_BASE = 'http://20.106.40.121';

const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  primaryLight: '#67A369',
  secondary: '#8BBC8E',
  soft: '#EEF7EE',
  border: '#D9E8D7',
  cardBg: '#FFFFFF',
  text: '#222222',
  subText: '#6F786C',
  white: '#FFFFFF',

  // 🔥 상태별 컬러 추가
  pendingBg: '#EEF7EE',
  pendingText: '#065809',

  answeredBg: '#EAF6EC',
  answeredText: '#2F7D45',

  closedBg: '#F1F3F1',
  closedText: '#6E756D',
};

export default function SupportMainScreen({ setAppMode, onOpenSupport }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSupportTickets = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE}/support/`);
      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) throw new Error(data?.detail || '문의 목록 조회 실패');

      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSupportTickets();
  }, [fetchSupportTickets]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSupportTickets();
  };

  // 🔥 상태 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN':
        return '접수중';
      case 'ANSWERED':
        return '답변 완료';
      case 'CLOSED':
        return '처리 종료';
      default:
        return '확인중';
    }
  };

  // 🔥 상태칩 디자인
  const getStatusChipStyle = (status) => {
    switch (status) {
      case 'ANSWERED':
        return {
          backgroundColor: COLORS.answeredBg,
          color: COLORS.answeredText,
        };
      case 'CLOSED':
        return {
          backgroundColor: COLORS.closedBg,
          color: COLORS.closedText,
        };
      case 'OPEN':
      default:
        return {
          backgroundColor: COLORS.pendingBg,
          color: COLORS.pendingText,
        };
    }
  };

  const renderTicketItem = ({ item }) => {
    const statusChip = getStatusChipStyle(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onOpenSupport(item)}
        style={styles.ticketCard}
      >
        <View
          style={[
            styles.statusChip,
            { backgroundColor: statusChip.backgroundColor },
          ]}
        >
          <Text style={[styles.statusChipText, { color: statusChip.color }]}>
            {getStatusText(item.status)}
          </Text>
        </View>

        <Text style={styles.ticketTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.ticketMetaRow}>
          <Text style={styles.ticketMetaText}>
            {item.author || '작성자 없음'}
          </Text>
          <Text style={styles.ticketMetaText}>
            {item.created_at ? item.created_at.slice(0, 10) : ''}
          </Text>
        </View>

        <View style={styles.ticketArrowWrap}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primaryLight} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* 📍 [수정] 마이페이지 규격 반영 + 터치 간섭 제거된 헤더 */}
        <View style={styles.header}>
          {/* 1층: 배경으로 깔리는 제목 (zIndex: -1) */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>고객센터</Text>
          </View>

          {/* 2층: 실제 클릭되는 버튼들 */}
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAppMode('MY_PAGE')} // 📍 보통 고객센터는 마이페이지에서 오니까 MY_PAGE로 연결
              style={styles.backButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // 📍 터치 민감도 상향
            >
              <Ionicons name="chevron-back" size={34} color="#67A369" />
            </TouchableOpacity>
            {/* 로고 추가 (통일감) */}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAppMode('SUPPORT_WRITE')}
            style={styles.writeButton}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* 리스트 */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item, index) =>
              item?.id ? String(item.id) : `ticket-${index}`
            }
            renderItem={renderTicketItem}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        <BackToMenuBtn onPress={() => setAppMode('HOME')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // 📍 [통일] 마이페이지 규격 헤더 스타일
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
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
    color: '#065809',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  writeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#67A369',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },

  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },

  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  ticketTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },

  ticketMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  ticketMetaText: {
    fontSize: 12,
    color: '#777',
  },

  ticketArrowWrap: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -10,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
  },
});