/**
 * Papel da pasta (src/services/produtos): reúne leitura por setor, cadastro, edição, inativação e acompanhamento de produtos.
 * Lê produtos por setor e grava cadastro, edição e mudanças entre ativo/inativo.
 * Depende de Auth/Firestore, conversor de produto e utils/produtos.
 * Os hooks recebem atualizações; o cadastro grava produto, entrada inicial e contador juntos.
 */

import { collection, doc, query, where, onSnapshot, writeBatch, serverTimestamp, increment,
  updateDoc, deleteField, getDocsFromServer, runTransaction, limit } from '@react-native-firebase/firestore';
import { obterAuth } from '../firebase/auth';
import { obterFirestore } from '../firebase/firestore';
import { COLLECTIONS } from '../firebase/collections';
import { converterProduto } from '../firebase/converters/produto';
import { normalizarNovoProduto, normalizarEdicaoProduto, ordenarProdutos } from '../../utils/produtos';
import type { ContextoProdutos, DadosNovoProduto, DadosEdicaoProduto } from '../../utils/produtos';
import type { Produto } from '../../types/produto.types';

function validarContexto(contexto: ContextoProdutos) {
  if (obterAuth().currentUser?.uid !== contexto.uid || !contexto.estabelecimentoId) throw new Error('Sessão inválida.');
}

// useProdutos acompanha somente o estabelecimento e o setor recebidos.
// Cada atualização confere a sessão, converte os documentos e ordena por nome.
// A função retornada encerra a escuta quando o hook perde foco ou muda de consulta.
export function observarProdutos(contexto: ContextoProdutos, setorId: string,
  receber: (produtos: Produto[]) => void, erro: (erro: unknown) => void): () => void {
  validarContexto(contexto);
  const consulta = query(collection(obterFirestore(), COLLECTIONS.produtos),
    where('estabelecimentoId', '==', contexto.estabelecimentoId), where('setorId', '==', setorId));
  return onSnapshot(consulta, { includeMetadataChanges: true }, snapshot => {
    try {
      validarContexto(contexto);
      receber(ordenarProdutos(snapshot.docs.map(d => converterProduto(
        d.data({ serverTimestamps: 'estimate' }), d.id, contexto.estabelecimentoId, setorId, d.metadata.hasPendingWrites))));
    } catch (e) { erro(e); }
  }, erro);
}

// A exclusão de setor procura no servidor apenas um produto vinculado, incluindo inativos.
// O limite reduz a leitura: encontrar um documento já basta para bloquear a remoção.
export async function setorPossuiProdutos(contexto: ContextoProdutos, setorId: string): Promise<boolean> {
  validarContexto(contexto);
  const resultado = await getDocsFromServer(query(collection(obterFirestore(), COLLECTIONS.produtos),
    where('estabelecimentoId', '==', contexto.estabelecimentoId), where('setorId', '==', setorId), limit(1)));
  validarContexto(contexto);
  return !resultado.empty;
}

// O formulário fornece setor e quantidades já lidas como inteiros; o serviço valida novamente.
// O batch é um lote que grava tudo ou nada: produto, projeção e incremento do contador do setor.
// Se a inicial for positiva, inclui a entrada inicial com ID previsível e data do mesmo commit.
// Se for zero, não cria movimento. As regras de segurança validam o conjunto antes de confirmar.
export async function criarProduto(contexto: ContextoProdutos, setorId: string, dados: DadosNovoProduto): Promise<void> {
  validarContexto(contexto);
  const normalizado = normalizarNovoProduto(dados);
  const db = obterFirestore();
  const produto = doc(collection(db, COLLECTIONS.produtos));
  const inicialId = `inicial_${produto.id}`;
  const batch = writeBatch(db);
  batch.set(produto, { id: produto.id, estabelecimentoId: contexto.estabelecimentoId, setorId, ...normalizado,
    status: 'ativo', inativadoEm: null, inativadoPor: null, possuiHistorico: normalizado.quantidadeInicial > 0,
    estoqueAtual: normalizado.quantidadeInicial, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
    quantidadeMovimentacoes: normalizado.quantidadeInicial > 0 ? 1 : 0,
    movimentacaoIds: normalizado.quantidadeInicial > 0 ? [inicialId] : [],
    ...(normalizado.quantidadeInicial > 0 ? { ultimaMovimentacaoId: inicialId } : {}) });
  if (normalizado.quantidadeInicial > 0) {
    batch.set(doc(db, COLLECTIONS.movimentacoes, `inicial_${produto.id}`), {
      id: inicialId, estabelecimentoId: contexto.estabelecimentoId, produtoId: produto.id, setorId, tipo: 'entrada',
      quantidade: normalizado.quantidadeInicial, observacao: 'Estoque inicial', criadoPor: contexto.uid,
      criadoEm: serverTimestamp(),
    });
  }
  // Incremento atômico evita perder contagens em cadastros concorrentes; Rules validam o produto relacionado.
  batch.update(doc(db, COLLECTIONS.setores, setorId), {
    quantidadeProdutos: increment(1), ultimaOperacaoProdutoId: produto.id, atualizadoEm: serverTimestamp(),
  });
  await batch.commit();
}

// A edição altera apenas nome, descrição e mínimo. Não troca setor, inicial ou saldo.
// Campos opcionais vazios são removidos com deleteField; a escuta atualiza a tela após a escrita.
export async function atualizarProduto(contexto: ContextoProdutos, id: string, dados: DadosEdicaoProduto): Promise<void> {
  validarContexto(contexto);
  const normalizado = normalizarEdicaoProduto(dados);
  await updateDoc(doc(obterFirestore(), COLLECTIONS.produtos, id), { nome: normalizado.nome,
    descricao: normalizado.descricao ?? deleteField(), estoqueMinimo: normalizado.estoqueMinimo ?? deleteField(),
    atualizadoEm: serverTimestamp() });
}

// A ação confirmada de inativar/reativar relê o produto em uma transação no servidor.
// Confere sessão, estabelecimento e estado atual; recusa repetir a mesma transição.
// Grava apenas status e auditoria de inativação, preservando saldo, histórico e contador do setor.
async function alterarStatus(contexto: ContextoProdutos, id: string, status: Produto['status']): Promise<void> {
  validarContexto(contexto);
  const db = obterFirestore();
  const referencia = doc(db, COLLECTIONS.produtos, id);
  await runTransaction(db, async t => {
    validarContexto(contexto);
    const snapshot = await t.get(referencia), dados = snapshot.data();
    if (!snapshot.exists() || dados?.estabelecimentoId !== contexto.estabelecimentoId) throw new Error('Produto não encontrado nesta sessão.');
    const produto = converterProduto(dados, id, contexto.estabelecimentoId, dados.setorId);
    if (produto.status === status) throw new Error(status === 'ativo' ? 'Este produto já está ativo.' : 'Este produto já está inativo.');
    validarContexto(contexto);
    t.update(referencia, { status, inativadoEm: status === 'inativo' ? serverTimestamp() : null,
      inativadoPor: status === 'inativo' ? contexto.uid : null, atualizadoEm: serverTimestamp() });
  });
}
export function inativarProduto(c: ContextoProdutos, id: string): Promise<void> { return alterarStatus(c, id, 'inativo'); }
export function reativarProduto(c: ContextoProdutos, id: string): Promise<void> { return alterarStatus(c, id, 'ativo'); }
