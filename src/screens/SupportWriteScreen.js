import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/commonStyles';

const API_BASE = 'http://20.106.40.121';

export default function SupportWriteScreen({ setAppMode }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goSupportHome = () => {
    setAppMode('SUPPORT'); // 네 고객센터 목록 화면 모드명으로 필요하면 수정
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || '문의 등록 실패');
      }

      Alert.alert('완료', '문의가 등록되었습니다.', [
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

  const CategoryButton = ({ value, label }) => {
    const selected = category === value;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setCategory(value)}
        style={{
          flex: 1,
          backgroundColor: selected ? '#FF7F50' : '#FFF4EC',
          borderWidth: 1,
          borderColor: selected ? '#FF7F50' : '#FFD7BF',
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: 'center',
          marginRight: value !== 'account' ? 8 : 0,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            color: selected ? '#fff' : '#C76B3A',
            fontWeight: '700',
            fontSize: 13,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

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
              문의 작성
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
              marginTop: 16,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#eee',
            }}
          >
            <View
              style={{
                backgroundColor: '#FFF8F3',
                borderRadius: 14,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#FFE2D1',
              }}
            >
              <Text style={{ fontSize: 13, color: '#A56B42', lineHeight: 21 }}>
                문의 내용을 남겨주시면 확인 후 답변드릴게요. 오류 신고나 계정 관련 문제도 여기서 접수할 수 있어요.
              </Text>
            </View>

            <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
              문의 유형
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
              <CategoryButton value="general" label="일반 문의" />
              <CategoryButton value="bug" label="오류 신고" />
              <CategoryButton value="account" label="계정 문의" />
            </View>

            <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
              제목
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="문의 제목을 입력하세요"
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
              placeholder="이름을 입력하세요"
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
              문의 내용
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="불편한 점이나 궁금한 내용을 자세히 적어주세요"
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
              {isSubmitting ? '등록 중...' : '문의 등록'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goSupportHome}
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