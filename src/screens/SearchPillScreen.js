// src/screens/SearchPillScreen.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';

import { styles } from '../styles/commonStyles';
import BackToMenuBtn from '../components/BackToMenuBtn';
import usePillSearch from '../hooks/usePillSearch';

export default function SearchPillScreen({ setAppMode }) {
  // ✅ 너 백엔드 주소로 바꿔줘
  const apiBaseUrl = useMemo(
    () => 'https://medichubs-backend.azurewebsites.net',
    []
  );

  const {
    query,
    setQuery,
    canSearch,

    isSearching,
    results,
    selected,

    showModal,
    closeModal,

    search,
    selectItem,
  } = usePillSearch({ apiBaseUrl });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>🔍 알약 검색</Text>

        {/* 검색바 */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <TextInput
            value={(query ?? '').trimStart() === '' ? '' : query} // 공백만 있는 상태면 placeholder 보이게
            onChangeText={setQuery}
            placeholder="예) 아스피린, 타이레놀"
            placeholderTextColor="#999" // ✅ EAS에서 안보이는 문제 대부분 이걸로 해결
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: '#eee',
              color: '#111', // ✅ 입력 텍스트도 확실히 보이게
            }}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={search}
          />

          <TouchableOpacity
            onPress={search}
            disabled={!canSearch || isSearching}
            style={{
              paddingHorizontal: 14,
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: !canSearch || isSearching ? '#ddd' : '#FF7F50',
            }}
          >
            {isSearching ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700' }}>검색</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#888', marginTop: 10, fontSize: 12 }}>
          검색하면 결과가 모달로 표시됩니다.
        </Text>

        {/* 뒤로가기 */}
        <BackToMenuBtn onPress={() => setAppMode('HOME')} />

        {/* 결과 모달 */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>💊 검색 결과</Text>

              {/* 결과 없음 */}
              {!isSearching && results.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#777', marginTop: 18 }}>
                  검색된 알약이 없습니다.
                </Text>
              ) : null}

              {/* 상세 뷰 */}
              {selected ? (
                <ScrollView style={styles.scrollContainer}>
                  <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 10 }}>
                    {selected.name}
                  </Text>

                  {!!selected.company && (
                    <Text style={{ color: '#666', marginBottom: 10 }}>
                      제조사: {selected.company}
                    </Text>
                  )}

                  {!!selected.effect && (
                    <>
                      <Text style={{ fontWeight: '800', marginTop: 6 }}>효능</Text>
                      <Text style={styles.resultBody}>{selected.effect}</Text>
                    </>
                  )}

                  {!!selected.usage && (
                    <>
                      <Text style={{ fontWeight: '800', marginTop: 10 }}>복용법</Text>
                      <Text style={styles.resultBody}>{selected.usage}</Text>
                    </>
                  )}

                  {!!selected.caution && (
                    <>
                      <Text style={{ fontWeight: '800', marginTop: 10 }}>주의</Text>
                      <Text style={styles.resultBody}>{selected.caution}</Text>
                    </>
                  )}

                  {!!selected.interaction && (
                    <>
                      <Text style={{ fontWeight: '800', marginTop: 10 }}>상호작용</Text>
                      <Text style={styles.resultBody}>{selected.interaction}</Text>
                    </>
                  )}

                  {!!selected.sideEffect && (
                    <>
                      <Text style={{ fontWeight: '800', marginTop: 10 }}>부작용</Text>
                      <Text style={styles.resultBody}>{selected.sideEffect}</Text>
                    </>
                  )}

                  {!!selected.storage && (
                    <>
                      <Text style={{ fontWeight: '800', marginTop: 10 }}>보관</Text>
                      <Text style={styles.resultBody}>{selected.storage}</Text>
                    </>
                  )}

                  <View style={{ height: 12 }} />
                </ScrollView>
              ) : (
                /* 리스트 뷰 */
                <ScrollView style={styles.listScroll}>
                  {results.map((item, idx) => (
                    <TouchableOpacity
                      key={`${item.name}-${idx}`}
                      style={styles.dataCard}
                      activeOpacity={0.8}
                      onPress={() => selectItem(item)}
                    >
                      <View>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardSub}>
                          {item.company ? item.company : '제조사 정보 없음'}
                        </Text>
                      </View>
                      <Text style={styles.actionIcon}>➡️</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* 모달 버튼 */}
              <View style={styles.modalButtonRow}>
                {selected ? (
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.secondaryBtn]}
                    onPress={() => {
                      closeModal();       // 모달 닫기
                      setAppMode('HOME'); // 홈으로 이동
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>
                      메인메뉴
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 1 }} />
                )}

                <TouchableOpacity
                  style={[styles.modalActionBtn, styles.primaryBtn]}
                  onPress={closeModal}
                >
                  <Text style={styles.primaryBtnText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}