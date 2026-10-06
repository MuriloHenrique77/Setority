import { dadosDeRota } from '../../navigation/dadosDeRota';
import type { StockScreenProps } from '../../navigation/types';
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProdutos } from '../../services/produtos/useProdutos';
import { ProdutoLifecycleActions } from '../../components/ProdutoLifecycleActions';
import { produtoAtivo } from '../../utils/cicloProduto';
import { AppButton } from '../../components/ui/AppButton';
import { colors } from '../../theme';
import { precisaReposicao } from '../../utils/produtos';
import type { Produto } from '../../types/produto.types';
import { FormButton, authStyles } from '../../components/AuthFormLayout';

export default function ProdutosScreen({ navigation, route }: StockScreenProps<'Produtos'>) {
  const { setor } = route.params;
  const { estado, contexto, tentarNovamente } = useProdutos(setor.id);
  const valido = contexto?.estabelecimentoId === setor.estabelecimentoId;
  const [aba, setAba] = useState<'ativo' | 'inativo'>('ativo');
  const produtos = valido && estado.status === 'data' ? estado.produtos.filter(p => produtoAtivo(p) === (aba === 'ativo')) : [];
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
      {produtoAtivo(item) && item.estoqueAtual === 0 ? <Text style={styles.atencao}>Estoque zerado</Text> : null}
      {produtoAtivo(item) && precisaReposicao(item) ? <Text style={styles.atencao}>Necessita reposição</Text> : null}
      {item.status === 'inativo' ? <Text style={styles.descricao}>Produto inativo{item.inativadoEm ? ` • ${item.inativadoEm.toLocaleDateString('pt-BR')}` : ''}</Text> : null}
      <View style={styles.acoes}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Editar produto ${item.nome}`}
          disabled={!valido} style={styles.acao} onPress={() => navigation.navigate('ProdutoForm', { setor, produto: dadosDeRota(item) })}>
          <Text style={styles.editar}>Editar</Text>
        </TouchableOpacity>
      </View>
      <ProdutoLifecycleActions produto={item} contexto={valido ? contexto : null} />
    </View>;
  }
  const erroVisivel = !valido ? 'Este setor não pertence à sessão atual.' : (estado.status === 'error' ? estado.mensagem : null);
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.area}>
    <View style={styles.conteudo}>
      <Text style={styles.titulo}>{setor.nome}</Text>
      <Text style={authStyles.subtitle}>Produtos cadastrados neste setor</Text>
      <FormButton label="Novo produto" disabled={!valido} onPress={() => navigation.navigate('ProdutoForm', { setor })} />
      {estado.status === 'loading' ? <Text>Carregando produtos...</Text> : null}
      <View style={styles.acoes}><View style={{ flex: 1 }}><AppButton label="Ativos" variant={aba === 'ativo' ? 'primary' : 'secondary'} onPress={() => setAba('ativo')} /></View><View style={{ flex: 1 }}><AppButton label="Inativos" variant={aba === 'inativo' ? 'primary' : 'secondary'} onPress={() => setAba('inativo')} /></View></View>
      {erroVisivel ? <View><Text accessibilityRole="alert" style={authStyles.error}>{erroVisivel}</Text>
        <FormButton label="Tentar novamente" onPress={tentarNovamente} /></View> : null}
      <FlatList data={produtos} keyExtractor={p => p.id} renderItem={renderProduto}
        contentContainerStyle={styles.lista} ListEmptyComponent={estado.status === 'data' && !erroVisivel
          ? <Text style={styles.vazio}>{aba === 'ativo' ? 'Nenhum produto ativo. Adicione produtos para este setor.' : 'Nenhum produto inativo neste setor.'}</Text> : null} />
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: colors.background }, conteudo: { flex: 1, padding: 20 },
  titulo: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  nome: { fontSize: 17, fontWeight: '700', color: colors.text }, descricao: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  saldo: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 8 },
  atencao: { fontSize: 15, fontWeight: '600', color: colors.warning, marginTop: 6 },
  acoes: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 8, gap: 12 },
  acao: { minHeight: 48, minWidth: 80, justifyContent: 'center', alignItems: 'center' },
  editar: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  lista: { flexGrow: 1, paddingBottom: 20 }, vazio: { color: colors.textSecondary, fontSize: 17, textAlign: 'center', marginTop: 24 },
});
