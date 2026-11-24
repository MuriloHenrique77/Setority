/**
 * Verifica se uma quantidade é finita, inteira e não negativa.
 * Depende somente de Number do JavaScript e não consulta serviços.
 * Não há uso deste utilitário no fluxo atual; produtos e movimentos usam inteiroEstoque.
 */

export function quantidadeInteiraNaoNegativa(quantidade: number): boolean {
  return Number.isFinite(quantidade) && Number.isInteger(quantidade) && quantidade >= 0;
}
