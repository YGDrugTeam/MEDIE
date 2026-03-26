import React, { useState } from 'react';
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
};

export default function SupportWriteScreen({ setAppMode }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  const goSupportHome = () => {
    setAppMode('SUPPORT');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('입력 확인', '문의 제목을 입력해주세요.');
      return;
    }

    if (!author.trim()) {
      Alert.alert('입력 확인', '작성자 이름을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('입력 확인', '문의 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE}/support/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
          category,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('문의 등록 응답 원문:', text);
        throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
      }

      if (!res.ok) {
        throw new Error(data?.detail || '문의 등록 실패');
      }

      Alert.alert('완료', '문의가 등록되었어요. 순차적으로 답변드릴게요.', [
        {
          text: '확인',
          onPress: goSupportHome,
        },
      ]);
    } catch (e) {
      console.error('❌ createSupportTicket 실패:', e);
      Alert.alert('오류', e.message || '문의 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CategoryButton = ({ value, label, icon }) => {
    const selected = category === value;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setCategory(value)}
        style={[
          styles.categoryBtn,
          selected && styles.categoryBtnSelected,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={selected ? '#fff' : COLORS.primary}
          style={{ marginBottom: 4 }}
        />

        <Text
          style={[
            styles.categoryBtnText,
            selected && styles.categoryBtnTextSelected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const getInputStyle = (fieldName, multiline = false) => [
    styles.input,
    multiline && styles.textArea,
    focusedField === fieldName && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>

          <Text style={styles.headerTitle}>고객센터</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goSupportHome}
          >
            <Ionicons name="list-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 상단 소개 */}
          <View style={styles.heroWrap}>
            <Text style={styles.heroTitle}>무엇을 도와드릴까요?</Text>
            <Text style={styles.heroSubText}>
              불편한 점이나 궁금한 내용을 남겨주면 순차적으로 답변드릴게요.
            </Text>
          </View>

          {/* 매디멍 안내 카드 */}
          <View style={styles.maddymungCard}>
            <View style={styles.maddymungIconWrap}>
              <Text style={styles.maddymungEmoji}>🐶</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.maddymungTitle}>매디멍이 도와줄게요!</Text>
              <Text style={styles.maddymungDesc}>
                오류 신고, 계정 문제, 일반 문의를 여기서 한 번에 남길 수 있습니다.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.voiceChip}
              onPress={() => Alert.alert('준비 중', '음성 문의 기능은 곧 연결될 예정이야!')}
            >
              <Ionicons name="mic" size={14} color="#fff" />
              <Text style={styles.voiceChipText}>음성</Text>
            </TouchableOpacity>
          </View>

          {/* 폼 카드 */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>문의 유형</Text>

            <View style={styles.categoryRow}>
              <CategoryButton
                value="general"
                label="일반 문의"
                icon="chatbubble-ellipses-outline"
              />

              <CategoryButton
                value="bug"
                label="오류 신고"
                icon="warning-outline"
              />

              <CategoryButton
                value="account"
                label="계정 문의"
                icon="person-outline"
              />
            </View>

            <Text style={styles.label}>제목</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="예: 복약 알림 시간이 이상해요"
              placeholderTextColor="#9AA39A"
              style={getInputStyle('title')}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
            />

            <Text style={styles.label}>작성자</Text>
            <TextInput
              value={author}
              onChangeText={setAuthor}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#9AA39A"
              style={getInputStyle('author')}
              onFocus={() => setFocusedField('author')}
              onBlur={() => setFocusedField(null)}
            />

            <Text style={styles.label}>문의 내용</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="어떤 상황에서 불편했는지 자세히 적어주세요"
              placeholderTextColor="#9AA39A"
              multiline
              textAlignVertical="top"
              style={getInputStyle('content', true)}
              onFocus={() => setFocusedField('content')}
              onBlur={() => setFocusedField(null)}
            />

            <View style={styles.tipBox}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#A56B42"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.tipText}>
                문의 내용이 구체적일수록 더 빠르게 도와줄 수 있습니다.
              </Text>
            </View>
          </View>

          {/* 버튼 */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[
              styles.primaryBtn,
              isSubmitting && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name="paper-plane-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.primaryBtnText}>
              {isSubmitting ? '등록 중...' : '문의 등록하기'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goSupportHome}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>취소</Text>
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
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

  maddymungCard: {
    backgroundColor: COLORS.soft,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  maddymungIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  maddymungEmoji: {
    fontSize: 24,
  },

  maddymungTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },

  maddymungDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.subText,
  },

  voiceChip: {
    marginLeft: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  voiceChipText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  formCard: {
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

  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F5F4A',
    marginBottom: 10,
  },

  categoryRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  categoryBtn: {
    flex: 1,
    backgroundColor: COLORS.soft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  categoryBtnSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },

  categoryEmoji: {
    fontSize: 15,
    marginBottom: 4,
  },

  categoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  categoryBtnTextSelected: {
    color: COLORS.white,
  },

  label: {
    fontSize: 14,
    color: '#4F5F4A',
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: '#111',
    marginBottom: 14,
  },

  textArea: {
    minHeight: 180,
  },

  inputFocused: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.white,
  },

  tipBox: {
    marginTop: 4,
    backgroundColor: COLORS.soft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.subText,
  },

  primaryBtn: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  primaryBtnText: {
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
    color: '#444',
    fontWeight: '700',
    fontSize: 15,
  },
});