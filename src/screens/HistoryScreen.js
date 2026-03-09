import React from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';

export default function HistoryScreen({ pillHistory, setAppMode }) {
  return (
    <SafeAreaView>
      <ScrollView>
        {pillHistory.map(h => (
          <View key={h.takenAt} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}