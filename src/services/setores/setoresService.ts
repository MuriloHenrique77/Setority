/**
 * Papel da pasta (src/services/setores): reúne consultas e manutenção dos setores com proteção contra exclusão de vínculos.
 * Consulta, cadastra, edita e remove setores vinculados ao estabelecimento da sessão.
 * Depende de Auth/Firestore, conversor de setor, utils/setores e consulta de produtos.
 * As telas recebem os dados por useSetores; excluir exige verificar vínculos e contador.
 */

import { collection, doc, query, where, onSnapshot, setDoc, updateDoc,
  deleteField, serverTimestamp, runTransaction } from '@react-native-firebase/firestore';
import { obterAuth } from '../firebase/auth';
import { obterFirestore } from '../firebase/firestore';
import { COLLECTIONS } from '../firebase/collections';
import { converterSetor } from '../firebase/converters/setor';
import { setorPossuiProdutos } from '../produtos/produtosService';
import { normalizarDadosSetor, ordenarSetores, SetorComProdutosError } from '../../utils/setores';
import type { ContextoSetores, DadosSetor } from '../../utils/setores';
import type { Setor } from '../../types/setor.types';

function validarContexto(contexto: ContextoSetores) {
  if (obterAuth().currentUser?.uid !== contexto.uid || !contexto.estabelecimentoId) throw new Error('Sessão inválida.');
}

// useSetores abre a consulta filtrada pelo estabelecimento e recebe novos snapshots,
// isto é, retratos dos documentos naquele momento. O conversor valida cada documento.
// A função devolvida cancela a escuta; erros de leitura ou conversão seguem para o hook.
export function observarSetores(contexto: ContextoSetores, receber: (setores: Setor[]) => void,
  erro: (erro: unknown) => void): () => void {
  validarContexto(contexto);
  const consulta = query(collection(obterFirestore(), COLLECTIONS.setores),
    where('estabelecimentoId', '==', contexto.estabelecimentoId));
  return onSnapshot(consulta, { includeMetadataChanges: true }, snapshot => {
    try {
      validarContexto(contexto);
      const setores = snapshot.docs.map(documento => converterSetor(
        documento.data({ serverTimestamps: 'estimate' }), documento.id, contexto.estabelecimentoId,
        documento.metadata.hasPendingWrites,
      ));
      receber(ordenarSetores(setores));
    } catch (e) { erro(e); }
  }, erro);
}

// O formulário envia nome/descrição; o serviço valida a sessão e normaliza os campos.
// Grava o setor com contador zero e datas do servidor. O resultado é uma Promise:
// ela representa a espera assíncrona e só resolve após a confirmação. Uma escrita pendente
// pode aparecer na escuta local sem significar sucesso confirmado.
export async function criarSetor(contexto: ContextoSetores, dados: DadosSetor): Promise<void> {
  validarContexto(contexto);
  const normalizado = normalizarDadosSetor(dados);
  const referencia = doc(collection(obterFirestore(), COLLECTIONS.setores));
  await setDoc(referencia, { id: referencia.id, estabelecimentoId: contexto.estabelecimentoId,
    ...normalizado, quantidadeProdutos: 0, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
}

export async function atualizarSetor(contexto: ContextoSetores, id: string, dados: DadosSetor): Promise<void> {
  validarContexto(contexto);
  const normalizado = normalizarDadosSetor(dados);
  await updateDoc(doc(obterFirestore(), COLLECTIONS.setores, id), {
    nome: normalizado.nome, descricao: normalizado.descricao ?? deleteField(), atualizadoEm: serverTimestamp(),
  });
}

// Após o modal confirmar, consulta no servidor se há produto ativo ou inativo no setor.
// Se estiver vazio, uma transação relê o contador antes de excluir. Transação é uma operação
// que pode ser refeita se o documento mudar; isso protege contra um cadastro concorrente.
// Vínculo encontrado, sessão inválida ou falha de conexão interrompem a exclusão.
export async function removerSetor(contexto: ContextoSetores, id: string): Promise<void> {
  validarContexto(contexto);
  if (await setorPossuiProdutos(contexto, id)) throw new SetorComProdutosError();
  await runTransaction(obterFirestore(), async transacao => {
    validarContexto(contexto);
    const referencia = doc(obterFirestore(), COLLECTIONS.setores, id);
    const setor = await transacao.get(referencia);
    const dados = setor.data();
    if (!setor.exists() || dados?.estabelecimentoId !== contexto.estabelecimentoId) throw new Error('Setor não encontrado.');
    // A contagem protege contra cadastro concorrente após a consulta ao servidor.
    if ((dados.quantidadeProdutos ?? 0) !== 0) throw new SetorComProdutosError();
    transacao.delete(referencia);
  });
}
