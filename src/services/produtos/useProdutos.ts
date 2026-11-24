/**
 * Mantém os produtos do setor disponíveis enquanto a tela que usa o hook está em foco.
 * Depende de SessionProvider, produtosService e utils/produtos.
 * Devolve estado da lista e contexto da sessão para telas de produtos, detalhes e movimentos.
 */

import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSession } from '../../session/SessionProvider';
import { observarProdutos } from './produtosService';
import { mensagemErroProdutos } from '../../utils/produtos';
import type { Produto } from '../../types/produto.types';

type EstadoLista = { status: 'loading' } | { status: 'data'; produtos: Produto[] } | { status: 'error'; mensagem: string };
// Ao ganhar foco, abre a escuta de mudanças do Firestore; ao perder foco, cancela essa escuta.
// A chave reúne sessão e parâmetros da consulta. Se mudarem, dados antigos já ficam ocultos
// na renderização, antes da limpeza do efeito. O indicador ativo ignora respostas tardias.
// Tentar novamente aumenta tentativa e reinicia a consulta; erros são traduzidos para a tela.
export function useProdutos(setorId: string) {
  const { estado: sessao } = useSession();
  const uid = sessao.status === 'authenticatedReady' ? sessao.conta.uid : '';
  const estabelecimentoId = sessao.status === 'authenticatedReady' ? sessao.perfil.estabelecimentoId : '';
  const chave = `${uid}:${estabelecimentoId}:${setorId}`;
  const [tentativa, setTentativa] = useState(0);
  const [lista, setLista] = useState<{ chave: string; estado: EstadoLista }>({ chave, estado: { status: 'loading' } });
  useFocusEffect(useCallback(() => {
    let ativo = true;
    let unsubscribe: (() => void) | undefined;
    setLista({ chave, estado: { status: 'loading' } });
    const falhar = (e: unknown) => { if (ativo) setLista({ chave, estado: { status: 'error', mensagem: mensagemErroProdutos(e) } }); };
    if (uid && estabelecimentoId) {
      try { unsubscribe = observarProdutos({ uid, estabelecimentoId }, setorId, produtos => {
        if (ativo) setLista({ chave, estado: { status: 'data', produtos } });
      }, falhar); } catch (e) { falhar(e); }
    }
    return () => { ativo = false; unsubscribe?.(); };
  }, [uid, estabelecimentoId, setorId, chave, tentativa]));
  const estado: EstadoLista = lista.chave === chave ? lista.estado : { status: 'loading' };
  return { estado, contexto: uid && estabelecimentoId ? { uid, estabelecimentoId } : null,
    tentarNovamente: () => setTentativa(t => t + 1) };
}
