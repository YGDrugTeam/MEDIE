import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileEditScreen({ user, onUpdateProfile, onBack }) {
    const [nickname, setNickname] = useState(user?.name || "");
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const [selectedDog, setSelectedDog] = useState(user?.dogType || 'default');

    const pickImage = async () => {
        // 권한 먼저 요청
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],   // ← 변경
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        onUpdateProfile({ nickname, profileImage, dogType: selectedDog });
        onBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
                <Text style={styles.headerTitle}>정보 수정</Text>
                <TouchableOpacity onPress={handleSave}><Text style={styles.saveText}>저장</Text></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* 프로필 사진 설정 */}
                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImg} />
                    ) : (
                        <View style={styles.placeholderImg}><Ionicons name="camera" size={30} color="#fff" /></View>
                    )}
                    <View style={styles.cameraBadge}><Ionicons name="pencil" size={14} color="#fff" /></View>
                </TouchableOpacity>

                {/* 닉네임 변경 */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>닉네임</Text>
                    <TextInput
                        style={styles.input}
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="닉네임을 입력하세요"
                    />
                </View>

                {/* 매디멍 사진 설정 */}
                <View style={styles.dogSection}>
                    <Text style={styles.inputLabel}>함께할 매디멍 친구</Text>
                    <View style={styles.dogGrid}>
                        {['default', 'happy', 'smart'].map((dog) => (
                            <TouchableOpacity
                                key={dog}
                                style={[styles.dogCard, selectedDog === dog && styles.selectedDog]}
                                onPress={() => setSelectedDog(dog)}
                            >
                                <Text style={{ fontSize: 30 }}>{dog === 'default' ? '🐶' : dog === 'happy' ? '🐕' : '🐩'}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    saveText: { color: '#065809', fontWeight: 'bold', fontSize: 16 },
    content: { padding: 25, alignItems: 'center' },
    imageContainer: { width: 120, height: 120, marginBottom: 30 },
    profileImg: { width: 120, height: 120, borderRadius: 60 },
    placeholderImg: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    cameraBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#67A369', padding: 6, borderRadius: 20 },
    inputSection: { width: '100%', marginBottom: 30 },
    inputLabel: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    input: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10, fontSize: 16 },
    dogSection: { width: '100%' },
    dogGrid: { flexDirection: 'row', gap: 15, marginTop: 10 },
    dogCard: { width: 70, height: 70, borderRadius: 15, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    selectedDog: { borderColor: '#67A369', backgroundColor: '#F7FBF4' }
});