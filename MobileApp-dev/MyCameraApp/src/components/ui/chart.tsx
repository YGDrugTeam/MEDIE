import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from "react-native-gifted-charts";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 1. 차트 컨테이너 (웹의 ChartContainer 대응)
export const ChartContainer = ({ children, title }: any) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartWrapper}>
        {children}
      </View>
    </View>
  );
};

// 2. 꺾은선 차트 (의료 데이터 변화 추이에 적합)
export const SimpleLineChart = ({ data }: { data: any[] }) => {
  return (
    <LineChart
      data={data}
      width={SCREEN_WIDTH - 80}
      height={200}
      color="#1d7edb" // 조원의 Primary 색상
      thickness={3}
      dataPointsColor="#1d7edb"
      noOfSections={3}
      yAxisTextStyle={{ color: '#64748b', fontSize: 10 }}
      xAxisLabelTextStyle={{ color: '#64748b', fontSize: 10 }}
      hideDataPoints={false}
      areaChart // 영역 색 채우기 (웹 디자인 느낌)
      startFillColor="rgba(29, 126, 219, 0.3)"
      endFillColor="rgba(29, 126, 219, 0.01)"
    />
  );
};

// 3. 툴팁/범례는 라이브러리 내장 기능을 사용하는 것이 가장 안정적입니다.
const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 15,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
