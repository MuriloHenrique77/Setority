import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput } from 'react-native';
import type { StockScreenProps } from '../../navigation/types';
import { AuthFormLayout, FormButton, authStyles } from '../../components/AuthFormLayout';
import { useSession } from '../../session/SessionProvider';
import { lerQuantidadeFormulario } from '../../utils/produtos';
import { normalizarMovimentacao, mensagemErroMovimentacao } from '../../utils/movimentacoes';
import { registrarEntrada, registrarSaida, editarMovimentacao } from '../../services/movimentacoes/movimentacoesService';

export default function MovimentacaoFormScreen({ route, navigation }: StockScreenProps<'MovimentacaoForm'>) {
  const { produtoId, setor, tipo, movimentacao } = route.params;
  const { estado } = useSession();
  const contexto = estado.status === 'authenticatedReady' ? { uid: estado.conta.uid, estabelecimentoId: estado.perfil.estabelecimentoId } : null;
  const valido = contexto !== null && contexto.estabelecimentoId === setor.estabelecimentoId;
  const [quantidade, setQuantidade] = useState(movimentacao ? String(movimentacao.quantidade) : '');
  const [observacao, setObservacao] = useState(movimentacao?.observacao ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const ocupado = useRef(false), ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);
  async function salvar() {
    if (ocupado.current || !contexto || !valido) return;
    let dados;
    try { dados = normalizarMovimentacao({ quantidade: lerQuantidadeFormulario(quantidade, 'A quantidade'), observacao }); }
    catch (e) { setErro(mensagemErroMovimentacao(e, !!movimentacao)); return; }
    ocupado.current = true; setSalvando(true); setErro(null);
    try {
      const registrar = tipo === 'entrada' ? registrarEntrada : registrarSaida;
      if (movimentacao) await editarMovimentacao(contexto, produtoId, setor.id, movimentacao.id, dados);
      else await registrar(contexto, produtoId, setor.id, dados);
      if (ativo.current) navigation.goBack();
    } catch (e) { if (ativo.current) setErro(mensagemErroMovimentacao(e, !!movimentacao)); }
    finally { ocupado.current = false; if (ativo.current) setSalvando(false); }
  }
  return <AuthFormLayout title={movimentacao ? (tipo === 'entrada' ? 'Editar entrada' : 'Editar saída') : (tipo === 'entrada' ? 'Registrar entrada' : 'Registrar saída')}
    subtitle={movimentacao ? 'É necessária conexão para alterar movimentações. O tipo permanece imutável.' : 'É necessária conexão para registrar esta movimentação. O estoque será validado ao confirmar.'}
    erro={valido ? erro : 'Este setor não pertence à sessão atual.'}>
    <Text style={authStyles.subtitle}>Tipo: {tipo === 'entrada' ? 'Entrada' : 'Saída'}</Text>
    <Text style={authStyles.label}>Quantidade</Text>
    <TextInput accessibilityLabel="Quantidade" value={quantidade} onChangeText={setQuantidade} style={authStyles.input}
      keyboardType="number-pad" placeholder="Maior que zero" editable={!salvando && valido} />
    <Text style={authStyles.label}>Observação</Text>
    <TextInput accessibilityLabel="Observação" value={observacao} onChangeText={setObservacao} style={[authStyles.input, { minHeight: 100 }]}
      multiline textAlignVertical="top" maxLength={2000} placeholder="Opcional" editable={!salvando && valido} />
    {salvando ? <Text style={authStyles.subtitle}>Aguardando confirmação do servidor...</Text> : null}
    <FormButton label={salvando ? 'Salvando...' : movimentacao ? 'Salvar alterações' : tipo === 'entrada' ? 'Confirmar entrada' : 'Confirmar saída'}
      onPress={() => { void salvar(); }} disabled={salvando || !valido} />
  </AuthFormLayout>;
}
