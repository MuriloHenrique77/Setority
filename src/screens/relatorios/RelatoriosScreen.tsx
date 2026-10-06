import { dadosDeRota } from '../../navigation/dadosDeRota';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthenticatedTabParamList } from '../../navigation/types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { Produto } from '../../types/produto.types';
import type { TipoMovimentacao } from '../../types/movimentacao.types';
import type { MovimentoRelatorio } from '../../types/relatorio.types';
import { useRelatorios } from '../../services/relatorios/useRelatorios';
import { agregarRelatorio, mensagemErroRelatorio } from '../../utils/relatorios';
import { construirIntervaloRelatorio, formatarDiaLocal, periodoPadrao } from '../../utils/periodoRelatorio';
import { formatarDataRelatorio as data, formatarQuantidadeRelatorio as numero } from '../../utils/formatarRelatorio';
import { authStyles, FormButton } from '../../components/AuthFormLayout';
import FiltroSelecao from '../../components/FiltroSelecao';

type Linha =
  | { id: string; tipo: 'movimento'; registro: MovimentoRelatorio }
  | { id: string; tipo: 'produto'; produto: Produto; setor: string; descricao: string }
  | { id: string; tipo: 'setor'; nome: string; entradas: number; saidas: number };
type Secao = { titulo: string; descricao: string; vazio: string; data: Linha[] };
const chave = (linha: Linha) => linha.id;

const LinhaResultado = memo(function LinhaResultado({ item, abrir }: { item: Linha; abrir: (p: Produto) => void }) {
  if (item.tipo === 'setor') return <View style={styles.card}>
    <Text style={styles.nome}>{item.nome}</Text>
    <Text style={styles.texto}>Entradas: {numero(item.entradas)} • Saídas: {numero(item.saidas)}</Text>
  </View>;
  const produto = item.tipo === 'produto' ? item.produto : item.registro.produto;
  return <View style={styles.card}>
    <Text style={styles.nome}>{produto?.nome ?? 'Produto indisponível'}</Text>
    <Text style={styles.texto}>Setor: {item.tipo === 'produto' ? item.setor : item.registro.setor?.nome ?? 'Setor indisponível'}</Text>
    {item.tipo === 'produto' ? <Text style={styles.texto}>{item.descricao}</Text> : <>
      <Text style={[styles.tipo, item.registro.movimento.tipo === 'entrada' ? styles.entrada : styles.saida]}>
        {item.registro.movimento.tipo === 'entrada' ? 'Entrada +' : 'Saída -'}{numero(item.registro.movimento.quantidade)}
      </Text>
      <Text style={styles.texto}>{data(item.registro.movimento.criadoEm)}</Text>
      <Text style={styles.texto}>{item.registro.movimento.observacao || 'Sem observação'}</Text>
    </>}
    {produto ? <Pressable accessibilityRole="button" accessibilityLabel={'Ver detalhes de ' + produto.nome}
      style={styles.detalhes} onPress={() => abrir(produto)}><Text style={styles.link}>Ver detalhes do produto</Text></Pressable> : null}
  </View>;
});

