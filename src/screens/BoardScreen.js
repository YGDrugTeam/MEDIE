// BoardScreen
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

import { styles } from '../styles/commonStyles';
// const BOARD_API_BASE = 'https://medichubs-backend.azurewebsites.net';
const BOARD_API_BASE = 'http://20.106.40.121';

export default function BoardScreen({ post, onBack }) {
  const [detail, setDetail] = useState(post || null);
  const [isLoading, setIsLoading] = useState(!post?.id);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBoardDetail = useCallback(async () => {
    if (!post?.id) {
      console.log('❌ post.id 없음:', post);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const url = `${BOARD_API_BASE}/boards/${post.id}`;
      console.log('상세조회 요청 URL =', url);
      console.log('상세조회 post.id =', post.id);

      const res = await fetch(url);
      const data = await res.json();

      console.log('상세조회 status =', res.status);
      console.log('상세조회 data =', data);

      if (!res.ok) {
        throw new Error(data?.detail || '게시글 조회 실패');
      }

      setDetail(data);
    } catch (e) {
      console.error('❌ fetchBoardDetail 실패:', e);
      Alert.alert('오류', e.message || '게시글 상세를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  useEffect(() => {
    fetchBoardDetail();
  }, [fetchBoardDetail]);

  const handleDelete = async () => {
    if (!detail?.id || isDeleting) return;

    Alert.alert('삭제 확인', '이 게시글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);

            const url = `${BOARD_API_BASE}/boards/${detail.id}`;
            console.log('삭제 요청 URL =', url);

            const res = await fetch(url, {
              method: 'DELETE',
            });

            const data = await res.json();

            console.log('삭제 status =', res.status);
            console.log('삭제 data =', data);

            if (!res.ok) {
              throw new Error(data?.detail || '게시글 삭제 실패');
            }

            Alert.alert('완료', '게시글이 삭제되었습니다.', [
              { text: '확인', onPress: onBack },
            ]);
          } catch (e) {
            console.error('❌ deleteBoard 실패:', e);
            Alert.alert('오류', e.message || '게시글 삭제에 실패했습니다.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.subContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12, color: '#777' }}>
            게시글을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.subContainer, { justifyContent: 'center' }]}>
          <Text style={{ fontSize: 16, color: '#555', textAlign: 'center' }}>
            게시글 정보를 불러올 수 없습니다.
          </Text>

          <TouchableOpacity
            onPress={onBack}
            style={{
              marginTop: 20,
              backgroundColor: '#FF7F50',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>뒤로가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const boardTypeLabelMap = {
  free: '자유게시판',
  med_question: '복약질문',
  review: '복용후기',
  notice: '공지사항',
};
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>
        {boardTypeLabelMap[detail?.boardType] || '게시판'}
      </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: '#eee',
              marginTop: 14,
            }}
          >
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
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f1f1',
              }}
            >
              <Text style={{ fontSize: 13, color: '#666' }}>
                작성자: {detail.author}
              </Text>
              <Text style={{ fontSize: 13, color: '#999' }}>
                {detail.created_at ? detail.created_at.slice(0, 10) : ''}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 13, color: '#888' }}>
                조회수: {detail.views ?? 0}
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
              {isDeleting ? '삭제 중...' : '게시글 삭제'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBack}
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