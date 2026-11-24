/**
 * Define os dados do produto, seu saldo projetado e seu estado ativo/inativo.
 * Não depende de serviços; é compartilhado por conversores, serviços, telas e relatórios.
 */

/** Estoque atual é derivado das movimentações, nunca um saldo editável. */
export type Produto = {
  id: string;
  estabelecimentoId: string;
  setorId: string;
  nome: string;
  descricao?: string;
  quantidadeInicial: number;
  estoqueMinimo?: number;
  status: 'ativo' | 'inativo';
  inativadoEm: Date | null;
  inativadoPor: string | null;
  /** Ausente somente no legado: distingue ausência do marcador de um false explícito. */
  readonly possuiHistorico?: boolean;
  /** Projeção persistida, mantida atomicamente com as movimentações. */
  readonly estoqueAtual: number;
  criadoEm: Date;
  atualizadoEm?: Date;
};
