/**
 * Define como reconhecer um produto ativo e explicar sua inativação.
 * Depende do tipo Produto; é usado por serviços, listas, ações de ciclo e relatórios.
 * Produto antigo sem status conta como ativo; a validação impede movimentar um inativo.
 */

import type { Produto } from '../types/produto.types';

export function produtoAtivo(produto: { status?: string }): boolean { return produto.status === undefined || produto.status === 'ativo'; }
export function validarProdutoAtivo(produto: { status?: string }): void {
  if (!produtoAtivo(produto)) throw new Error('Produto inativo. Reative-o antes de alterar movimentações.');
}
export function mensagemInativacao(produto: Pick<Produto, 'estoqueAtual'>): string {
  return `O produto sairá das listas normais. Seu histórico e estoque serão preservados. Nenhuma nova movimentação será permitida até a reativação.${produto.estoqueAtual > 0 ? ` Este produto ainda possui ${produto.estoqueAtual} ${produto.estoqueAtual === 1 ? 'unidade' : 'unidades'} em estoque.` : ''}`;
}
