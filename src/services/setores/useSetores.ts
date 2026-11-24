/**
 * Liga a lista de setores à sessão enquanto a tela está em foco.
 * Depende de SessionProvider, setoresService e utils/setores.
 * É um hook: uma função que reúne estado e efeitos do React para devolver dados, erro ou espera.
 */

import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSession } from '../../session/SessionProvider';
import { observarSetores } from './setoresService';
import { mensagemErroSetores } from '../../utils/setores';
import type { Setor } from '../../types/setor.types';

type EstadoLista = { status: 'loading' } | { status: 'data'; setores: Setor[] } | { status: 'error'; mensagem: string };
// Ao ganhar foco, abre a escuta de mudanças do Firestore; ao perder foco, cancela essa escuta.
// A chave reúne sessão e parâmetros da consulta. Se mudarem, dados antigos já ficam ocultos
// na renderização, antes da limpeza do efeito. O indicador ativo ignora respostas tardias.
// Tentar novamente aumenta tentativa e reinicia a consulta; erros são traduzidos para a tela.
export function useSetores() {
  const { estado: sessao } = useSession();
  const uid = sessao.status === 'authenticatedReady' ? sessao.conta.uid : '';
  const estabelecimentoId = sessao.status === 'authenticatedReady' ? sessao.perfil.estabelecimentoId : '';
  const chave = `${uid}:${estabelecimentoId}`;
  const [tentativa, setTentativa] = useState(0);
  const [lista, setLista] = useState<{ chave: string; estado: EstadoLista }>({ chave, estado: { status: 'loading' } });

  useFocusEffect(useCallback(() => {
    let ativo = true;
    let unsubscribe: (() => void) | undefined;
    setLista({ chave, estado: { status: 'loading' } });
    if (!uid || !estabelecimentoId) return () => { ativo = false; };
    const falhar = (e: unknown) => { if (ativo) setLista({ chave, estado: { status: 'error', mensagem: mensagemErroSetores(e) } }); };
    try {
      unsubscribe = observarSetores({ uid, estabelecimentoId }, setores => {
        if (ativo) setLista({ chave, estado: { status: 'data', setores } });
      }, falhar);
    } catch (e) { falhar(e); }
    return () => { ativo = false; unsubscribe?.(); };
  }, [uid, estabelecimentoId, chave, tentativa]));

  const estado: EstadoLista = lista.chave === chave ? lista.estado : { status: 'loading' };
  return { estado, contexto: uid && estabelecimentoId ? { uid, estabelecimentoId } : null,
    tentarNovamente: () => setTentativa(t => t + 1) };
}
