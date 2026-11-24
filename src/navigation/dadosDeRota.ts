/**
 * Prepara dados antes de uma tela chamar navigation.navigate.
 * Depende de DadosRota em navigation/types; remove datas dos objetos enviados à próxima tela.
 * Os serviços continuam fornecendo as datas completas para exibir histórico e relatórios.
 */

import type { DadosRota } from './types';

/** Datas pertencem ao histórico; formulários e rotas usam apenas dados serializáveis. */
export function dadosDeRota<T extends { criadoEm: Date; atualizadoEm?: Date; inativadoEm?: Date | null }>(dados: T): DadosRota<T> {
  const { criadoEm, atualizadoEm, inativadoEm, ...campos } = dados;
  return campos;
}
