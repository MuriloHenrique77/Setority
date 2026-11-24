/**
 * Papel da pasta (src/services/relatorios): reúne as consultas por estabelecimento e período e seu acompanhamento pelas telas.
 * Reúne os dados lidos do Firestore quando o relatório está em foco.
 * Depende de Auth, collections, conversores e validação de período.
 * Entrega produtos, setores e movimentos a useRelatorios; utils/relatorios calcula os resultados.
 */

import { collection, query, where, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { obterAuth } from '../firebase/auth';
import { obterFirestore } from '../firebase/firestore';
import { COLLECTIONS } from '../firebase/collections';
import { converterProduto } from '../firebase/converters/produto';
import { converterSetor } from '../firebase/converters/setor';
import { converterMovimentacao } from '../firebase/converters/movimentacao';
import type { ContextoProdutos } from '../../utils/produtos';
import type { DadosRelatorio, IntervaloRelatorio } from '../../types/relatorio.types';
import { validarIntervaloRelatorio } from '../../utils/periodoRelatorio';

// O hook abre três escutas: catálogo de produtos, setores e movimentos do período.
// Publica somente depois de receber as três, sem buscar documento por linha do relatório.
// Cache ou escrita pendente em qualquer parte sinaliza emCache. Uma falha cancela todas;
// parar pode ser chamado mais de uma vez e respostas após o encerramento são ignoradas.
export function observarRelatorio(c: ContextoProdutos, periodo: IntervaloRelatorio,
  receber: (dados: DadosRelatorio) => void, erro: (erro: unknown) => void): () => void {
  function validarSessao() {
    if (!c.estabelecimentoId || obterAuth().currentUser?.uid !== c.uid) throw new Error('Sessão inválida.');
  }
  validarSessao(); validarIntervaloRelatorio(periodo);
  const db = obterFirestore();
  const dados: Partial<DadosRelatorio> = {};
  const cache = { produtos: true, setores: true, movimentos: true };
  const listeners: Array<() => void> = [];
  let ativo = true;
  function parar() { ativo = false; for (const unsubscribe of listeners.splice(0)) unsubscribe(); }
  function registrar(iniciar: () => () => void) {
    if (!ativo) return;
    const unsubscribe = iniciar();
    if (ativo) listeners.push(unsubscribe); else unsubscribe();
  }
  function falhar(e: unknown) { if (ativo) { parar(); erro(e); } }
  function publicar() {
    validarSessao();
    if (ativo && dados.produtos && dados.setores && dados.movimentos) receber({
      produtos: dados.produtos, setores: dados.setores, movimentos: dados.movimentos,
      emCache: cache.produtos || cache.setores || cache.movimentos,
    });
  }
  try {
    registrar(() => onSnapshot(query(collection(db, COLLECTIONS.produtos),
      where('estabelecimentoId', '==', c.estabelecimentoId)), { includeMetadataChanges: true }, snapshot => {
      if (!ativo) return;
      try {
        validarSessao();
        dados.produtos = snapshot.docs.map(d => {
          const data: Record<string, unknown> = d.data({ serverTimestamps: 'estimate' });
          if (typeof data.setorId !== 'string') throw new Error('Vínculo do produto inválido.');
          return converterProduto(data, d.id, c.estabelecimentoId, data.setorId, d.metadata.hasPendingWrites);
        });
        cache.produtos = snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites;
        publicar();
      } catch (e) { falhar(e); }
    }, falhar));
    registrar(() => onSnapshot(query(collection(db, COLLECTIONS.setores),
      where('estabelecimentoId', '==', c.estabelecimentoId)), { includeMetadataChanges: true }, snapshot => {
      if (!ativo) return;
      try {
        validarSessao();
        dados.setores = snapshot.docs.map(d => converterSetor(d.data({ serverTimestamps: 'estimate' }),
          d.id, c.estabelecimentoId, d.metadata.hasPendingWrites));
        cache.setores = snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites;
        publicar();
      } catch (e) { falhar(e); }
    }, falhar));
    registrar(() => onSnapshot(query(collection(db, COLLECTIONS.movimentacoes),
      where('estabelecimentoId', '==', c.estabelecimentoId),
      where('criadoEm', '>=', periodo.inicio), where('criadoEm', '<', periodo.fimExclusivo),
      orderBy('criadoEm', 'desc')), { includeMetadataChanges: true }, snapshot => {
      if (!ativo) return;
      try {
        validarSessao();
        dados.movimentos = snapshot.docs.map(d => {
          const data: Record<string, unknown> = d.data({ serverTimestamps: 'estimate' });
          if (typeof data.produtoId !== 'string' || typeof data.setorId !== 'string') throw new Error('Vínculo da movimentação inválido.');
          return converterMovimentacao(data, d.id, c.estabelecimentoId, data.produtoId, data.setorId, d.metadata.hasPendingWrites);
        });
        cache.movimentos = snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites;
        publicar();
      } catch (e) { falhar(e); }
    }, falhar));
  } catch (e) { falhar(e); }
  return parar;
}
