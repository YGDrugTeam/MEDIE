import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const BOARD_API_BASE = 'http://20.106.40.121';

const COLORS = {
  background: '#FFFFFF',
  primary: '#065809',
  primaryDark: '#006E07',
  secondary: '#67A369',
  warm: '#FFFDE7',
  muted: '#8C8C8C',
  border: '#C8D8B5',
  cardBg: '#FFFFFF',
  danger: '#E45A4F',
};

export default function BoardScreen({
  post,
  onBack,
  setAppMode,
  onEditBoard,
  currentUserName = '',
}) {
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

      const res = await fetch(url);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('상세조회 응답 원문:', text);
        throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
      }

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

  const isMine = useMemo(() => {
    if (!currentUserName || !detail?.author) return false;
    return String(currentUserName).trim() === String(detail.author).trim();
  }, [currentUserName, detail?.author]);

  // 📍 [수정] 서버 데이터(board_type 등)와 정확히 매칭되도록 보강
  const boardTypeLabelMap = {
    free: '자유수다',
    med_question: '복약질문',  // ← 추가
    qna: '복약질문',
    question: '복약질문',
    review: '복용후기',
    hospital: '복용후기',
    notice: '공지사항',
    support: '고객센터',
  };

  const currentType = detail?.board_type || detail?.boardType || post?.boardType;
  const boardLabel = boardTypeLabelMap[currentType] || '커뮤니티';

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
            const res = await fetch(url, { method: 'DELETE' });
            const text = await res.text();

            let data;
            try {
              data = JSON.parse(text);
            } catch (err) {
              console.error('삭제 응답 원문:', text);
              throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
            }

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

  const handleEdit = () => {
    if (typeof onEditBoard === 'function') {
      onEditBoard(detail);
      return;
    }
    Alert.alert('안내', '수정 화면 연결이 필요합니다.');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
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

          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={COLORS.primaryDark} />
            <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
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
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
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

          <View style={styles.centerLoading}>
            <Text style={styles.emptyText}>게시글 정보를 불러올 수 없습니다.</Text>
            <TouchableOpacity onPress={onBack} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>목록으로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{boardLabel}</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.title}>{detail.title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>작성자 {detail.author || '작성자 없음'}</Text>
              <Text style={styles.metaText}>
                {detail.created_at ? detail.created_at.slice(0, 10) : ''}
              </Text>
            </View>

            {isMine ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onEditBoard(detail)}
                  style={styles.editBtn}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.primaryDark}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.editBtnText}>수정</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleDelete}
                  disabled={isDeleting}
                  style={[styles.deleteBtn, isDeleting && { opacity: 0.7 }]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.deleteBtnText}>
                    {isDeleting ? '삭제 중...' : '삭제'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={16} color="#A9C68A" />
                <Text style={styles.statText}>{detail.views ?? 0}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color="#B9D49D" />
                <Text style={styles.statText}>{detail.likes ?? 0}</Text>
              </View>
            </View>

            <View style={styles.contentDivider} />

            <Text style={styles.contentText}>
              {detail.content || '내용이 없습니다.'}
            </Text>
          </View>

          {isMine ? (
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={COLORS.primaryDark}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.editBtnText}>수정</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                style={[styles.deleteBtn, isDeleting && { opacity: 0.7 }]}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.deleteBtnText}>
                  {isDeleting ? '삭제 중...' : '삭제'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity onPress={onBack} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>목록으로</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  header: {
    height: 64, // 마이페이지 규격과 동일하게 맞춤
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    zIndex: 1, // 📍 헤더가 전체 레이어 위로 오게 함
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
    zIndex: -1, // 📍 텍스트를 버튼보다 '뒤'로 보내서 터치를 방해하지 않게 함
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    // zIndex를 설정하지 않아도 Title이 -1이라서 잘 눌립니다!
  },
  scanButton: {
    position: 'absolute',
    right: 0,
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    zIndex: 2,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 140,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF4E3',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

  detailCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 18,
  },

  editBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#F3F8EE',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DCE8C8',
  },

  editBtnText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },

  deleteBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#E45A4F',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
    lineHeight: 36,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metaText: {
    fontSize: 13,
    color: '#7D8A75',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#7A8E6F',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#D9E7D0',
    marginHorizontal: 12,
  },
  contentDivider: {
    height: 1,
    backgroundColor: '#EEF3E9',
    marginBottom: 18,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#335033',
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  editBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#F3F8EE',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DCE8C8',
  },
  editBtnText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  deleteBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  secondaryBtn: {
    marginTop: 14,
    backgroundColor: '#065809',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});