/**
 * Descreve os estados de acesso, da espera até a sessão pronta ou erro.
 * Depende dos tipos Usuario e Estabelecimento; SessionProvider e RootNavigator usam este contrato.
 */

import type { Usuario } from './usuario.types';
import type { Estabelecimento } from './estabelecimento.types';

export type ContaAutenticada = { uid: string; email: string };

export type SessionState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticatedWithoutProfile'; conta: ContaAutenticada }
  | { status: 'authenticatedReady'; conta: ContaAutenticada; perfil: Usuario; estabelecimento: Estabelecimento }
  | { status: 'error'; mensagem: string };
