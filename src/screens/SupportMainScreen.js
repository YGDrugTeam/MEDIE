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

        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setAppMode('COMMUNITY')}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={30} color={COLORS.secondary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>고객센터</Text>

          <TouchableOpacity
            onPress={() => setAppMode('SUPPORT_WRITE')}
            style={styles.writeButton}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.white} />
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

  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },

  writeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#67A369',
    alignItems: 'center',
    justifyContent: 'center',
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