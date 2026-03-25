import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from "react-native";

import { Ionicons } from '@expo/vector-icons';

export default function MyPageScreen({
    user,
    myPills = [],
    pillAlarms = [],
    myPosts = [],
    onBack,
    onNavigate,
    onLogout,
}) {
    const nickname =
        user?.nickname || user?.name || user?.username || "MEDI 사용자";

    const intro =
        user?.email || "오늘도 건강한 복약 습관을 함께 만들어요";

    const statCards = [
        {
            label: "내 복용약",
            value: Array.isArray(myPills) ? myPills.length : 0,
            sub: "등록된 약",
        },
        {
            label: "알람",
            value: Array.isArray(pillAlarms) ? pillAlarms.length : 0,
            sub: "설정된 개수",
        },
        {
            label: "게시글",
            value: Array.isArray(myPosts) ? myPosts.length : 0,
            sub: "작성한 글",
        },
    ];

    const menuItems = [
        {
            title: "내 정보 관리",
            desc: "프로필과 기본 정보를 확인해요",
            onPress: () => onNavigate?.("PROFILE_EDIT"),
        },
        {
            title: "복용 기록 보기",
            desc: "오늘/이번 주 복용 기록을 확인해요",
            onPress: () => onNavigate?.("HISTORY"),
        },
        {
            title: "알람 관리",
            desc: "복약 알람 시간을 수정해요",
            onPress: () => onNavigate?.("ALARM"),
        },
        {
            title: "고객센터",
            desc: "문의 및 도움말을 확인해요",
            onPress: () => onNavigate?.("SUPPORT"),
        },
        {
            title: "앱 정보",
            desc: "서비스 소개와 팀 정보를 확인해요",
            onPress: () => { },
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onBack}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={34} color="#67A369" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>마이페이지</Text>

                <View style={styles.headerRightPlaceholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 프로필 카드 */}
                <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                        <Text style={styles.profileAvatarText}>
                            {nickname?.slice(0, 1) || "M"}
                        </Text>
                    </View>

                    <View style={styles.profileTextBox}>
                        <Text style={styles.profileName}>{nickname}</Text>
                        <Text style={styles.profileIntro}>{intro}</Text>
                    </View>
                </View>

                {/* 활동 요약 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>내 활동</Text>

                    <View style={styles.statsRow}>
                        {statCards.map((item) => (
                            <View key={item.label} style={styles.statCard}>
                                <Text style={styles.statValue}>{item.value}</Text>
                                <Text style={styles.statLabel}>{item.label}</Text>
                                <Text style={styles.statSub}>{item.sub}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 빠른 메뉴 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>메뉴</Text>

                    <View style={styles.menuList}>
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.title}
                                style={styles.menuItem}
                                onPress={item.onPress}
                                activeOpacity={0.85}
                            >
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuDesc}>{item.desc}</Text>
                                </View>
                                <Text style={styles.menuArrow}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 로그아웃 버튼 */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => onLogout?.()}
                    activeOpacity={0.85}
                >
                    <Text style={styles.logoutButtonText}>로그아웃</Text>
                </TouchableOpacity>

                {/* footer */}
                <View style={styles.footerCard}>
                    <Text style={styles.footerBrand}>care-flow</Text>
                    <Text style={styles.footerText}>서울 공덕 창업 허브</Text>
                    <Text style={styles.footerText}>© 2026 care-flow. All rights reserved.</Text>
                </View>
            </ScrollView>

            {/* 하단 탭바 */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    onPress={() => onNavigate?.('HOME')}
                    style={styles.bottomTabItem}
                >
                    <Ionicons name="home" size={28} color="#67A369" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onNavigate?.('MAP')}
                    style={styles.bottomTabItem}
                >
                    <Ionicons name="location" size={28} color="#67A369" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onNavigate?.('SEARCH_PILL')}
                    style={styles.bottomTabItem}
                >
                    <Ionicons name="search" size={28} color="#67A369" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onNavigate?.('COMMUNITY')}
                    style={styles.bottomTabItem}
                >
                    <Ionicons name="chatbubble-ellipses" size={28} color="#67A369" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onNavigate?.('MY_PAGE')}
                    style={styles.bottomTabItem}
                >
                    <Ionicons name="person" size={28} color="#065809" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    header: {
        height: 64,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
    },

    backBtn: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },

    backBtnText: {
        fontSize: 28,
        color: "#8C8C8C",
        marginTop: -2,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#065809",
    },

    headerRightPlaceholder: {
        width: 36,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 120,
    },

    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFDE7",
        borderWidth: 1,
        borderColor: "#C8D8B5",
        borderRadius: 22,
        padding: 18,
        marginBottom: 22,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },

    profileAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#67A369",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    profileAvatarText: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "800",
    },

    profileTextBox: {
        flex: 1,
    },

    profileName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#065809",
        marginBottom: 6,
    },

    profileIntro: {
        fontSize: 13,
        lineHeight: 20,
        color: "#6F6F6F",
    },

    section: {
        marginBottom: 22,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#065809",
        marginBottom: 12,
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    statCard: {
        width: "31.5%",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#DCE7D1",
        paddingVertical: 18,
        paddingHorizontal: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },

    statValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#065809",
        marginBottom: 6,
    },

    statLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#065809",
        marginBottom: 4,
    },

    statSub: {
        fontSize: 11,
        color: "#8C8C8C",
    },

    menuList: {
        gap: 10,
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DCE7D1",
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },

    menuTextWrap: {
        flex: 1,
        paddingRight: 12,
    },

    menuTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#065809",
        marginBottom: 4,
    },

    menuDesc: {
        fontSize: 12,
        lineHeight: 18,
        color: "#8C8C8C",
    },

    menuArrow: {
        fontSize: 22,
        color: "#67A369",
        fontWeight: "600",
    },

    logoutButton: {
        marginTop: 8,
        marginBottom: 16,
        height: 50,
        borderRadius: 16,
        backgroundColor: "#065809",
        alignItems: "center",
        justifyContent: "center",
    },

    logoutButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    footerCard: {
        backgroundColor: "#F8FAF5",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E3ECD9",
        paddingVertical: 18,
        paddingHorizontal: 16,
        alignItems: "center",
    },

    footerBrand: {
        fontSize: 16,
        fontWeight: "800",
        color: "#065809",
        marginBottom: 6,
    },

    footerText: {
        fontSize: 12,
        color: "#8C8C8C",
        marginBottom: 4,
        textAlign: "center",
    },

    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 60,
        backgroundColor: '#FFFDE7',
        borderTopWidth: 1,
        borderTopColor: '#DCE8C8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    bottomTabItem: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
});