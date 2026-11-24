/**
 * Centraliza os nomes das cinco coleções usadas pelos serviços do Firestore.
 * Não depende de telas nem abre conexão; os serviços usam estas constantes ao montar caminhos.
 * Na implementação atual, as coleções ficam no nível principal do banco.
 */

export const COLLECTIONS = {
  usuarios: 'usuarios',
  estabelecimentos: 'estabelecimentos',
  setores: 'setores',
  produtos: 'produtos',
  movimentacoes: 'movimentacoes',
} as const;

export type NomeColecao = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
