/**
 * Agrupa conteúdos em cartões nas telas de conta, início e autenticação.
 * Depende da View do React Native e do tema; só apresenta os filhos recebidos.
 */

import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../../theme';
export function AppCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderWidth: 1,
  borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg } });
