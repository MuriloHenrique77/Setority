/**
 * Lê a versão exibida na abertura e na tela Conta.
 * Depende de app.json, a configuração Expo; devolve a mesma versão para ambas as telas.
 */

import appConfig from '../../app.json';

export function obterVersaoApp(): string {
  return appConfig.expo.version;
}
