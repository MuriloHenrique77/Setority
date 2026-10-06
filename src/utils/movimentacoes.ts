import type { Movimentacao, TipoMovimentacao } from '../types/movimentacao.types';
import { inteiroEstoque } from './produtos';

// Orçamento de leituras das Rules; não é um limite para registrar movimentações.
export const LIMITE_CASCADE_MOVIMENTACOES = 6;
export type DadosMovimentacao = { quantidade: number; observacao?: string };
export type RegistroMovimentacoes = { quantidadeMovimentacoes: number; movimentacaoIds: string[]; ultimaMovimentacaoId?: string };
const idValido = (valor: unknown): valor is string => typeof valor === 'string' &&
  (/^[a-zA-Z0-9_-]{1,128}$/.test(valor) || /^inicial_[a-zA-Z0-9_-]{1,128}$/.test(valor));

export function normalizarMovimentacao(dados: DadosMovimentacao): DadosMovimentacao {
  if (!inteiroEstoque(dados.quantidade) || dados.quantidade === 0) throw new Error('A quantidade deve ser um inteiro maior que zero, até 9007199254740991.');
  const observacao = dados.observacao?.trim();
  if (observacao && observacao.length > 2000) throw new Error('A observação deve ter no máximo 2000 caracteres.');
  return { quantidade: dados.quantidade, ...(observacao ? { observacao } : {}) };
}

export function calcularNovoEstoque(estoque: number, tipo: TipoMovimentacao, quantidade: number): number {
  normalizarMovimentacao({ quantidade });
  if (!inteiroEstoque(estoque) || (tipo !== 'entrada' && tipo !== 'saida')) throw new Error('Dados de estoque inválidos.');
  if (tipo === 'saida' && quantidade > estoque) throw new Error('Estoque insuficiente.');
  const resultado = tipo === 'entrada' ? estoque + quantidade : estoque - quantidade;
  if (!inteiroEstoque(resultado)) throw new Error('O estoque resultante excede o limite de inteiros seguros.');
  return resultado;
}

export function lerRegistroMovimentacoes(d: Record<string, unknown>, id: string): RegistroMovimentacoes {
  const inicial = typeof d.quantidadeInicial === 'number' && d.quantidadeInicial > 0 ? [`inicial_${id}`] : [];
  const campos = ['quantidadeMovimentacoes', 'movimentacaoIds', 'ultimaMovimentacaoId'];
  if (campos.every(c => d[c] === undefined)) return { quantidadeMovimentacoes: inicial.length, movimentacaoIds: inicial,
    ...(inicial.length ? { ultimaMovimentacaoId: inicial[0] } : {}) };
  const count = d.quantidadeMovimentacoes, ids = d.movimentacaoIds, ultima = d.ultimaMovimentacaoId;
  if (!inteiroEstoque(count) || !Array.isArray(ids) || ids.length > Math.min(count, LIMITE_CASCADE_MOVIMENTACOES) ||
      ids.some(v => !idValido(v)) || new Set(ids).size !== ids.length ||
      (ultima !== undefined ? !idValido(ultima) : count > 0)) {
    throw new Error('Registro de movimentações inválido.');
  }
  return { quantidadeMovimentacoes: count, movimentacaoIds: ids as string[], ...(typeof ultima === 'string' ? { ultimaMovimentacaoId: ultima } : {}) };
}

export function acrescentarMovimentacao(registro: RegistroMovimentacoes, id: string): RegistroMovimentacoes {
  if (!idValido(id) || registro.movimentacaoIds.includes(id) || !inteiroEstoque(registro.quantidadeMovimentacoes + 1)) throw new Error('Registro de movimentações inválido.');
  return { quantidadeMovimentacoes: registro.quantidadeMovimentacoes + 1,
    movimentacaoIds: registro.movimentacaoIds.length < LIMITE_CASCADE_MOVIMENTACOES ? [...registro.movimentacaoIds, id] : registro.movimentacaoIds,
    ultimaMovimentacaoId: id };
}

