/**
 * Papel da pasta (src/types): define os formatos de dados compartilhados entre telas, serviços e utilitários.
 * Representa o estabelecimento carregado na resolução da sessão.
 * Não depende de serviços; o conversor de onboarding cria este formato para sessão e telas.
 */

export type Estabelecimento = {
  id: string;
  nome: string;
  criadoEm: Date;
  criadoPor: string;
};
