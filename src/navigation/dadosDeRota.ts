import type { DadosRota } from './types';

/** Datas pertencem ao histórico; formulários e rotas usam apenas dados serializáveis. */
export function dadosDeRota<T extends { criadoEm: Date; atualizadoEm?: Date }>(dados: T): DadosRota<T> {
  const { criadoEm, atualizadoEm, ...campos } = dados;
  return campos;
}
