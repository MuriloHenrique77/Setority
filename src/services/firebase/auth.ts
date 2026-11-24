/**
 * Papel da pasta (src/services): separa consultas e gravações das telas e fornece hooks para acompanhar os dados.
 * Papel da pasta (src/services/firebase): reúne a conexão nativa, os nomes de coleções e o fluxo de autenticação e perfil.
 * Obtém o Firebase Authentication, serviço que identifica a conta que entrou no aplicativo.
 * Participa quando os serviços de sessão ou estoque precisam conferir essa identidade.
 * Depende da aplicação padrão configurada pelo Firebase nativo e do módulo auth.
 * Devolve a referência usada para autenticar ou conferir o usuário atual.
 */

import { getApp } from '@react-native-firebase/app';
import { getAuth, type Auth } from '@react-native-firebase/auth';

// A aplicação padrão é configurada nativamente; acesso somente quando solicitado.
export function obterAuth(): Auth {
  return getAuth(getApp());
}
