// src/hooks/usePillSearch.js
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

function normalizeToArray(data) {
  if (!data) return [];
  // 네가 보여준 응답: { count, items: { ... } } 형태도 있고
  // { count, items: [ ... ] } 일 수도 있으니 둘 다 처리
  const items = data.items ?? data;
  if (Array.isArray(items)) return items;
  if (typeof items === 'object') return [items];
  return [];
}

export default function usePillSearch({
  apiBaseUrl = 'https://medichubs-backend.azurewebsites.net', // 예: "https://medichubs-backend.azurewebsites.net"
  endpoint = '/drugs/search',
} = {}) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [results, setResults] = useState([]);      // 리스트
  const [selected, setSelected] = useState(null);  // 상세(선택된 약)
  const [showModal, setShowModal] = useState(false);

  const canSearch = useMemo(() => query.trim().length >= 1, [query]);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelected(null);
  }, []);

  const search = useCallback(async () => {
    const name = query.trim();
    if (!name) return;

    if (!apiBaseUrl) {
      Alert.alert('설정 필요', 'apiBaseUrl이 비어있습니다.');
      return;
    }

    try {
      setIsSearching(true);
      setResults([]);
      setSelected(null);

      const url = `${apiBaseUrl}${endpoint}?name=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          setResults([]);
          setShowModal(true);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const list = normalizeToArray(data);

      setResults(list);
      setShowModal(true);

      // 1개면 자동으로 상세로 보여줘도 편함
      if (list.length === 1) setSelected(list[0]);
    } catch (e) {
      console.error('❌ pill search failed:', e);
      Alert.alert('오류', '약 검색 중 문제가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  }, [apiBaseUrl, endpoint, query]);

  const selectItem = useCallback((item) => {
    setSelected(item);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelected(null);
    setShowModal(false);
  }, []);

  return {
    query,
    setQuery,
    canSearch,

    isSearching,
    results,
    selected,

    showModal,
    openModal,
    closeModal,

    search,
    selectItem,
    clear,
  };
}