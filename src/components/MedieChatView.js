import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image,
    Animated, ActivityIndicator, Dimensions, Alert
} from 'react-native';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

const { width } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const MedieChatView = ({ appMode, setAppMode, onCompleteNextDose, onChangeAlarmTime, myPills = [] }) => {
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [bubbleText, setBubbleText] = useState('');
    const [showBubble, setShowBubble] = useState(false);

    // 애니메이션
    const bubbleOpacity = useRef(new Animated.Value(0)).current;
    const bubbleScale = useRef(new Animated.Value(0.8)).current;
    const dotAnim1 = useRef(new Animated.Value(0)).current;
    const dotAnim2 = useRef(new Animated.Value(0)).current;
    const dotAnim3 = useRef(new Animated.Value(0)).current;

    const isThinkingRef = useRef(false);
    const isChatOpenRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const sendTimerRef = useRef(null);

    useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);

    // 말풍선 표시
    const showBubbleText = (text) => {
        setBubbleText(text);
        setShowBubble(true);
        Animated.parallel([
            Animated.timing(bubbleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.spring(bubbleScale, { toValue: 1, useNativeDriver: true })
        ]).start();
    };

    const hideBubble = () => {
        Animated.parallel([
            Animated.timing(bubbleOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(bubbleScale, { toValue: 0.8, duration: 200, useNativeDriver: true })
        ]).start(() => {
            setShowBubble(false);
            setBubbleText('');
        });
    };

    // 생각중 점 애니메이션
    const startDotAnimation = () => {
        const animate = (dot, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
                ])
            ).start();
        };
        animate(dotAnim1, 0);
        animate(dotAnim2, 150);
        animate(dotAnim3, 300);
    };

    const stopDotAnimation = () => {
        dotAnim1.stopAnimation();
        dotAnim2.stopAnimation();
        dotAnim3.stopAnimation();
        dotAnim1.setValue(0);
        dotAnim2.setValue(0);
        dotAnim3.setValue(0);
    };

    useEffect(() => {
        if (isThinking) {
            showBubbleText('THINKING');
            startDotAnimation();
        } else {
            stopDotAnimation();
            if (!isSpeakingRef.current) hideBubble();
        }
    }, [isThinking]);

    // TTS
    const speakMedie = (text) => {
        isSpeakingRef.current = true;
        setIsListening(false);
        showBubbleText(text);

        setTimeout(() => {
            ExpoSpeechRecognitionModule.stop();
            Speech.speak(text, {
                language: 'ko-KR',
                pitch: 1.1,
                rate: 1.0,
                onDone: () => {
                    isSpeakingRef.current = false;
                    setTimeout(() => {
                        hideBubble();
                        if (!isThinkingRef.current) startListeningInternal();
                    }, 800);
                },
                onError: () => {
                    isSpeakingRef.current = false;
                    hideBubble();
                    if (!isThinkingRef.current) startListeningInternal();
                }
            });
        }, 300);
    };

    // 음성 인식
    useSpeechRecognitionEvent("result", (event) => {
        const transcript = event.results[0]?.transcript;
        if (!transcript || isThinkingRef.current || isSpeakingRef.current) return;

        console.log("인식:", transcript);

        // 호출어 감지
        if (!isChatOpenRef.current &&
            (transcript.includes("매디") || transcript.includes("메디"))) {
            console.log("🔔 호출어 감지!");
            isChatOpenRef.current = true;
            speakMedie("네, 주인님! 부르셨나요? 멍멍!");
            return;
        }

        // 채팅 열려있을 때 1.5초 후 전송
        if (isChatOpenRef.current) {
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
            sendTimerRef.current = setTimeout(() => {
                ExpoSpeechRecognitionModule.stop();
                setIsListening(false);
                askMedie(transcript);
            }, 1500);
        }
    });

    useSpeechRecognitionEvent("error", (event) => {
        if (event.error === "no-speech") return;
        console.log("음성인식 에러:", event.error);
        setIsListening(false);
        if (event.error === "audio-capture") {
            setTimeout(() => {
                if (!isThinkingRef.current && !isSpeakingRef.current) startListeningInternal();
            }, 2000);
        }
    });

    useSpeechRecognitionEvent("end", () => {
        setIsListening(false);
        if (!isThinkingRef.current && !isSpeakingRef.current) {
            setTimeout(() => startListeningInternal(), 300);
        }
    });

    const startListeningInternal = async () => {
        try {
            await ExpoSpeechRecognitionModule.start({ lang: "ko-KR", interimResults: true });
            setIsListening(true);
        } catch (e) {
            if (!e.message?.includes("already")) console.error("마이크 재시작 실패:", e);
            setIsListening(false);
        }
    };

    const handleStartListening = async () => {
        try {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!result.granted) {
                Alert.alert("권한 거부", "마이크 권한이 필요합니다!");
                return;
            }
            await startListeningInternal();
        } catch (e) {
            console.error("마이크 시작 실패:", e);
        }
    };

    useEffect(() => {
        handleStartListening();
        return () => {
            ExpoSpeechRecognitionModule.stop();
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
        };
    }, []);

    // 서버 통신
    const askMedie = async (userText) => {
        setIsThinking(true);
        isThinkingRef.current = true;

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, current_mode: appMode }),
            });

            const data = await response.json();
            console.log("서버 응답:", data);

            // 화면 이동
            if (data.target && data.target !== "NONE" && data.target !== "IDLE") {
                setTimeout(() => setAppMode(data.target), 500);
            }

            // 복약 완료
            if (data.command === "COMPLETE_DOSE") {
                if (onCompleteNextDose) await onCompleteNextDose();
            }

            // 알람 변경
            if (data.command === "SET_ALARM" && data.params?.time) {
                if (onChangeAlarmTime) {
                    const pillId = myPills[0]?.id || "all";
                    await onChangeAlarmTime(pillId, data.params.time);
                }
            }

            // 확인 버튼
            if (data.show_confirmation) setShowConfirmButtons(true);

            // TTS
            speakMedie(data.reply);

        } catch (e) {
            console.error("서버 연결 실패:", e);
            speakMedie("서버와 연결할 수 없어요. 잠시 후 다시 시도해주세요! 멍..");
        } finally {
            setIsThinking(false);
            isThinkingRef.current = false;
        }
    };

    // 플로팅 버튼 클릭
    const handleFloatingBtnPress = () => {
        if (isChatOpenRef.current) {
            // 이미 활성화 → 마이크 토글
            if (isListening) {
                ExpoSpeechRecognitionModule.stop();
                setIsListening(false);
                isChatOpenRef.current = false;
                hideBubble();
            } else {
                startListeningInternal();
            }
        } else {
            // 처음 누름 → 활성화
            isChatOpenRef.current = true;
            speakMedie("네! 말씀해주세요 멍!");
        }
    };

    return (
        <View style={styles.masterContainer} pointerEvents="box-none">

            {/* 말풍선 */}
            {showBubble && (
                <Animated.View style={[
                    styles.bubble,
                    { opacity: bubbleOpacity, transform: [{ scale: bubbleScale }] }
                ]}>
                    {bubbleText === 'THINKING' ? (
                        <View style={styles.dotsContainer}>
                            <Animated.View style={[styles.dot, { transform: [{ translateY: dotAnim1 }] }]} />
                            <Animated.View style={[styles.dot, { transform: [{ translateY: dotAnim2 }] }]} />
                            <Animated.View style={[styles.dot, { transform: [{ translateY: dotAnim3 }] }]} />
                        </View>
                    ) : (
                        <Text style={styles.bubbleText} numberOfLines={3}>{bubbleText}</Text>
                    )}
                    <View style={styles.bubbleTail} />
                </Animated.View>
            )}

            {/* 복약 확인 버튼 */}
            {showConfirmButtons && (
                <View style={styles.confirmBox}>
                    <Text style={styles.confirmTitle}>방금 약 드셨나요? 🐾</Text>
                    <View style={styles.confirmButtons}>
                        <TouchableOpacity style={styles.yesBtn} onPress={() => {
                            setShowConfirmButtons(false);
                            askMedie("응 먹었어!");
                        }}>
                            <Text style={styles.btnText}>응, 먹었어! 💊</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.noBtn} onPress={() => {
                            setShowConfirmButtons(false);
                            askMedie("아직 안 먹었어");
                        }}>
                            <Text style={styles.btnText}>아직 안 먹었어</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* 매디 플로팅 버튼 */}
            <TouchableOpacity
                style={[styles.medieFloatingBtn, isListening && styles.listeningBtn]}
                onPress={handleFloatingBtnPress}
            >
                {isThinking ? (
                    <ActivityIndicator color="#FF7F50" size="large" />
                ) : (
                    <Image
                        source={require('../../assets/medie-dog.png')}
                        style={[styles.medieIcon, isListening && { opacity: 0.7 }]}
                    />
                )}
                {isListening && <View style={styles.activeDot} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    masterContainer: { ...StyleSheet.absoluteFillObject, zIndex: 999 },

    // 말풍선
    bubble: {
        position: 'absolute',
        bottom: 125,
        right: 110,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 14,
        maxWidth: width * 0.6,
        minWidth: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1.5,
        borderColor: '#FF7F50',
    },
    bubbleTail: {
        position: 'absolute',
        bottom: -10,
        right: 20,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FF7F50',
    },
    bubbleText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        fontWeight: '500',
    },

    // 생각중 점
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF7F50',
    },

    // 확인 버튼
    confirmBox: {
        position: 'absolute',
        bottom: 130,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        width: width * 0.75,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1.5,
        borderColor: '#FF7F50',
    },
    confirmTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    confirmButtons: { flexDirection: 'row', gap: 8 },
    yesBtn: {
        flex: 1,
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    noBtn: {
        flex: 1,
        backgroundColor: '#aaa',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

    // 플로팅 버튼
    medieFloatingBtn: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 45,
        padding: 5,
        elevation: 8,
        borderWidth: 3,
        borderColor: '#FF7F50',
        width: 85,
        height: 85,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listeningBtn: { borderColor: '#4CAF50', transform: [{ scale: 1.1 }] },
    medieIcon: { width: 70, height: 70 },
    activeDot: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        borderWidth: 3,
        borderColor: '#FFF',
    },
});