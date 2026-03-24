import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../styles/commonStyles';

export default function HomeScreen({
  setAppMode,
  onPressMap,
  isLoggedIn,
  user,
  setIsLoggedIn,
  setUser,
}) {
  const displayName = user?.nickname || user?.name || '사용자';

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('user_id');
          await SecureStore.deleteItemAsync('user_name');
          await SecureStore.deleteItemAsync('user_nickname');
          await SecureStore.deleteItemAsync('user_email');
          await SecureStore.deleteItemAsync('login_type');

          setIsLoggedIn(false);
          setUser(null);
        },
      },
    ]);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#E8F5E9', '#FFFDE7']} style={styles.menuContainer}>
        {/* 상단 헤더 버튼 라인 */}
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
            marginBottom: 18,
          }}
        >
          {!isLoggedIn ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAppMode('LOGIN')}
              style={{
                backgroundColor: '#fff',
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#ddd',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: '#444',
                }}
              >
                로그인
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#444',
                  marginRight: 10,
                }}
              >
                {displayName}님
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogout}
                style={{
                  backgroundColor: '#fff',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#ddd',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#444',
                  }}
                >
                  로그아웃
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAppMode('MY_PILL')}
            style={{
              backgroundColor: '#fff',
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: '#ddd',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '800',
                color: '#FF7F50',
              }}
            >
              내 복용중 알약
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuHeaderWrapper}>
          <Text style={styles.menuHeader}>무엇을 도와드릴까요?</Text>
          <View style={styles.headerUnderline} />
        </View>

        <View style={styles.menuGrid}>
          {[
            { id: 'SCAN', label: '카메라 스캔', icon: '📸' },
            { id: 'MAP', label: '당번 약국', icon: '📍' },
            { id: 'ALARM', label: '복약 알람', icon: '⏰' },
            { id: 'SEARCH_PILL', label: '알약 검색', icon: '🔍' },
            { id: 'COMMUNITY', label: '게시판', icon: '📝' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.id === 'MAP') {
                  onPressMap?.();
                  return;
                }
                setAppMode(item.id);
              }}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.menuLabel,
                  {
                    color: '#333',
                    fontSize: 14,
                    fontWeight: '700',
                    marginTop: 8,
                    textAlign: 'center',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}