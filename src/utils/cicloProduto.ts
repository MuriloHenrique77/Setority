import type { Produto } from '../types/produto.types';

export const MENSAGEM_HISTORICO = 'Este produto possui histórico de movimentações e não pode ser excluído permanentemente. Você pode mantê-lo inativo para preservar o histórico.';
export const MENSAGEM_LEGADO = 'Não é possível comprovar que este produto antigo nunca teve movimentações. Mantenha-o inativo para preservar o histórico.';
export function produtoAtivo(produto: { status?: string }): boolean { return produto.status === undefined || produto.status === 'ativo'; }
export function validarProdutoAtivo(produto: { status?: string }): void {
  if (!produtoAtivo(produto)) throw new Error('Produto inativo. Reative-o antes de alterar movimentações.');
}
export function validarExclusaoPermanente(produto: { possuiHistorico?: boolean }): void {
  if (produto.possuiHistorico !== false) throw new Error(produto.possuiHistorico === true ? MENSAGEM_HISTORICO : MENSAGEM_LEGADO);
}
export function mensagemInativacao(produto: Pick<Produto, 'estoqueAtual'>): string {
  return `O produto sairá das listas normais. Seu histórico e estoque serão preservados. Nenhuma nova movimentação será permitida até a reativação.${produto.estoqueAtual > 0 ? ` Este produto ainda possui ${produto.estoqueAtual} unidades em estoque.` : ''}`;
}
