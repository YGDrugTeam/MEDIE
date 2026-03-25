import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

import { styles } from '../styles/commonStyles';

const BOARD_API_BASE = 'https:/172.169.59.206';

export default function WriteBoardScreen({
  setAppMode,
  writeBoardType = 'free',
}) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentBoardType = writeBoardType || 'free';

  const boardTitle = useMemo(() => {
    switch (currentBoardType) {
      case 'review':
        return '복용후기 글쓰기';
      case 'question':
        return '질문게시판 글쓰기';
      case 'free':
      default:
        return '자유게시판 글쓰기';
    }
  }, [currentBoardType]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('입력 확인', '제목을 입력해주세요.');
      return;
    }

    if (!author.trim()) {
      Alert.alert('입력 확인', '작성자를 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('입력 확인', '내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
        boardType: currentBoardType,
      };

      console.log('게시글 등록 payload =', payload);

      const res = await fetch(`${BOARD_API_BASE}/boards/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('게시글 등록 응답 원문:', text);
        throw new Error('서버가 JSON이 아닌 응답을 반환했습니다.');
      }

      console.log('게시글 등록 status =', res.status);
      console.log('게시글 등록 data =', data);

      if (!res.ok) {
        const detailMessage =
          typeof data?.detail === 'string'
            ? data.detail
            : JSON.stringify(data?.detail || data);

        throw new Error(detailMessage || '게시글 등록 실패');
      }

      Alert.alert('완료', '게시글이 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => setAppMode('COMMUNITY'),
        },
      ]);
    } catch (e) {
      console.error('❌ createBoard 실패:', e);
      Alert.alert('오류', e.message || '게시글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>{boardTitle}</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#eee',
            }}
          >
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
              제목
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="제목을 입력하세요"
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#eee',
                color: '#111',
              }}
              placeholderTextColor="#999"
            />

            <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
              작성자
            </Text>
            <TextInput
              value={author}
              onChangeText={setAuthor}
              placeholder="작성자 이름"
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#eee',
                color: '#111',
              }}
              placeholderTextColor="#999"
            />

            <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
              내용
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="내용을 입력하세요"
              multiline
              textAlignVertical="top"
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                minHeight: 180,
                borderWidth: 1,
                borderColor: '#eee',
                color: '#111',
              }}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{
              marginTop: 18,
              backgroundColor: isSubmitting ? '#ccc' : '#FF7F50',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {isSubmitting ? '등록 중...' : '게시글 등록'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAppMode('COMMUNITY')}
            style={{
              marginTop: 12,
              backgroundColor: '#999',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              취소
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}