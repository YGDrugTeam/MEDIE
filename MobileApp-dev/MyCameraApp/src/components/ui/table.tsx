import * as React from "react";
import { View, Text, ScrollView, StyleSheet, ViewProps } from "react-native";
import { cn } from "../../lib/utils"; // 경로 확인 필요!

// Props 타입에 className을 추가하여 타입 에러를 방지합니다.
interface TableProps extends ViewProps {
  className?: string;
}

// 메인 테이블 컨테이너 (가로 스크롤 대응)
const Table = React.forwardRef<View, TableProps>(
  ({ className, style, ...props }, ref) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View ref={ref} style={[styles.table, style]} {...props} />
    </ScrollView>
  )
);
Table.displayName = "Table";

// 헤더 영역
const TableHeader = React.forwardRef<View, TableProps>(
  ({ className, style, ...props }, ref) => (
    <View ref={ref} style={[styles.header, style]} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

// 본문 영역
const TableBody = React.forwardRef<View, TableProps>(
  ({ className, style, ...props }, ref) => (
    <View ref={ref} style={[styles.body, style]} {...props} />
  )
);
TableBody.displayName = "TableBody";

// 행 (Row)
const TableRow = React.forwardRef<View, TableProps>(
  ({ className, style, ...props }, ref) => (
    <View ref={ref} style={[styles.row, style]} {...props} />
  )
);
TableRow.displayName = "TableRow";

// 헤더 셀 (Head)
const TableHead = React.forwardRef<View, TableProps & { children?: React.ReactNode }>(
  ({ className, style, children, ...props }, ref) => (
    <View ref={ref} style={[styles.head, style]} {...props}>
      <Text style={styles.headText}>{children}</Text>
    </View>
  )
);
TableHead.displayName = "TableHead";

// 일반 셀 (Cell)
const TableCell = React.forwardRef<View, TableProps & { children?: React.ReactNode }>(
  ({ className, style, children, ...props }, ref) => (
    <View ref={ref} style={[styles.cell, style]} {...props}>
      <Text style={styles.cellText}>{children}</Text>
    </View>
  )
);
TableCell.displayName = "TableCell";

const styles = StyleSheet.create({
  table: {
    width: "100%",
    minWidth: 400, // 모바일에서 표가 너무 찌그러지지 않게 최소 너비 설정
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  body: {},
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  head: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  headText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "left",
  },
  cell: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  cellText: {
    fontSize: 14,
    color: "#0f172a",
  },
});

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };