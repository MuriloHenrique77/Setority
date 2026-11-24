/**
 * Transforma as datas digitadas no intervalo usado pela consulta de relatórios.
 * Depende de Date e do tipo IntervaloRelatorio; usa o calendário local do dispositivo.
 * Devolve início incluído e dia seguinte excluído, ou erro para a tela manter o período anterior.
 */

import type { IntervaloRelatorio } from '../types/relatorio.types';

export function formatarDiaLocal(data: Date): string {
  return String(data.getDate()).padStart(2, '0') + '/' +
    String(data.getMonth() + 1).padStart(2, '0') + '/' + data.getFullYear();
}

// Ao aplicar o filtro, lê DD/MM/AAAA e reconfere o calendário para recusar datas como 31/02.
// Constrói meia-noite no fuso local do dispositivo, sem interpretar o texto como UTC.
function lerDiaLocal(texto: string, campo: string): Date {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) throw new Error(campo + ': use DD/MM/AAAA.');
  const dia = Number(partes[1]), mes = Number(partes[2]), ano = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);
  if (ano < 1900 || data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    throw new Error(campo + ': informe uma data válida, a partir de 1900.');
  }
  return data;
}

export function construirIntervaloRelatorio(inicial: string, final: string): IntervaloRelatorio {
  const inicio = lerDiaLocal(inicial, 'Data inicial'), ultimoDia = lerDiaLocal(final, 'Data final');
  if (inicio.getTime() > ultimoDia.getTime()) throw new Error('A data inicial deve ser anterior ou igual à data final.');
  // Construção por calendário, sem adicionar 24h: respeita mudanças de fuso/DST.
  const fimExclusivo = new Date(ultimoDia.getFullYear(), ultimoDia.getMonth(), ultimoDia.getDate() + 1);
  return { inicio, fimExclusivo };
}

export function periodoPadrao(hoje = new Date()): { inicial: string; final: string } {
  return { inicial: formatarDiaLocal(new Date(hoje.getFullYear(), hoje.getMonth(), 1)), final: formatarDiaLocal(hoje) };
}

export function validarIntervaloRelatorio(intervalo: IntervaloRelatorio): void {
  if (!Number.isFinite(intervalo.inicio.getTime()) || !Number.isFinite(intervalo.fimExclusivo.getTime()) ||
      intervalo.inicio.getTime() >= intervalo.fimExclusivo.getTime()) throw new Error('Período inválido.');
}
