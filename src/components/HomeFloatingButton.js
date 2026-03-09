// components/HomeFloatingButton.js
export default function HomeFloatingButton({ visible, onPress }) {
  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.homeFloatingBtn} onPress={onPress}>
      <Text style={styles.homeFloatingIcon}>🏠</Text>
    </TouchableOpacity>
  );
}