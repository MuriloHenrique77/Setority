/**
 * Mantém o histórico de um produto enquanto seus detalhes estão em foco.
 * Depende de SessionProvider, movimentacoesService e utils/movimentacoes.
 * Devolve os registros ordenados, a espera ou o erro para ProdutoDetalhesScreen.
 */

import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSession } from '../../session/SessionProvider';
import { observarMovimentacoesProduto } from './movimentacoesService';
import { mensagemErroMovimentacao } from '../../utils/movimentacoes';
import type { Movimentacao } from '../../types/movimentacao.types';
type Estado = { status: 'loading' } | { status: 'data'; movimentos: Movimentacao[] } | { status: 'error'; mensagem: string };
// Ao ganhar foco, abre a escuta de mudanças do Firestore; ao perder foco, cancela essa escuta.
// A chave reúne sessão e parâmetros da consulta. Se mudarem, dados antigos já ficam ocultos
// na renderização, antes da limpeza do efeito. O indicador ativo ignora respostas tardias.
// Tentar novamente aumenta tentativa e reinicia a consulta; erros são traduzidos para a tela.
export function useMovimentacoesProduto(produtoId: string, setorId: string) {
  const { estado: sessao } = useSession();
  const uid = sessao.status === 'authenticatedReady' ? sessao.conta.uid : '';
  const estabelecimentoId = sessao.status === 'authenticatedReady' ? sessao.perfil.estabelecimentoId : '';
  const chave = `${uid}:${estabelecimentoId}:${produtoId}:${setorId}`;
  const [lista, setLista] = useState<{ chave: string; estado: Estado }>({ chave, estado: { status: 'loading' } });
  const [tentativa, setTentativa] = useState(0);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    let unsubscribe: (() => void) | undefined;
    setLista({ chave, estado: { status: 'loading' } });
    const erro = (e: unknown) => { if (ativo) setLista({ chave, estado: { status: 'error', mensagem: mensagemErroMovimentacao(e) } }); };
    if (uid && estabelecimentoId) {
      try { unsubscribe = observarMovimentacoesProduto({ uid, estabelecimentoId }, produtoId, setorId,
        movimentos => { if (ativo) setLista({ chave, estado: { status: 'data', movimentos } }); }, erro); }
      catch (e) { erro(e); }
    }
    return () => { ativo = false; unsubscribe?.(); };
  }, [uid, estabelecimentoId, produtoId, setorId, chave, tentativa]));
  return { estado: lista.chave === chave ? lista.estado : { status: 'loading' } as Estado,
    tentarNovamente: () => setTentativa(t => t + 1) };
}
