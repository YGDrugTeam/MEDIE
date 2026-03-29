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
import { Buffer } from 'buffer';
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
    onToggleAllAlarms,
    onDeleteAllAlarms,
    onSearchDrug,
    onWritePost,
    myPills = [],
    pillHistory = [],
    onPillHistoryUpdate,
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
    const [lastConfirmedTimestamp, setLastConfirmedTimestamp] = useState('');

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
    const isDraggingRef = useRef(false);

    const panRef = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    // 드래그 vs 탭 구분 (5px 이상 움직이면 드래그)
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                isDraggingRef.current = false;
                panRef.setOffset({
                    x: panRef.x._value,
                    y: panRef.y._value,
                });
                panRef.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (e, gestureState) => {
                if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
                    isDraggingRef.current = true;
                }
                Animated.event(
                    [null, { dx: panRef.x, dy: panRef.y }],
                    { useNativeDriver: false }
                )(e, gestureState);
            },
            onPanResponderRelease: () => {
                panRef.flattenOffset();
                // 드래그가 아니면 탭으로 처리
                if (!isDraggingRef.current) {
                    handleFloatingBtnPress();
                }
                isDraggingRef.current = false;
            },
        })
    ).current;

    useEffect(() => {
        const pollIoT = async () => {
            // 말하는 중이거나 생각 중이면 스킵
            if (isThinkingRef.current || isSpeakingRef.current) return;
            // 팝업 이미 떠있으면 스킵
            if (showConfirmButtons) return;

            try {
                const response = await fetch(`${API_BASE_URL}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: "",
                        current_mode: appMode,
                        pill_history: pillHistory,
                        chat_history: [],
                        last_confirmed_timestamp: lastConfirmedTimestamp,
                    }),
                });

                const data = await response.json();

                // IoT 감지 팝업
                if (data.show_confirmation && data.command === 'SHOW_CONFIRMATION') {
                    console.log("🔔 IoT 무게 감지! 팝업 표시");
                    setShowConfirmButtons(true);
                }

                // last_confirmed_timestamp 업데이트
                if (data.last_confirmed_timestamp) {
                    setLastConfirmedTimestamp(data.last_confirmed_timestamp);
                }

            } catch (e) {
            }
        };

        // 30초마다 IoT 체크
        const interval = setInterval(pollIoT, 60000);

        return () => clearInterval(interval);
    }, [appMode, pillHistory, lastConfirmedTimestamp, showConfirmButtons]);

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
            const response = await fetch(`${API_BASE_URL}/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) throw new Error(`TTS 오류: ${response.status}`);

            const arrayBuffer = await response.arrayBuffer();
            const base64Audio = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64');

            const fileUri = `${FileSystem.cacheDirectory}medie_tts.mp3`;
            await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (playerRef.current) {
                await playerRef.current.unloadAsync();
                playerRef.current = null;
            }

            const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
            playerRef.current = sound;
            await sound.playAsync();

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    isSpeakingRef.current = false;
                    sound.unloadAsync();
                    setTimeout(() => {
                        hideBubble();
                        if (!isThinkingRef.current) startListeningInternal();
                    }, 800);
                }
            });

        } catch (e) {
            console.error('❌ TTS 실패:', e);
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

        // ✅ 숨기기 키워드
        if (isChatOpenRef.current &&
            (transcript.includes('나가') || transcript.includes('꺼져') || transcript.includes('닫아'))) {
            isChatOpenRef.current = false;
            isVisibleRef.current = false;
            setIsVisible(false);
            hideBubble();
            ExpoSpeechRecognitionModule.stop();
            return;
        }

        // ✅ 호출어 (숨김 상태에서도 작동)
        if (!isChatOpenRef.current &&
            (transcript.includes('매디') || transcript.includes('메디'))) {
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
        if (event.error === 'no-speech') return;
        setIsListening(false);
        if (event.error === 'audio-capture') {
            setTimeout(() => {
                if (!isThinkingRef.current && !isSpeakingRef.current) startListeningInternal();
            }, 1800);
        }
    });

    // 숨김 상태에서도 마이크 유지 (호출어 감지용)
    useSpeechRecognitionEvent('end', () => {
        setIsListening(false);
        if (!isThinkingRef.current && !isSpeakingRef.current) {
            setTimeout(() => startListeningInternal(), 300);
        }
    });

    const startListeningInternal = async () => {
        try {
            const lang = Platform.OS === 'android' ? 'ko' : 'ko-KR';  // ← 추가
            await ExpoSpeechRecognitionModule.start({ lang, interimResults: true });  // ← 교체
            setIsListening(true);
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
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                });
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
            } catch (e) { }
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
                    chat_history: newHistory,
                    last_confirmed_timestamp: lastConfirmedTimestamp,
                }),
            });

            const data = await response.json();
            console.log("📨 서버 응답:", data);

            setChatHistory(prev => {
                const updated = [...newHistory, { role: "assistant", content: data.reply }];
                return updated.length > 10 ? updated.slice(-10) : updated;
            });

            if (data.pill_history && data.pill_history.length > 0) {
                if (onPillHistoryUpdate) onPillHistoryUpdate(data.pill_history);
            }

            // ✅ 화면 이동
            if (data.target && data.target !== 'NONE' && data.target !== 'IDLE') {
                setTimeout(() => setAppMode(data.target), 400);
            }

            // ✅ 복약 완료
            if (data.command === 'COMPLETE_DOSE') {
                if (onCompleteNextDose) await onCompleteNextDose();
            }

            // ✅ 패턴 감지로 알람 변경 제안 왔을 때
            if (data.command === 'SET_ALARM' && data.params?.time) {
                if (onChangeAlarmTime) {
                    const pill = myPills[0];
                    const pillId = pill?.id || 'all';
                    await onChangeAlarmTime(pillId, data.params.time);
                    if (pill && !pill.alarmEnabled && onToggleAlarm) {
                        await onToggleAlarm(pillId);
                    }
                }
            }

            // ✅ 모든 알람 켜기/끄기
            if (data.command === 'TOGGLE_ALL_ALARMS') {
                if (onToggleAllAlarms) await onToggleAllAlarms(data.params?.enabled);
            }

            // ✅ 모든 알람 삭제
            if (data.command === 'DELETE_ALL_ALARMS') {
                if (onDeleteAllAlarms) await onDeleteAllAlarms();
            }

            // ✅ IoT 확인 팝업
            if (data.show_confirmation && data.command === 'SHOW_CONFIRMATION') {
                setShowConfirmButtons(true);
            }

            // ✅ 약 검색
            if (data.command === 'SEARCH_DRUG' && data.params?.keyword) {
                setTimeout(() => {
                    setAppMode('SEARCH_PILL');
                    if (onSearchDrug) onSearchDrug(data.params.keyword);
                }, 400);
            }

            // ✅ 게시글 작성
            if (data.command === 'WRITE_POST' && data.params?.title) {
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

            if (data.last_confirmed_timestamp) {
                setLastConfirmedTimestamp(data.last_confirmed_timestamp);
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
            isVisibleRef.current = true;
            setIsVisible(true);
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
                        transform: [
                            { scale: bubbleScale },
                            { translateX: panRef.x },
                            { translateY: Animated.multiply(panRef.y, -1) },
                        ],
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
                        <TouchableOpacity style={styles.yesBtn} onPress={async () => {
                            setShowConfirmButtons(false);
                            if (onCompleteNextDose) await onCompleteNextDose();
                            showBubbleText('복용 내역 저장했어요! 💊');
                            setTimeout(() => hideBubble(), 2000);
                        }}>
                            <Text style={styles.btnText}>응, 먹었어! 💊</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.noBtn} onPress={() => {
                            setShowConfirmButtons(false);
                            showBubbleText('알겠어요! 나중에 알려주세요 😊');
                            setTimeout(() => hideBubble(), 2000);
                        }}>
                            <Text style={styles.btnText}>아직 안 먹었어</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {isVisible && (
                <Animated.View
                    style={[
                        styles.medieFloatingBtn,
                        { bottom: dynamicBottom },
                        { transform: panRef.getTranslateTransform() },
                    ]}
                    {...panResponder.panHandlers}
                >
                    {isThinking ? (
                        <ActivityIndicator color="#67A369" size="small" />
                    ) : (
                        <Image source={MEDIEMUNG_IMG} style={styles.medieIcon} />
                    )}
                    {isListening && <View style={styles.activeDot} />}
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
    confirmButtons: { flexDirection: 'row' },
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
    btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
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
    medieIcon: { width: 120, height: 120, resizeMode: 'contain' },
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