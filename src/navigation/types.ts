import type { StackScreenProps } from '@react-navigation/stack';
import type { Setor } from '../types/setor.types';
import type { Produto } from '../types/produto.types';
import type { Movimentacao, TipoMovimentacao } from '../types/movimentacao.types';

export type DadosRota<T> = Omit<T, 'criadoEm' | 'atualizadoEm'>;

export type StockStackParamList = {
  Setores: undefined;
  Relatorios: undefined;
  SetorForm: { setor?: DadosRota<Setor> } | undefined;
  Produtos: { setor: DadosRota<Setor> };
  ProdutoForm: { setor: DadosRota<Setor>; produto?: DadosRota<Produto> };
  ProdutoDetalhes: { setor: DadosRota<Setor>; produtoId: string };
  MovimentacaoForm: { setor: DadosRota<Setor>; produtoId: string; tipo: TipoMovimentacao; movimentacao?: DadosRota<Movimentacao> };
};

export type StockScreenProps<RouteName extends keyof StockStackParamList> =
  StackScreenProps<StockStackParamList, RouteName>;
