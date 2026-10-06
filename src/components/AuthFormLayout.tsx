import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const authStyles = StyleSheet.create({
  area: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flexGrow: 1, padding: 20, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#555', marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderColor: '#DDD', borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: '#111', marginBottom: 18, minHeight: 48 },
  button: { backgroundColor: '#1E88E5', borderRadius: 12, minHeight: 48, padding: 15,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  disabled: { opacity: 0.55 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  link: { minHeight: 48, justifyContent: 'center', alignItems: 'center', padding: 12 },
  linkText: { color: '#1565C0', fontSize: 16, fontWeight: '600' },
  error: { color: '#A31818', fontSize: 15, lineHeight: 22, marginBottom: 16 },
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
