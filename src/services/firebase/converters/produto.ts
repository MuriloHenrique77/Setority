import { Timestamp } from '@react-native-firebase/firestore';
import type { Produto } from '../../../types/produto.types';
import { inteiroEstoque, normalizarNovoProduto } from '../../../utils/produtos';
import { lerRegistroMovimentacoes } from '../../../utils/movimentacoes';

export function converterProduto(dados: unknown, id: string, estabelecimentoId: string, setorId: string,
  pendente = false, dataEstimada = new Date()): Produto {
  if (!dados || typeof dados !== 'object') throw new Error('Produto inválido.');
  const d = dados as Record<string, unknown>;
  const campos = ['id', 'estabelecimentoId', 'setorId', 'nome', 'descricao', 'quantidadeInicial',
    'estoqueMinimo', 'estoqueAtual', 'criadoEm', 'atualizadoEm', 'quantidadeMovimentacoes',
    'movimentacaoIds', 'ultimaMovimentacaoId'];
  if (Object.keys(d).some(c => !campos.includes(c)) || d.id !== id || d.estabelecimentoId !== estabelecimentoId ||
      d.setorId !== setorId || typeof d.nome !== 'string' ||
      (d.descricao !== undefined && typeof d.descricao !== 'string') ||
      !inteiroEstoque(d.quantidadeInicial) || !inteiroEstoque(d.estoqueAtual) ||
      (d.estoqueMinimo !== undefined && !inteiroEstoque(d.estoqueMinimo))) throw new Error('Produto inválido.');
  const normalizado = normalizarNovoProduto({ nome: d.nome, descricao: d.descricao as string | undefined,
    quantidadeInicial: d.quantidadeInicial, estoqueMinimo: d.estoqueMinimo as number | undefined });
  lerRegistroMovimentacoes(d, id);
  function data(valor: unknown): Date {
    if (valor instanceof Timestamp) return valor.toDate();
    if (pendente && valor === null) return new Date(dataEstimada);
    throw new Error('Data do produto inválida.');
  }
  return { id, estabelecimentoId, setorId, ...normalizado, estoqueAtual: d.estoqueAtual,
    criadoEm: data(d.criadoEm), ...(d.atualizadoEm !== undefined ? { atualizadoEm: data(d.atualizadoEm) } : {}) };
}
