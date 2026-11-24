/**
 * Papel da pasta (src/services/firebase/converters): confere documentos do banco e os transforma nos tipos e datas usados pelo aplicativo.
 * Converte datas na fronteira entre documentos do Firestore e objetos do aplicativo.
 * Depende de Timestamp do SDK nativo, o formato de data do banco.
 * Os conversores e serviços passam a usar Date, o formato de data do JavaScript.
 */

import { Timestamp } from '@react-native-firebase/firestore';

export function timestampParaDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

export function dateParaTimestamp(data: Date): Timestamp {
  if (!Number.isFinite(data.getTime())) {
    throw new Error('Não é possível persistir uma data inválida.');
  }
  return Timestamp.fromDate(data);
}
