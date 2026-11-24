/**
 * Envolve telas com área segura, espaço para teclado e rolagem opcional.
 * Depende de React Native, safe-area-context, altura do header e tema.
 * Com scroll=false, a lista da tela assume a rolagem vertical principal.
 */

import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { colors, spacing } from '../../theme';

export function AppScreen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const headerHeight = useHeaderHeight();
  return <SafeAreaView edges={['left', 'right']} style={styles.area}>
    <KeyboardAvoidingView style={styles.area} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={headerHeight}>
      {scroll ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        : <View style={styles.list}>{children}</View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ area: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxl }, list: { flex: 1, paddingHorizontal: spacing.xl } });
