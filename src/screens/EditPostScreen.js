import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

export default function EditPostScreen({ setAppMode, post }) {
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>게시글 수정</Text>

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
                    style={styles.button}
                    onPress={() => setAppMode('BOARD')}
                >
                    <Text style={styles.buttonText}>수정 완료</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#006E07',
        marginBottom: 20,
    },
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
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
});