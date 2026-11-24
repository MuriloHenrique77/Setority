/**
 * Define dados das consultas gerais, cartões de movimentos e contadores da Home.
 * Depende dos tipos de produto, setor e movimento; conecta serviços, utilitários e telas.
 */

import type { Produto } from './produto.types';
import type { Setor } from './setor.types';
import type { Movimentacao } from './movimentacao.types';
export type DadosVisaoEstoque = { produtos: Produto[]; setores: Setor[]; movimentos: Movimentacao[]; emCache: boolean };
export type MovimentoGlobal = { movimento: Movimentacao; produto?: Produto; setor?: Setor };
export type ResumoHome = { totalProdutos: number; totalSetores: number; totalReposicao: number; totalZerados: number };
