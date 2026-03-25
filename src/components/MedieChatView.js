import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image,
    FlatList, Alert, ActivityIndicator, Dimensions
} from 'react-native';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

const { width } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const MedieChatView = ({ appMode, setAppMode, onCompleteNextDose, onChangeAlarmTime, myPills = [] }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: '1', text: "안녕하세요! 매디예요 🐶 '매디야'라고 불러주세요!", isMe: false }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const flatListRef = useRef();
    const isThinkingRef = useRef(false);
    const isChatOpenRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const sendTimerRef = useRef(null);

    useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);
    useEffect(() => { isChatOpenRef.current = isChatOpen; }, [isChatOpen]);

    // ✅ TTS - 딜레이 후 stop, 끝나면 재시작
    const speakMedie = (text) => {
        isSpeakingRef.current = true;
        setIsListening(false);

        setTimeout(() => {
            ExpoSpeechRecognitionModule.stop();
            Speech.speak(text, {
                language: 'ko-KR',
                pitch: 1.1,
                rate: 1.0,
                onDone: () => {
                    isSpeakingRef.current = false;
                    setTimeout(() => {
                        if (!isThinkingRef.current) startListeningInternal();
                    }, 800);
                },
                onError: () => {
                    isSpeakingRef.current = false;
                    if (!isThinkingRef.current) startListeningInternal();
                }
            });
        }, 300);
    };

    // ✅ 음성 인식 결과 처리 - 타이머 방식으로 전송
    useSpeechRecognitionEvent("result", (event) => {
        const transcript = event.results[0]?.transcript;
        if (!transcript || isThinkingRef.current || isSpeakingRef.current) return;

        console.log("인식:", transcript);

        // 호출어 감지 (채팅창 닫혀있을 때)
        if (!isChatOpenRef.current &&
            (transcript.includes("매디") || transcript.includes("메디"))) {
            console.log("🔔 호출어 감지!");
            isChatOpenRef.current = true;
            setIsChatOpen(true);
            speakMedie("네, 주인님! 부르셨나요? 멍멍!");
            return;
        }

        // 채팅창 열려있을 때 - 1.5초 동안 새 인식 없으면 전송
        if (isChatOpenRef.current) {
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
            sendTimerRef.current = setTimeout(() => {
                ExpoSpeechRecognitionModule.stop();
                setIsListening(false);
                askMedie(transcript);
            }, 1500);
        }
    });

    // ✅ 에러 처리
    useSpeechRecognitionEvent("error", (event) => {
        if (event.error === "no-speech") return;
        console.log("음성인식 에러:", event.error);
        setIsListening(false);
        if (event.error === "audio-capture") {
            setTimeout(() => {
                if (!isThinkingRef.current && !isSpeakingRef.current) {
                    startListeningInternal();
                }
            }, 2000);
        }
    });

    // ✅ 인식 끝나면 자동 재시작
    useSpeechRecognitionEvent("end", () => {
        setIsListening(false);
        if (!isThinkingRef.current && !isSpeakingRef.current) {
            setTimeout(() => startListeningInternal(), 300);
        }
    });

    const startListeningInternal = async () => {
        try {
            await ExpoSpeechRecognitionModule.start({
                lang: "ko-KR",
                interimResults: true,
            });
            setIsListening(true);
        } catch (e) {
            if (!e.message?.includes("already")) {
                console.error("마이크 재시작 실패:", e);
            }
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

    const handleStopListening = async () => {
        await ExpoSpeechRecognitionModule.stop();
        setIsListening(false);
    };

    // ✅ 앱 시작 시 자동 듣기
    useEffect(() => {
        handleStartListening();
        return () => {
            ExpoSpeechRecognitionModule.stop();
            if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
        };
    }, []);

    // ✅ 서버 통신
    const askMedie = async (userText) => {
        const newUserMsg = { id: Date.now().toString(), text: userText, isMe: true };
        setMessages(prev => [...prev, newUserMsg]);
        setIsThinking(true);
        isThinkingRef.current = true;

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    current_mode: appMode
                }),
            });

            const data = await response.json();
            console.log("서버 응답:", data);

            const medieReply = {
                id: (Date.now() + 1).toString(),
                text: data.reply,
                isMe: false
            };
            setMessages(prev => [...prev, medieReply]);

            // ✅ 화면 이동
            if (
                data.target &&
                data.target !== "NONE" &&
                data.target !== "IDLE"
            ) {
                setTimeout(() => setAppMode(data.target), 500);
            }

            // ✅ 복약 완료 처리
            if (data.command === "COMPLETE_DOSE") {
                if (onCompleteNextDose) {
                    await onCompleteNextDose();
                }
            }

            // ✅ 알람 시간 변경
            if (data.command === "SET_ALARM" && data.params?.time && data.params?.pillId) {
                if (onChangeAlarmTime) {
                    await onChangeAlarmTime(data.params.pillId, data.params.time);
                }
            }

            // ✅ 복약 확인 버튼
            if (data.show_confirmation) {
                setShowConfirmButtons(true);
            }

            speakMedie(data.reply);

        } catch (e) {
            console.error("서버 연결 실패:", e);
            const errMsg = "서버와 연결할 수 없어요. 잠시 후 다시 시도해주세요! 멍..";
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: errMsg,
                isMe: false
            }]);
            speakMedie(errMsg);
        } finally {
            setIsThinking(false);
            isThinkingRef.current = false;
        }
    };

    const handleFloatingBtnPress = () => {
        if (!isChatOpen) {
            isChatOpenRef.current = true;
            setIsChatOpen(true);
        } else {
            if (isListening) {
                handleStopListening();
            } else {
                handleStartListening();
            }
        }
    };

    return (
        <View style={styles.masterContainer} pointerEvents="box-none">
            {isChatOpen && (
                <View style={styles.chatPopup}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.headerTitle}>매디와 대화 중 🐶</Text>
                        <TouchableOpacity onPress={() => {
                            isChatOpenRef.current = false;
                            setIsChatOpen(false);
                            if (isListening) handleStopListening();
                        }}>
                            <Text style={styles.closeBtn}>닫기</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={[styles.bubble, item.isMe ? styles.myBubble : styles.medieBubble]}>
                                <Text style={item.isMe ? styles.myText : styles.medieText}>
                                    {item.text}
                                </Text>
                            </View>
                        )}
                        style={styles.chatList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    />

                    {isThinking && (
                        <View style={styles.thinkingBox}>
                            <ActivityIndicator size="small" color="#FF7F50" />
                            <Text style={styles.thinkingText}>매디가 생각 중... 🐾</Text>
                        </View>
                    )}

                    {showConfirmButtons && (
                        <View style={styles.confirmBox}>
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
                    )}
                </View>
            )}

            <TouchableOpacity
                style={[styles.medieFloatingBtn, isListening && styles.listeningBtn]}
                onPress={handleFloatingBtnPress}
            >
                {isThinking ? (
                    <ActivityIndicator color="#FF7F50" />
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
    chatPopup: {
        position: 'absolute', bottom: 120, right: 20, width: width * 0.85, height: 450,
        backgroundColor: '#FFF', borderRadius: 25, elevation: 10, shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5, overflow: 'hidden'
    },
    chatHeader: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 18,
        backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderBottomColor: '#EEE'
    },
    headerTitle: { fontWeight: 'bold', color: '#333' },
    closeBtn: { color: '#FF7F50', fontWeight: 'bold' },
    chatList: { padding: 15, flex: 1 },
    bubble: { padding: 12, borderRadius: 18, marginVertical: 5, maxWidth: '80%' },
    myBubble: { alignSelf: 'flex-end', backgroundColor: '#FF7F50' },
    medieBubble: { alignSelf: 'flex-start', backgroundColor: '#F0F0F0', borderBottomLeftRadius: 2 },
    myText: { color: '#FFF', fontSize: 15 },
    medieText: { color: '#333', fontSize: 15 },
    thinkingBox: {
        flexDirection: 'row', alignItems: 'center', padding: 10,
        paddingHorizontal: 16, gap: 8
    },
    thinkingText: { color: '#999', fontSize: 13 },
    confirmBox: { padding: 15, borderTopWidth: 1, borderTopColor: '#EEE', gap: 8 },
    yesBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 12, alignItems: 'center' },
    noBtn: { backgroundColor: '#aaa', padding: 12, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    medieFloatingBtn: {
        position: 'absolute', bottom: 30, right: 20, backgroundColor: '#FFF',
        borderRadius: 45, padding: 5, elevation: 8, borderWidth: 3, borderColor: '#FF7F50',
        width: 85, height: 85, justifyContent: 'center', alignItems: 'center'
    },
    listeningBtn: { borderColor: '#4CAF50', transform: [{ scale: 1.1 }] },
    medieIcon: { width: 70, height: 70 },
    activeDot: {
        position: 'absolute', top: 5, right: 5, width: 20, height: 20,
        borderRadius: 10, backgroundColor: '#4CAF50', borderWidth: 3, borderColor: '#FFF'
    }
});