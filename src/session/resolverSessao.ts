/**
 * Papel da pasta (src/session): transforma a autenticação e o perfil no estado de acesso compartilhado pela aplicação.
 * Decide o estado de acesso quando SessionProvider recebe uma conta do Firebase Auth.
 * Usa a função de leitura de perfil recebida e utils/auth para traduzir falhas.
 * Devolve sessão pronta, primeiro acesso ou erro; a navegação escolhe a tela seguinte.
 */

import type { ContaAutenticada, SessionState } from '../types/session.types';
import type { Usuario } from '../types/usuario.types';
import type { Estabelecimento } from '../types/estabelecimento.types';
import { mensagemErroFirebase } from '../utils/auth';

// A sessão chama esta função para separar autenticação de autorização de acesso ao estoque.
// Conta válida sem perfil segue para onboarding; perfil e estabelecimento válidos liberam acesso.
// Falhas da leitura recebida viram estado de erro, sem liberar dados por engano.
export async function resolverSessao(
  conta: ContaAutenticada | null,
  carregar: (conta: ContaAutenticada) => Promise<{ perfil: Usuario; estabelecimento: Estabelecimento } | null>,
): Promise<SessionState> {
  if (!conta) return { status: 'unauthenticated' };
  try {
    const dados = await carregar(conta);
    return dados ? { status: 'authenticatedReady', conta, ...dados }
      : { status: 'authenticatedWithoutProfile', conta };
  } catch (erro) {
    return { status: 'error', mensagem: mensagemErroFirebase(erro) };
  }
}
