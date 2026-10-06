import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../../theme';
export default function LoadingScreen() {
  return <View style={styles.container} accessibilityLiveRegion="polite">
    <ActivityIndicator color={colors.primary} />
    <Text style={styles.text}>Carregando sua sessão...</Text>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }, text: { ...typography.body, color: colors.textSecondary, marginTop: spacing.lg } });
