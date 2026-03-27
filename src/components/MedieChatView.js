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
    PanResponder,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

const { width } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

import MEDIEMUNG_IMG from '../../assets/mediemung.png';

export const MedieChatView = ({
    appMode,
    setAppMode,
    onCompleteNextDose,
    onChangeAlarmTime,
    onToggleAlarm,
    onSearchDrug,
    onWritePost,
    myPills = [],
    pillHistory = [],
}) => {
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [bubbleText, setBubbleText] = useState('');
    const [showBubble, setShowBubble] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [chatHistory, setChatHistory] = useState([]);
    const isVisibleRef = useRef(true);


    const bubbleOpacity = useRef(new Animated.Value(0)).current;
    const bubbleScale = useRef(new Animated.Value(0.8)).current;
    const dotAnim1 = useRef(new Animated.Value(0)).current;
    const dotAnim2 = useRef(new Animated.Value(0)).current;
    const dotAnim3 = useRef(new Animated.Value(0)).current;

    const isThinkingRef = useRef(false);
    const isChatOpenRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const sendTimerRef = useRef(null);
    const playerRef = useRef(null);

    // ✅ 드래그용 ref
    const panRef = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                panRef.setOffset({
                    x: panRef.x._value,
                    y: panRef.y._value,
                });
                panRef.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: panRef.x, dy: panRef.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                panRef.flattenOffset();
            },
        })
    ).current;

    useEffect(() => {
        isThinkingRef.current = isThinking;
    }, [isThinking]);

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

    const baseBottom = Platform.OS === 'ios' ? 92 : 84;
    const dynamicBottom = isKeyboardVisible ? keyboardHeight + 14 : baseBottom;
    const bubbleBottom = dynamicBottom + 96;
    const confirmBottom = dynamicBottom + 106;

    const showBubbleText = (text) => {
        setBubbleText(text);
        setShowBubble(true);
        Animated.parallel([
            Animated.timing(bubbleOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.spring(bubbleScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    const hideBubble = () => {
        Animated.parallel([
            Animated.timing(bubbleOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(bubbleScale, { toValue: 0.8, duration: 180, useNativeDriver: true }),
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
                    Animated.timing(dot, { toValue: -6, duration: 260, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 260, useNativeDriver: true }),
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

    const speakMedie = async (text) => {
        console.log("🔊 speakMedie 호출:", text);
        isSpeakingRef.current = true;
        setIsListening(false);
        showBubbleText(text);

        try {
            ExpoSpeechRecognitionModule.stop();
            console.log("📡 TTS 서버 요청 중...", `${API_BASE_URL}/tts`);

            const response = await fetch(`${API_BASE_URL}/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) throw new Error(`TTS 오류: ${response.status}`);

            const arrayBuffer = await response.arrayBuffer();
            const base64Audio = btoa(
                new Uint8Array(arrayBuffer).reduce(
                    (data, byte) => data + String.fromCharCode(byte), ''
                )
            );

            const fileUri = `${FileSystem.cacheDirectory}medie_tts.mp3`;
            await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log("📥 파일 저장 완료:", fileUri);

            if (playerRef.current) {
                await playerRef.current.unloadAsync();
                playerRef.current = null;
            }

            console.log("🎵 오디오 재생 시작");
            const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
            playerRef.current = sound;
            await sound.playAsync();

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    console.log("✅ TTS 재생 완료");
                    isSpeakingRef.current = false;
                    sound.unloadAsync();
                    setTimeout(() => {
                        hideBubble();
                        if (!isThinkingRef.current) startListeningInternal();
                    }, 800);
                }
            });

        } catch (e) {
            console.error('❌ TTS 실패, expo-speech로 대체:', e);
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
        }
    };

    useSpeechRecognitionEvent('result', (event) => {
        const transcript = event.results[0]?.transcript;
        if (!transcript || isThinkingRef.current || isSpeakingRef.current) return;

        // ✅ 숨기기 키워드 감지
        if (isChatOpenRef.current &&
            (transcript.includes('나가') || transcript.includes('꺼져') || transcript.includes('닫아'))) {
            console.log("👋 매디 숨김!");
            isChatOpenRef.current = false;
            isVisibleRef.current = false;
            setIsVisible(false);
            hideBubble();
            ExpoSpeechRecognitionModule.stop();
            return;
        }

        // ✅ 호출어 감지 (숨김 상태에서도 작동)
        if (!isChatOpenRef.current &&
            (transcript.includes('매디') || transcript.includes('메디'))) {
            console.log("🔔 호출어 감지!");
            isChatOpenRef.current = true;
            isVisibleRef.current = true;
            setIsVisible(true);
            speakMedie('네! 말씀해주세요!');
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
        console.log("❌ 인식 에러:", event.error);
        if (event.error === 'no-speech') return;
        setIsListening(false);
        if (event.error === 'audio-capture') {
            setTimeout(() => {
                if (!isThinkingRef.current && !isSpeakingRef.current) startListeningInternal();
            }, 1800);
        }
    });

    useSpeechRecognitionEvent('end', () => {
        setIsListening(false);
        if (!isThinkingRef.current && !isSpeakingRef.current && isChatOpenRef.current) {
            setTimeout(() => startListeningInternal(), 300);
        }
    });

    const startListeningInternal = async () => {
        console.log("🎤 마이크 시작 시도");
        try {
            await ExpoSpeechRecognitionModule.start({ lang: 'ko-KR', interimResults: true });
            setIsListening(true);
            console.log("🎤 마이크 시작 성공");
        } catch (e) {
            if (!e.message?.includes('already')) console.error('마이크 재시작 실패:', e);
            setIsListening(false);
        }
    };

    const handleStartListening = async () => {
        try {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
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
        const init = async () => {
            console.log("🚀 MedieChatView 초기화 시작");
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                });
                console.log("✅ 오디오 모드 설정 완료");
            } catch (e) {
                console.error('오디오 모드 설정 실패:', e);
            }
            await handleStartListening();
        };

        init();

        return () => {
            ExpoSpeechRecognitionModule.stop();
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
            try {
                playerRef.current?.unloadAsync?.();
                playerRef.current = null;
            } catch (e) {
                console.error('오디오 정리 실패:', e);
            }
        };
    }, []);

    const askMedie = async (userText) => {
        console.log("💬 askMedie 호출:", userText);
        setIsThinking(true);
        isThinkingRef.current = true;

        const newHistory = [
            ...chatHistory,
            { role: "user", content: userText }
        ];


        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    current_mode: appMode,
                    pill_history: pillHistory,
                    chat_history: newHistory,  // ← 추가
                }),
            });

            const data = await response.json();
            console.log("📨 서버 응답:", data);

            setChatHistory([
                ...newHistory,
                { role: "assistant", content: data.reply }
            ]);

            if (newHistory.length > 10) {
                setChatHistory(prev => prev.slice(-10));
            }

            if (data.target && data.target !== 'NONE' && data.target !== 'IDLE') {
                console.log("📱 화면 이동:", data.target);
                setTimeout(() => setAppMode(data.target), 400);
            }

            if (data.command === 'COMPLETE_DOSE') {
                console.log("💊 복약 완료 처리");
                if (onCompleteNextDose) await onCompleteNextDose();
            }

            if (data.command === 'SET_ALARM' && data.params?.time) {
                console.log("⏰ 알람 변경:", data.params.time);
                if (onChangeAlarmTime) {
                    const pill = myPills[0];
                    const pillId = pill?.id || 'all';
                    await onChangeAlarmTime(pillId, data.params.time);
                    if (pill && !pill.alarmEnabled && onToggleAlarm) {
                        await onToggleAlarm(pillId);
                        console.log("🔔 알람 자동 ON:", pillId);
                    }
                }
            }

            if (data.show_confirmation) setShowConfirmButtons(true);

            if (data.command === 'SEARCH_DRUG' && data.params?.keyword) {
                console.log("🔍 약 검색:", data.params.keyword);
                setTimeout(() => {
                    setAppMode('SEARCH_PILL');
                    if (onSearchDrug) onSearchDrug(data.params.keyword);
                }, 400);
            }

            if (data.command === 'WRITE_POST' && data.params?.title) {
                console.log("✍️ 게시글 작성:", data.params);
                if (onWritePost) {
                    onWritePost({
                        title: data.params.title,
                        author: data.params.author || '익명',
                        content: data.params.content,
                        board_type: data.params.board_type
                    });
                }
                setTimeout(() => setAppMode('WRITE_BOARD'), 400);
            }

            speakMedie(data.reply);

        } catch (e) {
            console.error('❌ 서버 연결 실패:', e);
            speakMedie('서버와 연결할 수 없어요. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsThinking(false);
            isThinkingRef.current = false;
        }
    };

    const handleFloatingBtnPress = () => {
        console.log("🐾 버튼 눌림 / isChatOpen:", isChatOpenRef.current, "/ isListening:", isListening);
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
            speakMedie('네! 말씀해주세요!');
        }
    };

    return (
        <View style={styles.masterContainer} pointerEvents="box-none">

            {showBubble && (
                <Animated.View style={[
                    styles.bubble,
                    {
                        bottom: bubbleBottom,
                        opacity: bubbleOpacity,
                        transform: [{ scale: bubbleScale }],
                    },
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

            {showConfirmButtons && (
                <View style={[styles.confirmBox, { bottom: confirmBottom }]}>
                    <Text style={styles.confirmTitle}>방금 약 드셨나요? 🐾</Text>
                    <View style={styles.confirmButtons}>
                        <TouchableOpacity style={styles.yesBtn} onPress={() => {
                            setShowConfirmButtons(false);
                            askMedie('응 먹었어!');
                        }}>
                            <Text style={styles.btnText}>응, 먹었어! 💊</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.noBtn} onPress={() => {
                            setShowConfirmButtons(false);
                            askMedie('아직 안 먹었어');
                        }}>
                            <Text style={styles.btnText}>아직 안 먹었어</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ✅ 드래그 가능한 매디 버튼 */}
            {isVisible && (  // ← 여기 추가
                <Animated.View
                    style={[
                        styles.medieFloatingBtn,
                        { bottom: dynamicBottom },
                        { transform: panRef.getTranslateTransform() },
                        isListening && styles.listeningBtn,
                    ]}
                    {...panResponder.panHandlers}
                >
                    <TouchableOpacity
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
                </Animated.View>
            )}
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