export default function RelatoriosScreen({ navigation }: BottomTabScreenProps<AuthenticatedTabParamList, 'Relatorios'>) {
  const [padrao] = useState(periodoPadrao);
  const [inicial, setInicial] = useState(padrao.inicial), [final, setFinal] = useState(padrao.final);
  const [periodo, setPeriodo] = useState(() => construirIntervaloRelatorio(padrao.inicial, padrao.final));
  const [erroPeriodo, setErroPeriodo] = useState<string | null>(null);
  const [setorId, setSetorId] = useState<string>(), [produtoId, setProdutoId] = useState<string>();
  const [tipo, setTipo] = useState<TipoMovimentacao>();
  const { estado, estabelecimentoId, tentarNovamente } = useRelatorios(periodo);
  const dados = estado.status === 'data' ? estado.dados : undefined;
  const calculo = useMemo(() => {
    if (!dados) return {};
    try { return { resultado: agregarRelatorio(estabelecimentoId, dados, { ...periodo, setorId, produtoId, tipo }) }; }
    catch (e) { return { erro: mensagemErroRelatorio(e) }; }
  }, [dados, estabelecimentoId, periodo, setorId, produtoId, tipo]);
  const resultado = calculo.resultado;
  const produtos = useMemo(() => dados?.produtos.filter(p => !setorId || p.setorId === setorId)
    .slice().sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR')) ?? [], [dados, setorId]);
  const setores = useMemo(() => dados?.setores.slice().sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR')) ?? [], [dados]);
  const abrir = useCallback((produto: Produto) => {
    const setor = dados?.setores.find(s => s.id === produto.setorId);
    if (setor && produto.estabelecimentoId === estabelecimentoId && setor.estabelecimentoId === estabelecimentoId) {
      navigation.navigate('Estoque', { screen: 'ProdutoDetalhes', params: { setor: dadosDeRota(setor), produtoId: produto.id }, initial: false });
    }
  }, [navigation, dados, estabelecimentoId]);
  const renderItem = useCallback(({ item }: { item: Linha }) => <LinhaResultado item={item} abrir={abrir} />, [abrir]);
  const secoes = useMemo<Secao[]>(() => {
    if (!resultado) return [];
    const setorNome = (p: Produto) => resultado.setorPorId.get(p.setorId)?.nome ?? 'Setor indisponível';
    const produtoLinha = (p: Produto, prefixo: string, descricao: string): Linha => ({ tipo: 'produto', produto: p, setor: setorNome(p), id: prefixo + p.id, descricao });
    return [
      { titulo: 'Entradas e saídas por setor', descricao: 'Totais do período com todos os filtros aplicados.', vazio: 'Nenhum setor movimentado para os filtros selecionados.',
        data: resultado.porSetor.map(s => ({ tipo: 'setor', id: 'setor:' + s.setorId, nome: s.nome, entradas: s.entradas, saidas: s.saidas })) },
      { titulo: 'Maior entrada', descricao: 'Total de entradas por produto, do maior para o menor. Empates: nome e ID.', vazio: 'Nenhuma entrada para os filtros selecionados.',
        data: resultado.maioresEntradas.map((r,i) => produtoLinha(r.produto, 'entrada:', (i + 1) + 'º • Total de entradas: ' + numero(r.quantidade))) },
      { titulo: 'Maior saída', descricao: 'Total de saídas por produto, do maior para o menor. Empates: nome e ID.', vazio: 'Nenhuma saída para os filtros selecionados.',
        data: resultado.maioresSaidas.map((r,i) => produtoLinha(r.produto, 'saida:', (i + 1) + 'º • Total de saídas: ' + numero(r.quantidade))) },
      { titulo: 'Produtos sem movimentação', descricao: 'Sem entrada nem saída no período. Respeita setor e produto; independe do filtro de tipo.',
        vazio: produtos.some(p => !produtoId || p.id === produtoId) ? 'Todos os produtos tiveram movimentação no período.' : 'Nenhum produto cadastrado para esta seleção.',
        data: resultado.semMovimentacao.map(p => produtoLinha(p, 'sem:', 'Estoque atual: ' + numero(p.estoqueAtual))) },
      { titulo: 'Produtos para reposição', descricao: 'Estoque atual menor ou igual ao mínimo definido. Período e tipo não se aplicam.', vazio: 'Nenhum produto precisa de reposição.',
        data: resultado.reposicao.map(p => produtoLinha(p, 'reposicao:', 'Estoque atual: ' + numero(p.estoqueAtual) + ' • Mínimo: ' + numero(p.estoqueMinimo ?? 0))) },
      { titulo: 'Estoque zerado', descricao: 'Estado atual. Respeita setor e produto; período e tipo não se aplicam.', vazio: 'Nenhum produto com estoque zerado.',
        data: resultado.zerados.map(p => produtoLinha(p, 'zero:', 'Estoque atual: 0')) },
      { titulo: 'Movimentações do período', descricao: 'Mais recentes primeiro, com todos os filtros aplicados.', vazio: 'Nenhuma movimentação encontrada para os filtros selecionados.',
        data: resultado.movimentos.map(registro => ({ tipo: 'movimento', registro, id: 'movimento:' + registro.movimento.id })) },
    ];
  }, [resultado, produtos, produtoId]);
  function aplicarPeriodo() {
    try { setPeriodo(construirIntervaloRelatorio(inicial, final)); setErroPeriodo(null); }
    catch (e) { setErroPeriodo(mensagemErroRelatorio(e)); }
  }
  function limpar() {
    const novo = periodoPadrao();
    setInicial(novo.inicial); setFinal(novo.final); setPeriodo(construirIntervaloRelatorio(novo.inicial, novo.final));
    setSetorId(undefined); setProdutoId(undefined); setTipo(undefined); setErroPeriodo(null);
  }
  const ultimoDia = new Date(periodo.fimExclusivo.getFullYear(), periodo.fimExclusivo.getMonth(), periodo.fimExclusivo.getDate() - 1);
  const cabecalho = <View>
    <Text style={styles.titulo}>Relatórios</Text>
    <Text style={styles.texto}>Analise quantidades por período e o estoque atual.</Text>
    <Text style={authStyles.label}>Data inicial (DD/MM/AAAA)</Text>
    <TextInput accessibilityLabel="Data inicial" style={authStyles.input} value={inicial} maxLength={10}
      placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" onChangeText={t => { setInicial(t); setErroPeriodo(null); }} />
    <Text style={authStyles.label}>Data final (DD/MM/AAAA)</Text>
    <TextInput accessibilityLabel="Data final" style={authStyles.input} value={final} maxLength={10}
      placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" onChangeText={t => { setFinal(t); setErroPeriodo(null); }} />
    <Text style={styles.texto}>Inclui todo o último dia, no fuso horário deste dispositivo.</Text>
    {erroPeriodo ? <Text accessibilityRole="alert" style={authStyles.error}>{erroPeriodo}</Text> : null}
    <FormButton label="Aplicar período" onPress={aplicarPeriodo} />
    <FiltroSelecao titulo="Setor" todos="Todos os setores" opcoes={setores} valor={setorId} disabled={!dados}
      onChange={id => { setSetorId(id); setProdutoId(undefined); }} />
    <FiltroSelecao titulo="Produto" todos="Todos os produtos" opcoes={produtos} valor={produtoId} disabled={!dados} onChange={setProdutoId} />
    <Text style={authStyles.label}>Tipo de movimentação</Text>
    <View style={styles.tipos}>
      {([{ valor: undefined, nome: 'Todos' }, { valor: 'entrada', nome: 'Entrada' }, { valor: 'saida', nome: 'Saída' }] as const).map(o =>
        <Pressable key={o.nome} accessibilityRole="button" accessibilityLabel={'Tipo: ' + o.nome}
          accessibilityState={{ selected: tipo === o.valor }} style={[styles.opcaoTipo, tipo === o.valor ? styles.selecionado : null]}
          onPress={() => setTipo(o.valor)}><Text style={tipo === o.valor ? styles.selecionadoTexto : styles.link}>{o.nome}</Text></Pressable>)}
    </View>
    <FormButton label="Limpar filtros" link onPress={limpar} />
    <Text style={styles.periodo}>Período aplicado: {formatarDiaLocal(periodo.inicio)} a {formatarDiaLocal(ultimoDia)}</Text>
    {estado.status === 'loading' ? <Text style={styles.texto}>Carregando relatório...</Text> : null}
    {estado.status === 'error' || calculo.erro ? <View>
      <Text accessibilityRole="alert" style={authStyles.error}>{estado.status === 'error' ? estado.mensagem : calculo.erro}</Text>
      <FormButton label="Tentar novamente" onPress={tentarNovamente} />
    </View> : null}
    {dados?.emCache ? <Text style={styles.aviso}>Dados em cache ou aguardando sincronização. Podem estar desatualizados ou incompletos.</Text> : null}
    {resultado ? <>
      <Text style={styles.subtitulo}>Resumo de movimentações</Text>
      <View style={styles.resumo}>
        {[
          ['Total de entradas', resultado.resumo.totalEntradas], ['Total de saídas', resultado.resumo.totalSaidas],
          ['Saldo do período', resultado.resumo.saldoPeriodo], ['Movimentações', resultado.resumo.quantidadeMovimentacoes],
          ['Produtos movimentados', resultado.resumo.produtosMovimentados],
        ].map(([label, valor]) => <View key={label} style={styles.metrica} accessible accessibilityLabel={label + ': ' + numero(Number(valor))}>
          <Text style={styles.texto}>{label}</Text><Text style={styles.valor}>{numero(Number(valor))}</Text>
        </View>)}
      </View>
      <Text style={styles.texto}>Saldo do período = entradas − saídas. Esse valor não representa necessariamente o estoque atual. Produtos movimentados são produtos distintos.</Text>
    </> : null}
  </View>;
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.area}>
    <KeyboardAvoidingView style={styles.area} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
      <SectionList<Linha, Secao> sections={secoes} keyExtractor={chave} renderItem={renderItem}
        contentContainerStyle={styles.conteudo} ListHeaderComponent={cabecalho} stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled" initialNumToRender={10}
        renderSectionHeader={({ section }) => <View style={styles.secao}>
          <Text style={styles.subtitulo}>{section.titulo}</Text><Text style={styles.texto}>{section.descricao}</Text>
          {!section.data.length ? <Text style={styles.vazio}>{section.vazio}{dados?.emCache ? ' O cache pode estar incompleto.' : ''}</Text> : null}
        </View>} />
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: '#F5F5F5' }, conteudo: { padding: 20, paddingBottom: 32 },
  titulo: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 12 },
  subtitulo: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 8 },
  texto: { fontSize: 15, lineHeight: 22, color: '#555', marginBottom: 12 }, periodo: { fontSize: 16, color: '#222', fontWeight: '600', marginBottom: 16 },
  aviso: { fontSize: 15, lineHeight: 22, color: '#714900', backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 16 },
  tipos: { flexDirection: 'row', gap: 8, marginBottom: 12 }, opcaoTipo: { flex: 1, minHeight: 48, borderRadius: 10, borderWidth: 1,
    borderColor: '#1565C0', alignItems: 'center', justifyContent: 'center', padding: 8 }, selecionado: { backgroundColor: '#1565C0' },
  selecionadoTexto: { fontSize: 16, color: '#FFF', fontWeight: '600' }, link: { color: '#1565C0', fontSize: 16, fontWeight: '600' },
  resumo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  metrica: { flexBasis: '47%', flexGrow: 1, backgroundColor: '#FFF', padding: 14, borderRadius: 12 },
  valor: { fontSize: 26, color: '#1565C0', fontWeight: '700' }, secao: { marginTop: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#DDD', padding: 16, marginBottom: 12 },
  nome: { fontSize: 18, color: '#111', fontWeight: '700', marginBottom: 8 },
  tipo: { fontSize: 18, fontWeight: '700', marginBottom: 10 }, entrada: { color: '#1565C0' }, saida: { color: '#A31818' },
  detalhes: { minHeight: 48, justifyContent: 'center', marginTop: 4 }, vazio: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 12 },
});
