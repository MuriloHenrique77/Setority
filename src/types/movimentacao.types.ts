/**
 * Define o registro do histórico e os campos que podem ser editados.
 * Não depende de serviços; conversores, cálculos, telas e navegação usam estes contratos.
 */

export type TipoMovimentacao = 'entrada' | 'saida';

export type Movimentacao = {
  id: string;
  estabelecimentoId: string;
  produtoId: string;
  setorId: string;
  readonly tipo: TipoMovimentacao;
  quantidade: number;
  observacao?: string;
  vendedorNome?: string;
  criadoPor: string;
  criadoEm: Date;
  atualizadoEm?: Date;
};

/** A edição não permite alterar tipo, produto ou estabelecimento. */
export type EdicaoMovimentacao = Pick<Movimentacao, 'quantidade' | 'observacao' | 'vendedorNome'>;
