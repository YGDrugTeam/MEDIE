import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    ActivityIndicator,
    Dimensions,
    Alert,
    Keyboard,
    Platform,
} from 'react-native';
import * as Speech from 'expo-speech';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// ✅ 절대경로 말고 상대경로로 수정
import MEDIEMUNG_IMG from '../../assets/mediemung.png';

export const MedieChatView = ({
    appMode,
    setAppMode,
    onCompleteNextDose,
    onChangeAlarmTime,
    myPills = [],
}) => {
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [bubbleText, setBubbleText] = useState('');
    const [showBubble, setShowBubble] = useState(false);

    // ✅ 키보드 상태 추가
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const bubbleOpacity = useRef(new Animated.Value(0)).current;
    const bubbleScale = useRef(new Animated.Value(0.8)).current;
    const dotAnim1 = useRef(new Animated.Value(0)).current;
    const dotAnim2 = useRef(new Animated.Value(0)).current;
    const dotAnim3 = useRef(new Animated.Value(0)).current;

    const isThinkingRef = useRef(false);
    const isChatOpenRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const sendTimerRef = useRef(null);

    useEffect(() => {
        isThinkingRef.current = isThinking;
    }, [isThinking]);

    // ✅ 키보드 이벤트
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates?.height || 0);
            setIsKeyboardVisible(true);
        });

        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // ✅ 하단바 위 기본 위치 + 키보드 대응
    // 하단바 높이(약 60) + 여유값
    const baseBottom = Platform.OS === 'ios' ? 92 : 84;
    const dynamicBottom = isKeyboardVisible
        ? keyboardHeight + 14
        : baseBottom;

    // ✅ bubble / confirm box도 같이 따라오게
    const bubbleBottom = dynamicBottom + 96;
    const confirmBottom = dynamicBottom + 106;

    const showBubbleText = (text) => {
        setBubbleText(text);
        setShowBubble(true);

        Animated.parallel([
            Animated.timing(bubbleOpacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.spring(bubbleScale, {
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideBubble = () => {
        Animated.parallel([
            Animated.timing(bubbleOpacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(bubbleScale, {
                toValue: 0.8,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowBubble(false);
            setBubbleText('');
        });
    };

    const startDotAnimation = () => {
        const animate = (dot, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: -6,
                        duration: 260,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 260,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animate(dotAnim1, 0);
        animate(dotAnim2, 120);
        animate(dotAnim3, 240);
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

    const speakMedie = (text) => {
        isSpeakingRef.current = true;
        setIsListening(false);
        showBubbleText(text);

        setTimeout(() => {
            ExpoSpeechRecognitionModule.stop();
            Speech.speak(text, {
                language: 'ko-KR',
                pitch: 1.08,
                rate: 0.98,
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
                },
            });
        }, 250);
    };

    useSpeechRecognitionEvent('result', (event) => {
        const transcript = event.results[0]?.transcript;
        if (!transcript || isThinkingRef.current || isSpeakingRef.current) return;

        if (
            !isChatOpenRef.current &&
            (transcript.includes('매디') || transcript.includes('메디'))
        ) {
            isChatOpenRef.current = true;
            speakMedie('네, 주인님! 부르셨나요? 멍!');
            return;
        }

        if (isChatOpenRef.current) {
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);

            sendTimerRef.current = setTimeout(() => {
                ExpoSpeechRecognitionModule.stop();
                setIsListening(false);
                askMedie(transcript);
            }, 1500);
        }
    });

    useSpeechRecognitionEvent('error', (event) => {
        if (event.error === 'no-speech') return;

        setIsListening(false);

        if (event.error === 'audio-capture') {
            setTimeout(() => {
                if (!isThinkingRef.current && !isSpeakingRef.current) {
                    startListeningInternal();
                }
            }, 1800);
        }
    });

    useSpeechRecognitionEvent('end', () => {
        setIsListening(false);
        if (!isThinkingRef.current && !isSpeakingRef.current) {
            setTimeout(() => startListeningInternal(), 300);
        }
    });

    const startListeningInternal = async () => {
        try {
            await ExpoSpeechRecognitionModule.start({
                lang: 'ko-KR',
                interimResults: true,
            });
            setIsListening(true);
        } catch (e) {
            if (!e.message?.includes('already')) {
                console.error('마이크 재시작 실패:', e);
            }
            setIsListening(false);
        }
    };

    const handleStartListening = async () => {
        try {
            const result =
                await ExpoSpeechRecognitionModule.requestPermissionsAsync();

            if (!result.granted) {
                Alert.alert('권한 거부', '마이크 권한이 필요합니다!');
                return;
            }

            await startListeningInternal();
        } catch (e) {
            console.error('마이크 시작 실패:', e);
        }
    };

    useEffect(() => {
        handleStartListening();

        return () => {
            ExpoSpeechRecognitionModule.stop();
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
        };
    }, []);

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

            if (data.target && data.target !== 'NONE' && data.target !== 'IDLE') {
                setTimeout(() => setAppMode(data.target), 400);
            }

            if (data.command === 'COMPLETE_DOSE') {
                if (onCompleteNextDose) await onCompleteNextDose();
            }

            if (data.command === 'SET_ALARM' && data.params?.time) {
                if (onChangeAlarmTime) {
                    const pillId = myPills[0]?.id || 'all';
                    await onChangeAlarmTime(pillId, data.params.time);
                }
            }

            if (data.show_confirmation) setShowConfirmButtons(true);

            speakMedie(data.reply);
        } catch (e) {
            console.error('서버 연결 실패:', e);
            speakMedie('서버와 연결할 수 없어요. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsThinking(false);
            isThinkingRef.current = false;
        }
    };

    const handleFloatingBtnPress = () => {
        if (isChatOpenRef.current) {
            if (isListening) {
                ExpoSpeechRecognitionModule.stop();
                setIsListening(false);
                isChatOpenRef.current = false;
                hideBubble();
            } else {
                startListeningInternal();
            }
        } else {
            isChatOpenRef.current = true;
            speakMedie('네! 말씀해주세요 멍!');
        }
    };

    return (
        <View style={styles.masterContainer} pointerEvents="box-none">
            {showBubble && (
                <Animated.View
                    style={[
                        styles.bubble,
                        {
                            bottom: bubbleBottom,
                            opacity: bubbleOpacity,
                            transform: [{ scale: bubbleScale }],
                        },
                    ]}
                >
                    {bubbleText === 'THINKING' ? (
                        <View style={styles.dotsContainer}>
                            <Animated.View
                                style={[styles.dot, { transform: [{ translateY: dotAnim1 }] }]}
                            />
                            <Animated.View
                                style={[styles.dot, { transform: [{ translateY: dotAnim2 }] }]}
                            />
                            <Animated.View
                                style={[styles.dot, { transform: [{ translateY: dotAnim3 }] }]}
                            />
                        </View>
                    ) : (
                        <Text style={styles.bubbleText} numberOfLines={3}>
                            {bubbleText}
                        </Text>
                    )}
                    <View style={styles.bubbleTail} />
                </Animated.View>
            )}

            {showConfirmButtons && (
                <View style={[styles.confirmBox, { bottom: confirmBottom }]}>
                    <Text style={styles.confirmTitle}>방금 약 드셨나요? 🐾</Text>
                    <View style={styles.confirmButtons}>
                        <TouchableOpacity
                            style={styles.yesBtn}
                            onPress={() => {
                                setShowConfirmButtons(false);
                                askMedie('응 먹었어!');
                            }}
                        >
                            <Text style={styles.btnText}>응, 먹었어! 💊</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.noBtn}
                            onPress={() => {
                                setShowConfirmButtons(false);
                                askMedie('아직 안 먹었어');
                            }}
                        >
                            <Text style={styles.btnText}>아직 안 먹었어</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.medieFloatingBtn,
                    { bottom: dynamicBottom },
                    isListening && styles.listeningBtn,
                ]}
                onPress={handleFloatingBtnPress}
                activeOpacity={0.92}
            >
                {isThinking ? (
                    <ActivityIndicator color="#67A369" size="small" />
                ) : (
                    <Image source={MEDIEMUNG_IMG} style={styles.medieIcon} />
                )}
                {isListening && <View style={styles.activeDot} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    masterContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },

    bubble: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 12,
        maxWidth: width * 0.58,
        minWidth: 96,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#DCE9DD',
        zIndex: 40,
    },

    bubbleTail: {
        position: 'absolute',
        bottom: -8,
        alignSelf: 'center',
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFFFFF',
    },

    bubbleText: {
        fontSize: 14,
        color: '#2F4F3E',
        lineHeight: 20,
        fontWeight: '500',
    },

    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
    },

    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#67A369',
        marginHorizontal: 3,
    },

    confirmBox: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        width: width * 0.74,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#DCE9DD',
        zIndex: 40,
    },

    confirmTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2F4F3E',
        marginBottom: 12,
        textAlign: 'center',
    },

    confirmButtons: {
        flexDirection: 'row',
    },

    yesBtn: {
        flex: 1,
        backgroundColor: '#67A369',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 4,
    },

    noBtn: {
        flex: 1,
        backgroundColor: '#A8B7A9',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginLeft: 4,
    },

    btnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },

    medieFloatingBtn: {
        position: 'absolute',
        left: '50%',
        marginLeft: -42,
        width: 84,
        height: 84,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 30,
    },

    listeningBtn: {
        transform: [{ scale: 1.04 }],
    },

    medieIcon: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },

    activeDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#67A369',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
});