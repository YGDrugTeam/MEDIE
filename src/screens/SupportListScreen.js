import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://20.106.40.121';

const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  primaryDark: '#044706',
  primaryLight: '#67A369',
  secondary: '#8BBC8E',
  soft: '#EEF7EE',
  softStrong: '#E4F1E4',
  border: '#D9E8D7',
  borderStrong: '#BFD6BC',
  inputBg: '#FAFCF8',
  cardBg: '#FFFFFF',
  text: '#222222',
  subText: '#6F786C',
  muted: '#9AA39A',
  grayBtn: '#F1F3EF',
  white: '#FFFFFF',
  danger: '#D9534F',
  dangerSoft: '#FDEEEE',
  answeredBg: '#EAF6EC',
  answeredText: '#2F7D45',
  closedBg: '#F1F3F1',
  closedText: '#6E756D',
};

export default function SupportListScreen({ post, onBack, setAppMode }) {
  const [detail, setDetail] = useState(post || null);
  const [isLoading, setIsLoading] = useState(!post?.id);
  const [isDeleting, setIsDeleting] = useState(false);

  const goSupportHome = useCallback(() => {
    if (typeof setAppMode === 'function') {
      setAppMode('SUPPORT');
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
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('문의 상세조회 응답 원문:', text);
        throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
      }

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

            const text = await res.text();

            let data;
            try {
              data = text ? JSON.parse(text) : {};
            } catch (err) {
              console.error('문의 삭제 응답 원문:', text);
              throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
            }

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
          backgroundColor: COLORS.soft,
          color: COLORS.primary,
        };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>문의 내용을 불러오는 중...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goSupportHome}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={30} color={COLORS.secondary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>고객센터</Text>

            <View style={{ width: 40 }} />
          </View>

          <View style={styles.emptyStateWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color={COLORS.primaryLight}
              />
            </View>

            <Text style={styles.emptyStateTitle}>
              문의 정보를 불러올 수 없어요
            </Text>
            <Text style={styles.emptyStateDesc}>
              잠시 후 다시 시도하거나 목록으로 돌아가 확인해봐.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={goSupportHome}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>목록으로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const statusChip = getStatusChipStyle(detail.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goSupportHome}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={30} color={COLORS.secondary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>고객센터</Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 상단 소개 */}
          <View style={styles.heroWrap}>
            <Text style={styles.heroTitle}>문의 상세 내역</Text>
            <Text style={styles.heroSubText}>
              접수된 문의와 답변 상태를 확인할 수 있어.
            </Text>
          </View>

          {/* 문의 카드 */}
          <View style={styles.detailCard}>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: statusChip.backgroundColor },
              ]}
            >
              <Text style={[styles.statusChipText, { color: statusChip.color }]}>
                {getStatusText(detail.status)}
              </Text>
            </View>

            <Text style={styles.detailTitle}>{detail.title}</Text>

            <View style={styles.metaSection}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>작성자</Text>
                <Text style={styles.metaValue}>{detail.author || '-'}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>작성일</Text>
                <Text style={styles.metaValue}>
                  {detail.created_at ? detail.created_at.slice(0, 10) : '-'}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>문의 유형</Text>
                <Text style={styles.metaValue}>
                  {getCategoryText(detail.category)}
                </Text>
              </View>
            </View>

            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{detail.content}</Text>
            </View>
          </View>

          {/* 답변 영역 */}
          {detail.answer ? (
            <View style={styles.answerCard}>
              <View style={styles.answerHeaderRow}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={COLORS.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.answerTitle}>관리자 답변</Text>
              </View>

              <Text style={styles.answerText}>{detail.answer}</Text>

              <View style={styles.answerMetaWrap}>
                {detail.answered_by ? (
                  <Text style={styles.answerMetaText}>
                    답변자: {detail.answered_by}
                  </Text>
                ) : null}

                {detail.answered_at ? (
                  <Text style={styles.answerMetaText}>
                    답변일: {detail.answered_at.slice(0, 10)}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.pendingCard}>
              <Ionicons
                name="time-outline"
                size={18}
                color={COLORS.primaryLight}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.pendingText}>
                아직 답변이 등록되지 않았어. 문의가 접수되면 순차적으로 답변드릴게.
              </Text>
            </View>
          )}

          {/* 버튼 */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDelete}
            disabled={isDeleting}
            style={[
              styles.deleteBtn,
              isDeleting && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.deleteBtnText}>
              {isDeleting ? '삭제 중...' : '문의 삭제'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goSupportHome}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>목록으로</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    marginBottom: 6,
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.subText,
    fontSize: 14,
  },

  heroWrap: {
    marginBottom: 16,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 34,
  },

  heroSubText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },

  detailCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },

  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 28,
  },

  metaSection: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  metaLabel: {
    fontSize: 13,
    color: COLORS.subText,
    fontWeight: '600',
  },

  metaValue: {
    fontSize: 13,
    color: COLORS.muted,
  },

  contentBox: {
    marginTop: 4,
  },

  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333333',
  },

  answerCard: {
    backgroundColor: COLORS.soft,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 14,
  },

  answerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  answerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },

  answerText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333333',
  },

  answerMetaWrap: {
    marginTop: 14,
  },

  answerMetaText: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 4,
  },

  pendingCard: {
    marginTop: 14,
    backgroundColor: COLORS.soft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  pendingText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.subText,
    lineHeight: 22,
  },

  deleteBtn: {
    marginTop: 18,
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },

  deleteBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },

  secondaryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.grayBtn,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  secondaryBtnText: {
    color: '#444444',
    fontWeight: '700',
    fontSize: 15,
  },

  emptyStateWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },

  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },

  emptyStateDesc: {
    fontSize: 14,
    color: COLORS.subText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
});