import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radii, typography, touchTarget } from '../theme';

export const authStyles = StyleSheet.create({
  area: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xxl },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  input: { ...typography.body, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, marginBottom: spacing.lg, minHeight: touchTarget },
  button: { backgroundColor: colors.primary, borderRadius: radii.md, minHeight: touchTarget, padding: spacing.lg,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  disabled: { opacity: 0.55 },
  buttonText: { ...typography.label, color: colors.surface },
  link: { minHeight: touchTarget, justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  linkText: { ...typography.label, color: colors.primary },
  error: { ...typography.body, color: colors.danger, marginBottom: spacing.lg },
});

export function AuthFormLayout({ title, subtitle, erro, children }: React.PropsWithChildren<{
  title: string; subtitle: string; erro?: string | null;
}>) {
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={authStyles.area}>
    <KeyboardAvoidingView style={authStyles.area} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
      <ScrollView contentContainerStyle={authStyles.content} keyboardShouldPersistTaps="handled">
        <Text style={authStyles.title}>{title}</Text>
        <Text style={authStyles.subtitle}>{subtitle}</Text>
        {erro ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={authStyles.error}>{erro}</Text> : null}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export function FormButton({ label, onPress, disabled = false, link = false }: {
  label: string; onPress: () => void; disabled?: boolean; link?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={[link ? authStyles.link : authStyles.button, disabled ? authStyles.disabled : null]}>
    <Text style={link ? authStyles.linkText : authStyles.buttonText}>{label}</Text>
  </Pressable>;
}
