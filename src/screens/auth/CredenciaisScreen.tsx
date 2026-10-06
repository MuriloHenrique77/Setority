import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput } from 'react-native';
import { AuthFormLayout, FormButton, authStyles } from '../../components/AuthFormLayout';
import { cadastrar, entrar, firebaseNativoDisponivel } from '../../services/firebase/session';
import { mensagemErroFirebase, validarCadastro, validarCredenciais } from '../../utils/auth';

export default function CredenciaisScreen({ cadastro, alternar, recuperar }: { cadastro: boolean; alternar: () => void; recuperar?: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const ocupado = useRef(false);
  const ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);

  async function enviar() {
    if (ocupado.current || !firebaseNativoDisponivel) return;
    const validacao = cadastro ? validarCadastro(email, senha, confirmacao) : validarCredenciais(email, senha);
    if (validacao) { setErro(validacao); return; }
    ocupado.current = true;
    setEnviando(true);
    setErro(null);
    try { await (cadastro ? cadastrar(email, senha) : entrar(email, senha)); }
    catch (e) { if (ativo.current) setErro(mensagemErroFirebase(e)); }
    finally { ocupado.current = false; if (ativo.current) setEnviando(false); }
  }

  const desabilitado = enviando || !firebaseNativoDisponivel;
  return <AuthFormLayout title={cadastro ? 'Criar conta' : 'Entrar'}
    subtitle={cadastro ? 'Crie sua conta. O estabelecimento será configurado no próximo passo.' : 'Entre para acessar seu estabelecimento.'} erro={erro}>
    {!firebaseNativoDisponivel ? <Text style={authStyles.subtitle}>A autenticação Firebase nativa não está disponível na versão web de desenvolvimento. Use uma development build Android.</Text> : null}
    <Text style={authStyles.label}>E-mail</Text>
    <TextInput accessibilityLabel="E-mail" style={authStyles.input} value={email} onChangeText={setEmail}
      autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" editable={!desabilitado} />
    <Text style={authStyles.label}>Senha</Text>
    <TextInput accessibilityLabel="Senha" style={authStyles.input} value={senha} onChangeText={setSenha}
      secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete={cadastro ? 'new-password' : 'current-password'} editable={!desabilitado} />
    {cadastro ? <>
      <Text style={authStyles.label}>Confirmar senha</Text>
      <TextInput accessibilityLabel="Confirmar senha" style={authStyles.input} value={confirmacao} onChangeText={setConfirmacao}
        secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" editable={!desabilitado} />
    </> : null}
    <FormButton label={enviando ? 'Aguarde...' : cadastro ? 'Criar conta' : 'Entrar'} onPress={() => { void enviar(); }} disabled={desabilitado} />
    {!cadastro && recuperar ? <FormButton link label="Esqueci minha senha?" onPress={recuperar} disabled={enviando} /> : null}
    <FormButton link label={cadastro ? 'Já tenho uma conta' : 'Criar uma conta'} onPress={alternar} disabled={enviando} />
  </AuthFormLayout>;
}
