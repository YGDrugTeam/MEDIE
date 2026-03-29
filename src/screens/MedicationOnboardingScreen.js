import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    background: '#FCFFF9',
    primary: '#065809',
    primaryDark: '#044706',
    primaryLight: '#67A369',
    secondary: '#8BBC8E',
    soft: '#EEF7EE',
    border: '#D9E8D7',
    text: '#222222',
    subText: '#6F786C',
    white: '#FFFFFF',
};

export default function MedicationOnboardingScreen({
    setAppMode,
    onSelectYes,
    onSelectNo,
}) {
    const translateY = useRef(new Animated.Value(36)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 650,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 650,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
        ]).start();
    }, [translateY, opacity, buttonOpacity]);

    const handleYes = () => {
        onSelectYes?.();
        setAppMode('SCAN');
    };

    const handleNo = () => {
        onSelectNo?.();
        setAppMode('HOME');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => setAppMode('HOME')}
                    style={{ alignSelf: 'flex-start', padding: 8, marginTop: 10 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="chevron-back" size={30} color={COLORS.primary} />
                </TouchableOpacity>

                <View style={styles.topSpace} />

                <Animated.View
                    style={[
                        styles.questionWrap,
                        {
                            opacity,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <View style={styles.iconWrap}>
                        <Ionicons name="medkit-outline" size={28} color={COLORS.primary} />
                    </View>

                    <Text style={styles.title}>드시고 계신 약이 있으신가요?</Text>
                    <Text style={styles.subText}>
                        처음 한 번만 확인할게요.
                        {'\n'}
                        복용 중인 약이 있다면 지금 바로 등록해둘 수 있어요.
                    </Text>
                </Animated.View>

                <Animated.View style={[styles.buttonArea, { opacity: buttonOpacity }]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleYes}
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>예, 있어요</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleNo}
                        style={styles.secondaryButton}
                    >
                        <Text style={styles.secondaryButtonText}>아니요, 괜찮아요</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.bottomHintWrap}>
                    <Text style={styles.bottomHint}>
                        나중에 복용약 등록에서 다시 추가할 수 있어요.
                    </Text>
                </View>
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
        paddingHorizontal: 24,
        backgroundColor: COLORS.background,
    },
    topSpace: {
        flex: 0.8,
    },
    questionWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrap: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: COLORS.soft,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
    },
    title: {
        fontSize: 30,
        lineHeight: 38,
        fontWeight: '800',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 14,
    },
    subText: {
        fontSize: 15,
        lineHeight: 23,
        color: COLORS.subText,
        textAlign: 'center',
    },
    buttonArea: {
        marginTop: 42,
    },
    primaryButton: {
        height: 58,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '800',
    },
    secondaryButton: {
        height: 58,
        borderRadius: 18,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    bottomHintWrap: {
        marginTop: 'auto',
        paddingBottom: 34,
    },
    bottomHint: {
        fontSize: 13,
        color: COLORS.subText,
        textAlign: 'center',
    },
});