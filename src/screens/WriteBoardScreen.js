import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
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
};

export default function WriteBoardScreen({
  setAppMode,
  writeBoardType,
  editingPost,
  onDone,
  onCancel,
  voiceDraft,
  onDraftUsed,
}) {
  const isEditMode = !!editingPost?.id;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentBoardType = writeBoardType || editingPost?.boardType || 'free';

  // ✅ 수정 모드일 때 기존 내용 채우기
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setAuthor(editingPost.author || '');
      setContent(editingPost.content || '');
    } else {
      setTitle('');
      setAuthor('');
      setContent('');
    }
  }, [editingPost]);

  // ✅ 매디 음성 초안 자동 입력
  useEffect(() => {
    if (voiceDraft) {
      setTitle(voiceDraft.title || '');
      setAuthor(voiceDraft.author || '');  // ← 추가
      setContent(voiceDraft.content || '');
      if (onDraftUsed) onDraftUsed();
    }
  }, [voiceDraft]);

  const boardTitle = useMemo(() => {
    const modeLabel = isEditMode ? '글 수정' : '글쓰기';
    switch (currentBoardType) {
      case 'review': return `복용후기 ${modeLabel}`;
      case 'question':
      case 'med_question': return `복약질문 ${modeLabel}`;
      case 'notice': return `공지사항 ${modeLabel}`;
      case 'free':
      default: return `자유수다 ${modeLabel}`;
    }
  }, [currentBoardType, isEditMode]);

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('입력 확인', '제목을 입력해주세요.'); return; }
    if (!author.trim()) { Alert.alert('입력 확인', '작성자를 입력해주세요.'); return; }
    if (!content.trim()) { Alert.alert('입력 확인', '내용을 입력해주세요.'); return; }

    try {
      setIsSubmitting(true);

      const normalizedBoardType =
        currentBoardType === 'question' ? 'med_question' :
          currentBoardType === 'qna' ? 'med_question' :
            currentBoardType;

      const payload = {
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
        boardType: normalizedBoardType,  // ← currentBoardType에서 교체
      };

      let res;
      let text;
      let data;

      if (isEditMode) {
        const updateUrl = `${BOARD_API_BASE}/boards/${editingPost.id}`;
        res = await fetch(updateUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        text = await res.text();

        if (!res.ok && [404, 405, 500].includes(res.status)) {
          res = await fetch(updateUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          text = await res.text();
        }
      } else {
        res = await fetch(`${BOARD_API_BASE}/boards/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        text = await res.text();
      }

      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
      }

      if (!res.ok) {
        const detailMessage =
          typeof data?.detail === 'string'
            ? data.detail
            : JSON.stringify(data?.detail || data);
        throw new Error(detailMessage || (isEditMode ? '게시글 수정 실패' : '게시글 등록 실패'));
      }

      Alert.alert('완료', isEditMode ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            if (typeof onDone === 'function') onDone(data);
            else setAppMode('COMMUNITY');
          },
        },
      ]);
    } catch (e) {
      console.error(isEditMode ? '❌ updateBoard 실패:' : '❌ createBoard 실패:', e);
      Alert.alert('오류', e.message || (isEditMode ? '게시글 수정에 실패했습니다.' : '게시글 등록에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (typeof onCancel === 'function') { onCancel(); return; }
    setAppMode('COMMUNITY');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>커뮤니티</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setAppMode('SCAN')} style={styles.scanButton}>
            <Ionicons name="camera-outline" size={18} color={COLORS.secondary} style={{ marginRight: 6 }} />
            <Text style={styles.scanButtonText}>약 스캔</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>{boardTitle}</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="제목을 입력하세요"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.label}>작성자</Text>
            <TextInput
              value={author}
              onChangeText={setAuthor}
              placeholder="작성자 이름"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.label}>내용</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="내용을 입력하세요"
              placeholderTextColor={COLORS.muted}
              multiline
              textAlignVertical="top"
              style={styles.textArea}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.primaryBtn, isSubmitting && { opacity: 0.7 }]}
          >
            <Text style={styles.primaryBtnText}>
              {isSubmitting
                ? isEditMode ? '수정 중...' : '등록 중...'
                : isEditMode ? '게시글 수정' : '게시글 등록'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={handleCancel} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>취소</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 6 },
  header: { height: 72, justifyContent: 'center', position: 'relative', marginBottom: 4 },
  backButton: { position: 'absolute', left: 0, top: 14, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  headerTitle: { position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center', fontSize: 30, fontWeight: '800', color: COLORS.primaryDark },
  scanButton: { position: 'absolute', right: 0, top: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: COLORS.secondary, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 10, zIndex: 2 },
  scanButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark },
  scrollContent: { paddingTop: 10, paddingBottom: 140 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 14 },
  formCard: { backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  label: { fontSize: 14, color: '#4F5F4A', fontWeight: '700', marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: '#F9FBF7', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: '#DFEADB', color: '#111', marginBottom: 12 },
  textArea: { backgroundColor: '#F9FBF7', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, minHeight: 200, borderWidth: 1, borderColor: '#DFEADB', color: '#111', marginBottom: 8 },
  primaryBtn: { marginTop: 18, backgroundColor: COLORS.secondary, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  secondaryBtn: { marginTop: 12, backgroundColor: '#065809', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  secondaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});