/**
 * Obtém o banco Firestore nativo quando um serviço precisa consultar ou gravar dados.
 * Depende da aplicação padrão do Firebase; também reexporta funções e tipos do SDK.
 * O serviço chamador monta as consultas e operações; este arquivo não faz cadastros.
 */

import { getApp } from '@react-native-firebase/app';
import { getFirestore, type Firestore } from '@react-native-firebase/firestore';

export function obterFirestore(): Firestore {
  return getFirestore(getApp());
}

// Funções do SDK disponíveis aos serviços atuais; esta reexportação não executa consultas.
export {
  collection,
  doc,
  query,
  where,
  orderBy,
  runTransaction,
  writeBatch,
  onSnapshot,
} from '@react-native-firebase/firestore';

export type {
  CollectionReference,
  DocumentReference,
  Query,
  Transaction,
  WriteBatch,
  Unsubscribe,
} from '@react-native-firebase/firestore';
