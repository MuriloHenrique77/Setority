/**
 * Compartilha o estado de acesso com toda a aplicação desde sua montagem em App.
 * O contexto é um canal do React para compartilhar dados sem passá-los tela por tela.
 * Depende do serviço firebase/session e de resolverSessao; RootNavigator usa o resultado.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ContaAutenticada, SessionState } from '../types/session.types';
import { carregarPerfil, contaAtual, observarAutenticacao, sair } from '../services/firebase/session';
import { mensagemErroFirebase } from '../utils/auth';
import { resolverSessao } from './resolverSessao';

type SessionContextValue = {
  estado: SessionState;
  atualizarPerfil: () => Promise<void>;
  encerrarSessao: () => Promise<void>;
};
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: React.PropsWithChildren) {
  const [estado, setEstado] = useState<SessionState>({ status: 'loading' });
  const versao = useRef(0);
  const ativo = useRef(false);
  const saindo = useRef(false);

  // É chamada pelo aviso de autenticação ou por uma atualização manual do perfil.
  // Sem conta, libera o fluxo público. Com conta, aguarda perfil e estabelecimento.
  // Cada chamada recebe uma versão: respostas antigas não sobrescrevem uma sessão mais nova.
  const avaliar = useCallback(async (conta: ContaAutenticada | null) => {
    const atual = ++versao.current;
    if (!ativo.current) return;
    if (!conta) { setEstado({ status: 'unauthenticated' }); return; }
    setEstado({ status: 'loading' });
    const proximo = await resolverSessao(conta, carregarPerfil);
    if (ativo.current && atual === versao.current) setEstado(proximo);
  }, []);

  // Ao montar, registra um listener: uma função avisada sempre que a autenticação muda.
  // Ao desmontar, cancela a escuta e invalida leituras ainda pendentes.
  useEffect(() => {
    ativo.current = true;
    let unsubscribe: (() => void) | undefined;
    try { unsubscribe = observarAutenticacao(conta => { void avaliar(conta); }); }
    catch (erro) { setEstado({ status: 'error', mensagem: mensagemErroFirebase(erro) }); }
    return () => { ativo.current = false; ++versao.current; unsubscribe?.(); };
  }, [avaliar]);

  // O onboarding e a tentativa após erro pedem uma nova leitura com a conta atual.
  // A avaliação centralizada mantém a mesma proteção contra respostas atrasadas.
  const atualizarPerfil = useCallback(async () => {
    try { await avaliar(contaAtual()); }
    catch (erro) { if (ativo.current) setEstado({ status: 'error', mensagem: mensagemErroFirebase(erro) }); }
  }, [avaliar]);

  // O logout bloqueia toques repetidos e invalida a leitura do perfil antes de sair do Auth.
  // A navegação mostra espera; o aviso do Auth define o próximo estado. Falhas viram estado de erro.
  const encerrarSessao = useCallback(async () => {
    if (saindo.current) return;
    saindo.current = true;
    ++versao.current;
    setEstado({ status: 'loading' });
    try { await sair(); }
    catch (erro) { if (ativo.current) setEstado({ status: 'error', mensagem: mensagemErroFirebase(erro) }); }
    finally { saindo.current = false; }
  }, []);

  return <SessionContext.Provider value={{ estado, atualizarPerfil, encerrarSessao }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('SessionProvider ausente.');
  return context;
}
