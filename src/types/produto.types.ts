/** Estoque atual é derivado das movimentações, nunca um saldo editável. */
export type Produto = {
  id: string;
  estabelecimentoId: string;
  setorId: string;
  nome: string;
  descricao?: string;
  quantidadeInicial: number;
  estoqueMinimo?: number;
  /** Projeção persistida, mantida atomicamente com as movimentações. */
  readonly estoqueAtual: number;
  criadoEm: Date;
  atualizadoEm?: Date;
};
