import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, MoreHorizontal } from 'lucide-react-native';

// 1. Breadcrumb Root
export const Breadcrumb = ({ children }: { children: any }) => {
  return <View style={styles.container}>{children}</View>;
};

// 2. Breadcrumb List (가로 배열)
export const BreadcrumbList = ({ children }: { children: any }) => {
  return <View style={styles.list}>{children}</View>;
};

// 3. Breadcrumb Item
export const BreadcrumbItem = ({ children }: { children: any }) => {
  return <View style={styles.item}>{children}</View>;
};

// 4. Breadcrumb Link (클릭 가능한 텍스트)
export const BreadcrumbLink = ({ children, onPress }: { children: any, onPress?: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Text style={styles.linkText}>{children}</Text>
    </TouchableOpacity>
  );
};

// 5. Breadcrumb Page (현재 페이지 - 강조된 텍스트)
export const BreadcrumbPage = ({ children }: { children: any }) => {
  return <Text style={styles.pageText}>{children}</Text>;
};

// 6. Breadcrumb Separator (구분자 아이콘)
export const BreadcrumbSeparator = () => (
  <View style={styles.separator}>
    <ChevronRight size={14} color="#94a3b8" />
  </View>
);

// 7. Breadcrumb Ellipsis (...)
export const BreadcrumbEllipsis = () => (
  <View style={styles.ellipsis}>
    <MoreHorizontal size={16} color="#94a3b8" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a', // foreground
  },
  separator: {
    marginHorizontal: 8,
  },
  ellipsis: {
    width: 24,
    alignItems: 'center',
  },
});