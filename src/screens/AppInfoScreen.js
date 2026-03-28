import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    Dimensions,
    Animated,
    ScrollView,
    StatusBar,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
    primary: '#065809',
    secondary: '#67A369',
    background: '#FFFFFF',
    warm: '#FFFDE7',
    muted: '#8C8C8C',
    accent: '#D88B1D',
    border: '#DCE8C8',
};

// 📍 [수정] 팀원 정보 (아까 성공한 이미지 경로 그대로 유지)
const TEAM_MEMBERS = [
    {
        name: '조태민',
        role: 'Team Leader',
        task: 'Arduino SW Architecture & Programming',
        image: require('../../assets/Jo.jpeg')
    },
    {
        name: '배권혁',
        role: 'PM / DevOps',
        task: 'Backend API & Cloud Infrastructure',
        image: require('../../assets/Bae.jpg')
    },
    {
        name: '김건',
        role: 'Hardware Specialist',
        task: 'Arduino HW Design & Physical Prototyping',
        image: require('../../assets/Gun.jpeg')
    },
    {
        name: '이지현',
        role: 'AI Service Planner / UI',
        task: 'AI Agent 구현 & Service Design / Branding',
        image: require('../../assets/Lee.jpg')
    },
    {
        name: '김택수',
        role: 'Data Scientist',
        task: 'Data Labeling & Model Training Optimization',
        image: require('../../assets/taek.jpeg') // 📍 taek.jpeg 유지
    },
];

// ── 애니메이션 처리된 텍스트 컴포넌트 ──────────────────────────────────────────
const FadeInText = ({ children, style, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
        ]).start();
    }, [children]); 

    return (
        <Animated.Text style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {children}
        </Animated.Text>
    );
};

// ── 메인 컴포넌트 ────
export default function AppInfoScreen({ setAppMode }) {
    const [currentPage, setCurrentPage] = useState(0);

    const handleScrollEnd = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const page = Math.round(offsetY / height);
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <SafeAreaView style={styles.headerAbsolute}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setAppMode('MY_PAGE')} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={34} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                pagingEnabled 
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollEnd} 
                decelerationRate="fast"
            >

                <View style={[styles.page, { backgroundColor: COLORS.warm }]}>
                    <View style={styles.introContent}>

                        <Animated.Image
                            source={require('../../assets/MASCOT_IMG.png')} 
                            style={styles.logoImage}
                            resizeMode="cover"
                        />
                        <FadeInText style={styles.brandName}>care-flow</FadeInText>
                        <FadeInText style={styles.catchphrase} delay={300}>
                            "당신의 건강한 내일을 흐르게 합니다"
                        </FadeInText>
                        <View style={styles.descBox}>
                            <FadeInText style={styles.description} delay={600}>
                                care-flow는 AI 에이전트 '메디멍'과 IoT 약통을 결합하여,{'\n'}
                                복약 습관을 스스로 학습하고 보호자와 연결하는{'\n'}지능형 헬스케어 플랫폼입니다.
                            </FadeInText>
                        </View>
                    </View>
                    <View style={styles.scrollDownBadge}>
                        <Ionicons name="chevron-down" size={30} color={COLORS.secondary} />
                        <Text style={styles.scrollDownText}>스크롤하여 팀원 보기</Text>
                    </View>
                </View>

                {/* 👥 PAGE 2 ~ N: 팀원 소개 (한 명당 한 페이지씩 꽉 차게) */}
                {TEAM_MEMBERS.map((member, index) => (
                    <View key={index} style={[styles.page, { backgroundColor: '#FDFDFD' }]}>
                        <View style={styles.memberContent}>

                            {/* 📍 [수정] 완전 반응형 이미지 레이아웃 */}
                            <View style={styles.imageWrap}>
                                <Animated.Image
                                    source={member.image}
                                    style={styles.memberImageFull}
                                    resizeMode="cover"
                                />
                            </View>

                            {/* 정보 영역 */}
                            <View style={styles.memberInfoFull}>
                                <FadeInText style={styles.memberNameFull} delay={200}>{member.name}</FadeInText>
                                <FadeInText style={styles.memberRoleFull} delay={400}>{member.role}</FadeInText>
                                <View style={styles.taskBoxFull}>
                                    <FadeInText style={styles.memberTaskFull} delay={600}>{member.task}</FadeInText>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // 헤더 스타일 (화면 위에 둥둥 뜸)
    headerAbsolute: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    header: { height: 60, paddingHorizontal: 15, justifyContent: 'center' },
    backButton: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 25 },

    // 📍 페이지 스타일 (기기 높이만큼 꽉 채움)
    page: { width, height, justifyContent: 'center', alignItems: 'center' },

    // 서비스 소개 페이지 스타일
    introContent: { alignItems: 'center', paddingHorizontal: 30 },
    logoImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EEE', marginBottom: 25, elevation: 5 }, // 📍 이모지 Badge 스타일을 Image 스타일로 변경
    brandName: { fontSize: 40, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
    catchphrase: { fontSize: 17, fontWeight: '700', color: COLORS.secondary, marginTop: 12 },
    descBox: { marginTop: 30, padding: 20, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 25 },
    description: { fontSize: 14, color: '#333', textAlign: 'center', lineHeight: 22, fontWeight: '600' },
    scrollDownBadge: { position: 'absolute', bottom: 50, alignItems: 'center' },
    scrollDownText: { fontSize: 12, color: COLORS.secondary, marginTop: 5, fontWeight: '600' },

    // 👥 팀원 소개 페이지 스타일 (반응형 정밀 수정)
    memberContent: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: height * 0.1 }, // 상단 여백 비율 조절

    // 📍 [핵심] 사진 비율 고정 (너비 75%, 높이 50%)
    imageWrap: {
        width: width * 0.75,
        height: height * 0.5,
        borderRadius: 30,
        backgroundColor: '#EEE',
        marginBottom: height * 0.04,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 15,
        overflow: 'hidden', // 이미지가 튀어나오지 않게
    },
    memberImageFull: {
        width: '100%',
        height: '100%',
    },

    memberInfoFull: { alignItems: 'center', paddingHorizontal: 40, width: width * 0.8 },
    memberNameFull: { fontSize: 30, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
    memberRoleFull: { fontSize: 15, fontWeight: '700', color: COLORS.accent, marginBottom: 15 },

    taskBoxFull: { marginTop: 10, padding: 15, borderTopWidth: 1, borderTopColor: '#EEE', width: '100%' },
    memberTaskFull: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
});