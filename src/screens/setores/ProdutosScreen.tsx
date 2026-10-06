import { dadosDeRota } from '../../navigation/dadosDeRota';
import type { StockScreenProps } from '../../navigation/types';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProdutos } from '../../services/produtos/useProdutos';
import { removerProduto } from '../../services/produtos/produtosService';
import { mensagemErroProdutos, precisaReposicao } from '../../utils/produtos';
import type { Produto } from '../../types/produto.types';
import ConfirmModal from '../../components/ConfirmModal';
import { FormButton, authStyles } from '../../components/AuthFormLayout';

export default function ProdutosScreen({ navigation, route }: StockScreenProps<'Produtos'>) {
  const { setor } = route.params;
  const { estado, contexto, tentarNovamente } = useProdutos(setor.id);
  const valido = contexto?.estabelecimentoId === setor.estabelecimentoId;
  const produtos = valido && estado.status === 'data' ? estado.produtos : [];
  const [selecionado, setSelecionado] = useState<Produto | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const ocupado = useRef(false);
  const ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);
  async function excluir() {
    if (!contexto || !selecionado || ocupado.current || !valido) return;
    ocupado.current = true;
    setExcluindo(true);
    setErro(null);
    try { await removerProduto(contexto, selecionado.id); }
    catch (e) { if (ativo.current) setErro(mensagemErroProdutos(e)); }
    finally {
      ocupado.current = false;
      if (ativo.current) { setSelecionado(null); setExcluindo(false); }
    }
  }
  function renderProduto({ item }: { item: Produto }) {
    return <View style={styles.card}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Abrir produto ${item.nome}`}
        onPress={() => navigation.navigate('ProdutoDetalhes', { setor, produtoId: item.id })}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.editar}>Ver detalhes e movimentações</Text>
      </TouchableOpacity>
      <Text style={styles.descricao}>{item.descricao || 'Sem descrição'}</Text>
      <Text style={styles.saldo}>Estoque atual: {item.estoqueAtual}</Text>
      {item.estoqueMinimo !== undefined ? <Text style={styles.descricao}>Estoque mínimo: {item.estoqueMinimo}</Text> : null}
      {item.estoqueAtual === 0 ? <Text style={styles.atencao}>Estoque zerado</Text> : null}
      {precisaReposicao(item) ? <Text style={styles.atencao}>Necessita reposição</Text> : null}
      <View style={styles.acoes}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Editar produto ${item.nome}`}
          disabled={excluindo} style={styles.acao} onPress={() => navigation.navigate('ProdutoForm', { setor, produto: dadosDeRota(item) })}>
          <Text style={styles.editar}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Excluir produto ${item.nome}`}
          disabled={excluindo} style={styles.acao} onPress={() => { setErro(null); setSelecionado(item); }}>
          <Text style={styles.atencao}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>;
  }
  const erroVisivel = !valido ? 'Este setor não pertence à sessão atual.' : erro ?? (estado.status === 'error' ? estado.mensagem : null);
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.area}>
    <View style={styles.conteudo}>
      <Text style={styles.titulo}>{setor.nome}</Text>
      <Text style={authStyles.subtitle}>Produtos cadastrados neste setor</Text>
      <FormButton label="Novo produto" disabled={!valido || excluindo} onPress={() => navigation.navigate('ProdutoForm', { setor })} />
      {estado.status === 'loading' ? <Text>Carregando produtos...</Text> : null}
      {excluindo ? <Text>Excluindo produto e movimentações...</Text> : null}
      {erroVisivel ? <View><Text accessibilityRole="alert" style={authStyles.error}>{erroVisivel}</Text>
        <FormButton label="Tentar novamente" onPress={() => { setErro(null); tentarNovamente(); }} /></View> : null}
      <FlatList data={produtos} keyExtractor={p => p.id} renderItem={renderProduto}
        contentContainerStyle={styles.lista} ListEmptyComponent={estado.status === 'data' && !erroVisivel
          ? <Text style={styles.vazio}>Nenhum produto cadastrado. Adicione produtos para este setor.</Text> : null} />
      <ConfirmModal visible={selecionado !== null} title="Excluir produto"
        message="Ao excluir este produto, todas as movimentações vinculadas a ele também serão removidas. Deseja continuar?"
        confirmText={excluindo ? 'Excluindo...' : 'Excluir'} onConfirm={() => { void excluir(); }}
        onCancel={() => { if (!ocupado.current) setSelecionado(null); }} />
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: '#F5F5F5' }, conteudo: { flex: 1, padding: 20 },
  titulo: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E5E5', padding: 16, marginBottom: 12 },
  nome: { fontSize: 17, fontWeight: '700', color: '#111' }, descricao: { fontSize: 14, color: '#555', marginTop: 6 },
  saldo: { fontSize: 16, fontWeight: '700', color: '#1565C0', marginTop: 8 },
  atencao: { fontSize: 15, fontWeight: '600', color: '#A31818', marginTop: 6 },
  acoes: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 8, gap: 12 },
  acao: { minHeight: 48, minWidth: 80, justifyContent: 'center', alignItems: 'center' },
  editar: { fontSize: 15, color: '#1565C0', fontWeight: '600' },
  lista: { flexGrow: 1, paddingBottom: 20 }, vazio: { color: '#555', fontSize: 17, textAlign: 'center', marginTop: 24 },
});