export function validarCascade(registro: RegistroMovimentacoes, ids: readonly string[]): void {
  if (registro.quantidadeMovimentacoes > LIMITE_CASCADE_MOVIMENTACOES || ids.length > LIMITE_CASCADE_MOVIMENTACOES) {
    throw new Error('Este produto possui um histórico extenso e não pode ser excluído diretamente pelo aplicativo. Você pode continuar registrando e alterando suas movimentações. Nenhum dado foi removido.');
  }
  if (ids.length !== registro.quantidadeMovimentacoes || registro.movimentacaoIds.length !== registro.quantidadeMovimentacoes || registro.movimentacaoIds.some(id => !ids.includes(id))) {
    throw new Error('Não foi possível confirmar a exclusão completa do histórico. Atualize e tente novamente. Se o produto já teve um histórico extenso, remova suas movimentações individualmente antes de excluir o produto. Nenhum dado foi removido.');
  }
}

export function ordenarMovimentacoes(movs: readonly Movimentacao[]): Movimentacao[] {
  return [...movs].sort((a,b) => b.criadoEm.getTime() - a.criadoEm.getTime() || b.id.localeCompare(a.id));
}

export function mensagemErroMovimentacao(erro: unknown, alteracao = false): string {
  const codigo = typeof erro === 'object' && erro !== null && 'code' in erro ? String(erro.code) : '';
  // Android pode encapsular UNAVAILABLE da leitura da transaction como unknown.
  const indisponivelEncapsulado = codigo === 'firestore/unknown' && erro instanceof Error && /\bUNAVAILABLE:/.test(erro.message);
  if (codigo.includes('unavailable') || codigo.includes('deadline-exceeded') || indisponivelEncapsulado) return alteracao ? 'É necessária conexão para alterar movimentações.' : 'É necessária conexão para registrar esta movimentação.';
  if (codigo.includes('permission-denied')) return 'Movimentação não autorizada. Confira sua sessão e tente novamente.';
  if (codigo.includes('aborted')) return 'O estoque mudou durante a operação. Tente novamente.';
  return erro instanceof Error && !codigo ? erro.message : (alteracao ? 'Não foi possível alterar a movimentação. Tente novamente.' : 'Não foi possível registrar a movimentação. Tente novamente.');
}

/** Substitui a contribuição antiga; nunca soma a antiga e a nova simultaneamente. */
export function calcularEstoqueEdicao(estoque: number, tipo: TipoMovimentacao, antiga: number, nova: number): number {
  normalizarMovimentacao({ quantidade: antiga }); normalizarMovimentacao({ quantidade: nova });
  if (!inteiroEstoque(estoque) || !['entrada', 'saida'].includes(tipo)) throw new Error('Dados de estoque inválidos.');
  const saldo = estoque + (tipo === 'entrada' ? nova - antiga : antiga - nova);
  if (saldo < 0) throw new Error('Não é possível editar esta movimentação porque o estoque ficaria negativo.');
  if (!inteiroEstoque(saldo)) throw new Error('O estoque resultante excede o limite de inteiros seguros.');
  return saldo;
}
export function calcularEstoqueExclusao(estoque: number, tipo: TipoMovimentacao, quantidade: number): number {
  normalizarMovimentacao({ quantidade });
  if (tipo === 'entrada' && estoque < quantidade) throw new Error('Não é possível excluir esta entrada porque o estoque ficaria negativo.');
  return calcularNovoEstoque(estoque, tipo === 'entrada' ? 'saida' : 'entrada', quantidade);
}
export function retirarMovimentacao(registro: RegistroMovimentacoes, id: string): RegistroMovimentacoes {
  if (!idValido(id) || registro.quantidadeMovimentacoes < 1) throw new Error('Registro de movimentações inválido.');
  return { quantidadeMovimentacoes: registro.quantidadeMovimentacoes - 1,
    movimentacaoIds: registro.movimentacaoIds.filter(v => v !== id), ultimaMovimentacaoId: id };
}
