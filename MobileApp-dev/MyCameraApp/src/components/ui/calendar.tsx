import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';

export const Calendar = ({ onDayPress, selectedDate }: any) => {
  return (
    <View style={styles.container}>
      <RNCalendar
        // 선택된 날짜 강조
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#1d7edb' }
        }}
        // 날짜 클릭 시 동작
        onDayPress={(day: any) => onDayPress(day.dateString)}
        theme={{
          todayTextColor: '#1d7edb',
          arrowColor: '#1d7edb',
          selectedDayBackgroundColor: '#1d7edb',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textMonthFontWeight: 'bold',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    padding: 10,
  }
});