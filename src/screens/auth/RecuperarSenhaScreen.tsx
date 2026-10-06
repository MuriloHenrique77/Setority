import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { AuthFormLayout, FormButton, authStyles } from '../../components/AuthFormLayout';
import { recuperarSenha, firebaseNativoDisponivel } from '../../services/firebase/session';
import { validarEmailRecuperacao, mensagemErroRecuperacao, mensagemRecuperacaoEnviada } from '../../utils/auth';

export default function RecuperarSenhaScreen({ navigation }: StackScreenProps<AuthStackParamList, 'RecuperarSenha'>) {
  const [email, setEmail] = useState(''), [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false), [enviado, setEnviado] = useState(false);
  const ocupado = useRef(false), ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);
  async function enviar() {
    if (ocupado.current || enviado || !firebaseNativoDisponivel) return;
    const validacao = validarEmailRecuperacao(email);
    if (validacao) { setErro(validacao); return; }
    ocupado.current = true; setEnviando(true); setErro(null);
    try { await recuperarSenha(email); if (ativo.current) setEnviado(true); }
    catch (e) { if (ativo.current) setErro(mensagemErroRecuperacao(e)); }
    finally { ocupado.current = false; if (ativo.current) setEnviando(false); }
  }
  return <AuthFormLayout title="Recuperar senha" subtitle="Informe o e-mail utilizado na sua conta para receber instruções." erro={erro}>
    {!firebaseNativoDisponivel ? <Text style={authStyles.subtitle}>A recuperação de senha está disponível no aplicativo Android.</Text> : null}
    {enviado ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={authStyles.subtitle}>{mensagemRecuperacaoEnviada}</Text> : <>
      <Text style={authStyles.label}>E-mail</Text>
      <TextInput accessibilityLabel="E-mail para recuperação" value={email} onChangeText={t => { setEmail(t); setErro(null); }}
        style={authStyles.input} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email"
        editable={!enviando && firebaseNativoDisponivel} />
      {enviando ? <ActivityIndicator accessibilityLabel="Enviando instruções" color="#1565C0" /> : null}
      <FormButton label={enviando ? 'Enviando...' : 'Enviar instruções'} disabled={enviando || !firebaseNativoDisponivel}
        onPress={() => { void enviar(); }} />
    </>}
    <FormButton link label="Voltar ao Login" onPress={() => navigation.goBack()} />
  </AuthFormLayout>;
}
