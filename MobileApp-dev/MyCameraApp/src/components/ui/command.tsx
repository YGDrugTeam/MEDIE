import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { Search } from 'lucide-react-native';

// 1. Command Root (검색창과 리스트를 감싸는 틀)
export const Command = ({ children, style }: any) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

// 2. CommandInput (입력창)
export const CommandInput = ({ placeholder, value, onChangeText }: any) => (
  <View style={styles.inputWrapper}>
    <Search size={18} color="#64748b" style={styles.searchIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder || "검색어를 입력하세요..."}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#94a3b8"
    />
  </View>
);

// 3. CommandItem (각 검색 결과 항목)
export const CommandItem = ({ children, onPress }: any) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.itemText}>{children}</Text>
  </TouchableOpacity>
);

// 4. CommandGroup (항목들을 그룹화하는 제목)
export const CommandGroup = ({ heading, children }: any) => (
  <View style={styles.group}>
    <Text style={styles.groupHeading}>{heading}</Text>
    {children}
  </View>
);

// 5. CommandEmpty (결과가 없을 때)
export const CommandEmpty = ({ children }: any) => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>{children || "검색 결과가 없습니다."}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  group: {
    paddingTop: 12,
  },
  groupHeading: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemText: {
    fontSize: 15,
    color: '#334155',
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});