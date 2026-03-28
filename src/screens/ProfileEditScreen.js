import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, SafeAreaView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ProfileEditScreen({ user, onBack }) {
    // 배경으로 보여줄 더미 상태 (수정은 안 되게 처리)
    const [nickname] = useState(user?.name || "Jibong");
    const [profileImage] = useState(user?.profileImage || null);
    const [dogImage] = useState(user?.dogImage || null);

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. 상단 헤더 (배경으로 깔림) */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitleText}>정보 수정</Text>
                </View>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="close" size={30} color="#67A369" />
                </TouchableOpacity>
                <View style={styles.saveBtnDisabled}>
                    <Text style={styles.saveTextDisabled}>저장</Text>
                </View>
            </View>

            {/* 2. 메인 컨텐츠 영역 (스크롤 막음) */}
            <ScrollView contentContainerStyle={styles.content} scrollEnabled={false}>
                {/* 나의 프로필 사진 */}
                <View style={styles.section}>
                    <Text style={styles.inputLabel}>나의 프로필 사진</Text>
                    <View style={styles.profileImageContainer}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImg} />
                        ) : (
                            <View style={styles.placeholderProfileImg}>
                                <Ionicons name="person" size={50} color="#fff" />
                            </View>
                        )}
                        <View style={styles.cameraBadge}><Ionicons name="camera" size={16} color="#fff" /></View>
                    </View>
                </View>

                {/* 닉네임 입력 */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>닉네임</Text>
                    <View style={styles.inputPlaceholder}>
                        <Text style={styles.inputText}>{nickname}</Text>
                    </View>
                </View>

                {/* 매디멍 친구 등록 */}
                <View style={styles.dogSection}>
                    <Text style={styles.inputLabel}>나의 AI 매디멍 친구 등록</Text>
                    <Text style={styles.dogSubLabel}>사용자님의 반려견 사진을 등록해보세요! AI 에이전트의 모습이 바뀝니다.</Text>
                    <View style={styles.dogImageContainer}>
                        <View style={styles.placeholderDogImg}>
                            <Text style={styles.placeholderDogEmoji}>🐶</Text>
                            <Text style={styles.placeholderDogText}>반려견 사진 등록하기</Text>
                            <Ionicons name="add-circle" size={24} color="#67A369" style={{ marginTop: 8 }} />
                        </View>
                        <View style={styles.cameraBadge}><Ionicons name="camera" size={16} color="#fff" /></View>
                    </View>
                </View>
            </ScrollView>

            {/* 📍 3. 투명 녹색 막 오버레이 (핵심 포인트) */}
            <View style={styles.overlay}>
                <View style={styles.readyCard}>
                    <Text style={styles.emoji}>🚧</Text>
                    <Text style={styles.readyTitle}>해당 페이지는 준비 중입니다 :)</Text>
                    <Text style={styles.readySub}>
                        사용자님의 반려견을 등록하는 기능을{"\n"}
                        열심히 준비하고 있어요. 조금만 기다려주세요!
                    </Text>
                    <TouchableOpacity style={styles.confirmBtn} onPress={onBack}>
                        <Text style={styles.confirmBtnText}>돌아가기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitleContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1 },
    headerTitleText: { fontSize: 20, fontWeight: '800', color: '#065809' },
    backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    saveBtnDisabled: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 12 },
    saveTextDisabled: { color: '#aaa', fontWeight: '800', fontSize: 16 },

    content: { padding: 25, alignItems: 'center', paddingBottom: 100 },
    section: { width: '100%', alignItems: 'center', marginBottom: 35 },
    profileImageContainer: { width: 130, height: 130 },
    profileImg: { width: 130, height: 130, borderRadius: 65, borderWidth: 2, borderColor: '#67A369' },
    placeholderProfileImg: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#DCE7D1', justifyContent: 'center', alignItems: 'center' },
    cameraBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#67A369', padding: 8, borderRadius: 20 },

    inputSection: { width: '100%', marginBottom: 35 },
    inputLabel: { fontSize: 17, fontWeight: '800', color: '#065809', marginBottom: 12 },
    inputPlaceholder: { backgroundColor: '#F9FAF9', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 15, borderWidth: 1, borderColor: '#eee' },
    inputText: { fontSize: 16, color: '#333' },

    dogSection: { width: '100%', alignItems: 'center' },
    dogSubLabel: { fontSize: 13, color: '#67A369', marginBottom: 20, marginTop: -8, textAlign: 'center', lineHeight: 18 },
    dogImageContainer: { width: width * 0.7, height: width * 0.7 * 0.75, borderRadius: 25, borderWidth: 2, borderColor: '#eee', overflow: 'hidden' },
    placeholderDogImg: { width: '100%', height: '100%', backgroundColor: '#F7FAF5', justifyContent: 'center', alignItems: 'center' },
    placeholderDogEmoji: { fontSize: 50, marginBottom: 10 },
    placeholderDogText: { fontSize: 16, fontWeight: '700', color: '#4A5E43' },

    // 📍 오버레이 스타일 (투명 초록 막)
    overlay: {
        position: 'absolute',
        top: 64, // 헤더 높이 제외
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(6, 88, 9, 0.5)', // 투명한 초록색 (primary 컬러 기준)
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    readyCard: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    emoji: { fontSize: 50, marginBottom: 20 },
    readyTitle: { fontSize: 19, fontWeight: '800', color: '#065809', marginBottom: 12, textAlign: 'center' },
    readySub: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
    confirmBtn: { backgroundColor: '#065809', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 15 },
    confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});