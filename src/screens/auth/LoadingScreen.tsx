import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return <View style={styles.container} accessibilityLiveRegion="polite">
    <ActivityIndicator size="large" color="#1E88E5" />
    <Text style={styles.text}>Carregando sua sessão...</Text>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', padding: 20 }, text: { color: '#333', marginTop: 16, fontSize: 16 } });
