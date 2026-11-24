/**
 * Substitui movimentacoesService.ts na versão web durante o desenvolvimento.
 * Depende dos contratos de tipos usados pelo serviço, sem importar o SDK nativo.
 * Devolve indisponibilidade ao chamador; não consulta nem modifica dados no Firestore.
 */

import type { ContextoProdutos } from '../../utils/produtos';
import type { DadosMovimentacao, DadosEntrada } from '../../utils/movimentacoes';
import type { Movimentacao } from '../../types/movimentacao.types';
function indisponivel() { return new Error('Movimentações estão disponíveis no aplicativo Android.'); }
export function observarMovimentacoesProduto(_c: ContextoProdutos, _p: string, _s: string, _r: (m: Movimentacao[]) => void, erro: (e: unknown) => void): () => void { erro(indisponivel()); return () => {}; }
export async function registrarEntrada(_c: ContextoProdutos, _p: string, _s: string, _d: DadosEntrada): Promise<void> { throw indisponivel(); }
export async function registrarSaida(_c: ContextoProdutos, _p: string, _s: string, _d: DadosMovimentacao): Promise<void> { throw indisponivel(); }

export async function editarMovimentacao(_c: ContextoProdutos, _p: string, _s: string, _id: string, _d: DadosMovimentacao): Promise<void> { throw indisponivel(); }
export async function excluirMovimentacao(_c: ContextoProdutos, _p: string, _s: string, _id: string): Promise<void> { throw indisponivel(); }
