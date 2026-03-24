// services/pharmacyService.js
import * as Location from 'expo-location';
import axios from 'axios';
import { Linking, Alert } from 'react-native';

const PHARM_API_URL =
  'https://20.106.40.121/pharmacies/duty';

export const findNearbyPharmacies = async () => {
  const { status } =
    await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('위치 권한 필요');
    return [];
  }

  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;

  const geo = await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  });

  const sido = geo[0].region;
  const sigungu = geo[0].district;

  const res = await axios.get(PHARM_API_URL, {
    params: { sido, sigungu, lat: latitude, lng: longitude },
  });

  return (res.data?.data ?? []).map((p, idx) => ({
    id: idx,
    name: p.dutyName,
    dist: `${Math.round(p.distance)}m`,
    phone: p.dutyTel1,
    address: p.dutyAddr,
    lat: Number(p.wgs84Lat),
    lng: Number(p.wgs84Lon),
  }));
};

export const openKakaoMap = (name) => {
  Linking.openURL(
    `https://map.kakao.com/link/search/${encodeURIComponent(name)}`
  );
};

export const callPharmacy = (phone) => {
  Linking.openURL(`tel:${phone}`).catch(() =>
    Alert.alert('전화 연결 실패')
  );
};