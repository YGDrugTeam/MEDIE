import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import { styles } from '../styles/commonStyles';
import BackToMenuBtn from '../components/BackToMenuBtn';

export default function MapScreen({
  nearbyPharmacies = [],
  isSearchingMap = false,
  findNearbyPharmacies,
  makePhoneCall,
  openKakaoMapDetail,
  setAppMode,
}) {
  useEffect(() => {
    findNearbyPharmacies?.();
  }, [findNearbyPharmacies]);


  // console.log("지도에 표시될 약국 =", nearbyPharmacies);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subContainer}>
        <Text style={styles.mapHeader}>📍 내 주변 당번 약국</Text>

        {isSearchingMap ? (
          <ActivityIndicator size="large" color="#FF7F50" />
        ) : nearbyPharmacies.length === 0 ? (
          <Text
            style={{
              textAlign: 'center',
              color: '#999',
              marginTop: 40,
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            현재 시간 기준으로{'\n'}
            영업 중인 당번약국이 없습니다.
          </Text>
        ) : (
          <ScrollView style={styles.listScroll}>
            {nearbyPharmacies.map((p) => (
              <View key={p.id} style={styles.dataCard}>
                <View>
                  <Text style={styles.cardTitle}>{p.name}</Text>
                  <Text style={styles.cardSub}>
                    {p.dist} | {p.status}
                  </Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => makePhoneCall?.(p.phone)}>
                    <Text style={styles.actionIcon}>📞</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => openKakaoMapDetail?.(p)}>
                    <Text style={styles.actionIcon}>🗺️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <BackToMenuBtn onPress={() => setAppMode('HOME')} />
      </View>
    </SafeAreaView>
  );
}