// components/PillCard.js
export default function PillCard({
  pill,
  onToggleAlarm,
  onDelete,
}) {
  return (
    <View style={styles.dataCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{pill.name}</Text>
        <Text style={styles.cardSub}>신뢰도 {pill.confidence}%</Text>

        <Text>📌 복용 목적</Text>
        <Text>{pill.usage}</Text>

        <Text>⚠️ 주의사항</Text>
        <Text>{pill.warning}</Text>

        <TouchableOpacity onPress={onToggleAlarm}>
          <Text>{pill.alarmEnabled ? '🔕 알람 끄기' : '🔔 알람 켜기'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onDelete}>
        <Text>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}