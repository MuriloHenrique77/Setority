/**
 * Substitui visaoEstoqueService.ts na versão web durante o desenvolvimento.
 * Depende dos contratos de tipos usados pelo serviço, sem importar o SDK nativo.
 * Devolve indisponibilidade ao chamador; não consulta nem modifica dados no Firestore.
 */

import type { ContextoProdutos } from '../../utils/produtos';
import type { DadosVisaoEstoque } from '../../types/visaoEstoque.types';
export function observarVisaoEstoque(_c: ContextoProdutos, _limit: number, _next: (dados: DadosVisaoEstoque) => void,
  erro: (e: unknown) => void): () => void {
  erro({ code: 'app/web-unavailable' }); return () => {};
}
