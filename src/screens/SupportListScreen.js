import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/commonStyles';

const API_BASE = 'https://20.106.40.121';

export default function SupportListScreen({ post, onBack, setAppMode }) {
  const [detail, setDetail] = useState(post || null);
  const [isLoading, setIsLoading] = useState(!post?.id);
  const [isDeleting, setIsDeleting] = useState(false);

  const goSupportHome = useCallback(() => {
    if (typeof setAppMode === 'function') {
      setAppMode('SUPPORT'); // 네 고객센터 목록 화면 모드명으로 필요하면 수정
      return;
    }

    if (typeof onBack === 'function') {
      onBack();
    }
  }, [setAppMode, onBack]);

  const fetchSupportDetail = useCallback(async () => {
    if (!post?.id) {
      console.log('❌ post.id 없음:', post);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const url = `${API_BASE}/support/${post.id}`;
      console.log('문의 상세조회 요청 URL =', url);
      console.log('문의 상세조회 post.id =', post.id);

      const res = await fetch(url);
      const data = await res.json();

      console.log('문의 상세조회 status =', res.status);
      console.log('문의 상세조회 data =', data);

      if (!res.ok) {
        throw new Error(data?.detail || '문의 상세 조회 실패');
      }

      setDetail(data);
    } catch (e) {
      console.error('❌ fetchSupportDetail 실패:', e);
      Alert.alert('오류', e.message || '문의 상세를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  useEffect(() => {
    fetchSupportDetail();
  }, [fetchSupportDetail]);

  const handleDelete = async () => {
    if (!detail?.id || isDeleting) return;

    Alert.alert('문의 삭제', '이 문의를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);

            const url = `${API_BASE}/support/${detail.id}`;
            console.log('문의 삭제 요청 URL =', url);

            const res = await fetch(url, {
              method: 'DELETE',
            });

            const data = await res.json();

            console.log('문의 삭제 status =', res.status);
            console.log('문의 삭제 data =', data);

            if (!res.ok) {
              throw new Error(data?.detail || '문의 삭제 실패');
            }

            Alert.alert('완료', '문의가 삭제되었습니다.', [
              { text: '확인', onPress: goSupportHome },
            ]);
          } catch (e) {
            console.error('❌ deleteSupport 실패:', e);
            Alert.alert('오류', e.message || '문의 삭제에 실패했습니다.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
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

  const getCategoryText = (category) => {
    switch (category) {
      case 'bug':
        return '오류 신고';
      case 'account':
        return '계정 문의';
      case 'payment':
        return '결제 문의';
      default:
        return '일반 문의';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.subContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12, color: '#777' }}>
            문의 내용을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.subContainer, { justifyContent: 'center' }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={styles.mapHeader}>고객센터</Text>

            <TouchableOpacity
              onPress={goSupportHome}
              activeOpacity={0.8}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#FFF4EC',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#FFD7BF',
              }}
            >
              <Ionicons name="home-outline" size={22} color="#FF7F50" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 16, color: '#555', textAlign: 'center' }}>
            문의 정보를 불러올 수 없습니다.
          </Text>

          <TouchableOpacity
            onPress={goSupportHome}
            style={{
              marginTop: 20,
              backgroundColor: '#FF7F50',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>목록으로</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={styles.mapHeader}>고객센터</Text>
            <Text style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              문의 상세 내역
            </Text>
          </View>

          <TouchableOpacity
            onPress={goSupportHome}
            activeOpacity={0.8}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#FFF4EC',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FFD7BF',
            }}
          >
            <Ionicons name="home-outline" size={22} color="#FF7F50" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 18,
              padding: 18,
              borderWidth: 1,
              borderColor: '#eee',
              marginTop: 16,
            }}
          >
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor:
                  detail.status === 'ANSWERED'
                    ? '#E8F7EE'
                    : detail.status === 'CLOSED'
                    ? '#F1F1F1'
                    : '#FFF4EC',
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color:
                    detail.status === 'ANSWERED'
                      ? '#1F8B4C'
                      : detail.status === 'CLOSED'
                      ? '#666'
                      : '#FF7F50',
                }}
              >
                {getStatusText(detail.status)}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#222',
                marginBottom: 14,
              }}
            >
              {detail.title}
            </Text>

            <View
              style={{
                marginBottom: 14,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f1f1',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 13, color: '#666' }}>
                  작성자: {detail.author}
                </Text>
                <Text style={{ fontSize: 13, color: '#999' }}>
                  {detail.created_at ? detail.created_at.slice(0, 10) : ''}
                </Text>
              </View>

              <Text style={{ fontSize: 13, color: '#888' }}>
                문의 유형: {getCategoryText(detail.category)}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 15,
                lineHeight: 24,
                color: '#333',
              }}
            >
              {detail.content}
            </Text>
          </View>

          {detail.answer ? (
            <View
              style={{
                backgroundColor: '#F8FBFF',
                borderRadius: 18,
                padding: 18,
                borderWidth: 1,
                borderColor: '#DDEEFF',
                marginTop: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: '#2A5CAA',
                  marginBottom: 12,
                }}
              >
                관리자 답변
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 24,
                  color: '#333',
                }}
              >
                {detail.answer}
              </Text>

              <View style={{ marginTop: 14 }}>
                {detail.answered_by ? (
                  <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                    답변자: {detail.answered_by}
                  </Text>
                ) : null}

                {detail.answered_at ? (
                  <Text style={{ fontSize: 13, color: '#999' }}>
                    답변일: {detail.answered_at.slice(0, 10)}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View
              style={{
                marginTop: 14,
                backgroundColor: '#FFF9F4',
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: '#FFE6D6',
              }}
            >
              <Text style={{ fontSize: 14, color: '#A56B42', lineHeight: 22 }}>
                아직 답변이 등록되지 않았습니다. 문의가 접수되면 순차적으로 답변드릴게요.
              </Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDelete}
            disabled={isDeleting}
            style={{
              marginTop: 18,
              backgroundColor: isDeleting ? '#ccc' : '#E74C3C',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {isDeleting ? '삭제 중...' : '문의 삭제'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goSupportHome}
            style={{
              marginTop: 12,
              backgroundColor: '#FF7F50',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              목록으로
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}