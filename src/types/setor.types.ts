/**
 * Define os dados de um setor disponível no aplicativo.
 * Não depende de serviços; conversores, listas e rotas compartilham este formato com datas Date.
 */

export type Setor = {
  id: string;
  estabelecimentoId: string;
  nome: string;
  descricao?: string;
  criadoEm: Date;
  atualizadoEm?: Date;
};
