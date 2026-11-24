/**
 * Define o perfil que associa uma conta autenticada a um estabelecimento.
 * Não depende de serviços; o conversor de onboarding o fornece a SessionProvider.
 * O perfil atual contém ID, e-mail e vínculo, sem campo de papel ou gestão de membros.
 */

/** Perfil da aplicação, separado do User interno do Firebase Authentication. */
export type Usuario = {
  id: string;
  email: string;
  estabelecimentoId: string;
};
