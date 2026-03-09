// src/hooks/usePharmacySearch.js
import { useState, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const PHARM_API_URL =
  'https://mediclens-backend.azurewebsites.net/pharmacies/duty';

export default function usePharmacySearch() {
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const openKakaoMapDetail = useCallback((p) => {
    const query = encodeURIComponent(`${p?.name ?? ''}`);
    const url = `https://map.kakao.com/link/search/${query}`;
    Linking.openURL(url);
  }, []);

  const makePhoneCall = useCallback((phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => Alert.alert('오류', '전화 연결 실패'));
  }, []);

  const findNearbyPharmacies = useCallback(async () => {
    setIsSearchingMap(true);

    try {
      // 1) 위치 권한
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '위치 권한을 허용해주세요');
        return;
      }

      // 2) 현재 위치
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // 3) reverse geocoding
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (!geo || geo.length === 0) {
        Alert.alert('오류', '주소 정보를 가져올 수 없습니다');
        return;
      }

      const sido = geo[0].region;      // 서울특별시
      const sigungu = geo[0].district; // 관악구

      console.log('📍 위치 확인', { latitude, longitude, sido, sigungu });

      // 4) 백엔드 호출
      const res = await axios.get(PHARM_API_URL, {
        params: { sido, sigungu, lat: latitude, lng: longitude },
      });

      const items = res.data?.data ?? [];

      if (items.length === 0) {
        setNearbyPharmacies([]);
        return;
      }

      const pharmacies = items.map((p, idx) => ({
        id: String(idx),
        name: p.dutyName,
        dist: `${Math.round(p.distance)}m`,
        status: '영업중',
        phone: p.dutyTel1,
        address: p.dutyAddr,
        lat: p.wgs84Lat,
        lng: p.wgs84Lon,
      }));

      setNearbyPharmacies(pharmacies);
    } catch (e) {
      console.error('약국 조회 실패', e);
      Alert.alert('오류', '당번약국 정보를 불러오지 못했습니다');
    } finally {
      setIsSearchingMap(false);
    }
  }, []);

  return {
    nearbyPharmacies,
    isSearchingMap,
    findNearbyPharmacies,
    openKakaoMapDetail,
    makePhoneCall,
  };
}