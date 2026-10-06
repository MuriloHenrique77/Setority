import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { Produto } from '../types/produto.types';
import type { ContextoProdutos } from '../utils/produtos';
import { mensagemErroProdutos } from '../utils/produtos';
import { mensagemInativacao, validarExclusaoPermanente } from '../utils/cicloProduto';
import { inativarProduto, reativarProduto, removerProduto } from '../services/produtos/produtosService';
import { spacing } from '../theme';
import { AppButton } from './ui/AppButton';
import { useFeedback } from './ui/FeedbackProvider';
import ConfirmModal from './ConfirmModal';

type Acao = 'inativar' | 'reativar' | 'excluir';
export function ProdutoLifecycleActions({ produto, contexto, removido }: {
  produto: Produto; contexto: ContextoProdutos | null; removido?: () => void;
}) {
  const [acao, setAcao] = useState<Acao | null>(null), [busy, setBusy] = useState(false);
  const lock = useRef(false), mounted = useRef(true);
  const feedback = useFeedback();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  function selecionar(proxima: Acao) {
    if (lock.current) return;
    if (proxima === 'excluir') {
      try { validarExclusaoPermanente(produto); }
      catch (e) { feedback(mensagemErroProdutos(e), 'error'); return; }
    }
    setAcao(proxima);
  }
  async function confirmar() {
    if (lock.current || !contexto || !acao) return;
    lock.current = true; setBusy(true);
    try {
      await (acao === 'inativar' ? inativarProduto : acao === 'reativar' ? reativarProduto : removerProduto)(contexto, produto.id);
      // O listener pode remover o cartão antes de a Promise resolver; feedback é global.
      feedback(acao === 'inativar' ? 'Produto inativado. Histórico preservado.' : acao === 'reativar' ? 'Produto reativado com sucesso.' : 'Produto excluído permanentemente.', 'success');
      if (mounted.current) {
        if (acao === 'excluir') removido?.();
      }
    } catch (e) { if (mounted.current) feedback(mensagemErroProdutos(e), 'error'); }
    finally { lock.current = false; if (mounted.current) { setAcao(null); setBusy(false); } }
  }
  return <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
    <AppButton variant="secondary" label={produto.status === 'inativo' ? 'Reativar produto' : 'Inativar produto'}
      disabled={!contexto || busy} onPress={() => selecionar(produto.status === 'inativo' ? 'reativar' : 'inativar')} />
    <AppButton variant="danger" label="Excluir permanentemente" disabled={!contexto || busy} onPress={() => selecionar('excluir')} />
    <ConfirmModal visible={acao !== null} busy={busy} destructive={acao === 'excluir'}
      title={acao === 'inativar' ? 'Inativar produto' : acao === 'reativar' ? 'Reativar produto' : 'Excluir permanentemente'}
      message={acao === 'inativar' ? mensagemInativacao(produto) : acao === 'reativar'
        ? 'O produto voltará às listas normais e poderá receber movimentações. O estoque e o histórico serão preservados.'
        : 'Este produto nunca teve movimentações. Sua exclusão é permanente. Deseja continuar?'}
      confirmText={busy ? 'Aguarde...' : acao === 'inativar' ? 'Inativar' : acao === 'reativar' ? 'Reativar' : 'Excluir'}
      onConfirm={() => { void confirmar(); }} onCancel={() => { if (!lock.current) setAcao(null); }} />
  </View>;
}
