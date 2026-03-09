// components/AlarmCard.js
export default function AlarmCard({
  alarm,
  onPressTime,
  onTaken,
}) {
  return (
    <View style={styles.dataCard}>
      <View>
        <Text style={styles.cardTitle}>{alarm.pillName}</Text>
        <TouchableOpacity onPress={onPressTime}>
          <Text style={styles.cardSub}>⏰ {alarm.time}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onTaken}>
        <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
          복용 완료
        </Text>
      </TouchableOpacity>
    </View>
  );
}