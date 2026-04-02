import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BOARD_API_BASE = 'http://20.106.40.121';

export default function EditPostScreen({ setAppMode, post }) {
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('알림', '제목과 내용을 입력해주세요.');
            return;
        }

        try {
            setIsSaving(true);
            const res = await fetch(`${BOARD_API_BASE}/boards/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });

            if (!res.ok) throw new Error('수정 실패');

            Alert.alert('완료', '게시글이 수정되었습니다.', [
                { text: '확인', onPress: () => setAppMode('COMMUNITY') },
            ]);
        } catch (e) {
            Alert.alert('오류', '수정에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => setAppMode('BOARD')}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="chevron-back" size={34} color="#67A369" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>게시글 수정</Text>
                <View style={{ width: 34 }} />
            </View>

            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="제목"
                />
                <TextInput
                    style={styles.textArea}
                    value={content}
                    onChangeText={setContent}
                    placeholder="내용"
                    multiline
                />
                <TouchableOpacity
                    style={[styles.button, isSaving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>수정 완료</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#006E07',
    },
    container: { flex: 1, padding: 20 },
    input: {
        borderWidth: 1,
        borderColor: '#C8D8B5',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        backgroundColor: '#FFFDE7',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#C8D8B5',
        borderRadius: 12,
        padding: 14,
        height: 180,
        backgroundColor: '#FFFDE7',
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#67A369',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});