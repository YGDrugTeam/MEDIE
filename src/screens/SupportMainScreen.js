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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/commonStyles';
import BackToMenuBtn from '../components/BackToMenuBtn';

const API_BASE = 'http://20.106.40.121';

export default function SupportMainScreen({ setAppMode, onOpenSupport }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSupportTickets = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE}/support/`);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('고객센터 응답 원문:', text);
        throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
      }

      if (!res.ok) {
        throw new Error(data?.detail || '문의 목록 조회 실패');
      }

      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('❌ fetchSupportTickets 실패:', e);
      Alert.alert('오류', e.message || '문의 목록을 불러오지 못했습니다.');
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

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN':
        return '접수 완료';
      case 'ANSWERED':
        return '답변 완료';
      case 'CLOSED':
        return '처리 종료';
      default:
        return '확인중';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return '#FF7F50';
      case 'ANSWERED':
        return '#1F8B4C';
      case 'CLOSED':
        return '#666';
      default:
        return '#666';
    }
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onOpenSupport(item)}
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
      }}
    >
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: '#FFF4EC',
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 5,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: getStatusColor(item.status),
          }}
        >
          {getStatusText(item.status)}
        </Text>
      </View>

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
        }}
      >
        <Text style={{ fontSize: 12, color: '#777' }}>
          {item.author || '작성자 없음'}
        </Text>
        <Text style={{ fontSize: 12, color: '#999' }}>
          {item.created_at ? item.created_at.slice(0, 10) : ''}
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
            onPress={() => setAppMode('COMMUNITY')}
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
            <Ionicons name="arrow-back" size={20} color="#444" />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 21,
              fontWeight: '800',
              color: '#222',
            }}
          >
            고객센터
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAppMode('SUPPORT_WRITE')}
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

        <View
          style={{
            marginTop: 10,
            marginBottom: 10,
            backgroundColor: '#FFF4EE',
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: '#FF7F50',
              marginBottom: 3,
            }}
          >
            🎧 고객센터 문의 내역
          </Text>
          <Text style={{ fontSize: 12, color: '#777' }}>
            문의를 남기면 순차적으로 확인 후 답변드릴게요.
          </Text>
        </View>

        {isLoading ? (
          <View style={{ marginTop: 24, alignItems: 'center', flex: 1 }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10, color: '#777' }}>
              문의 목록을 불러오는 중...
            </Text>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            renderItem={renderTicketItem}
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
                <Text style={{ color: '#777' }}>등록된 문의가 없습니다.</Text>
              </View>
            }
          />
        )}

        <BackToMenuBtn onPress={() => setAppMode('HOME')} />
      </View>
    </SafeAreaView>
  );
}