/**
 * Mostra a espera enquanto RootNavigator resolve o acesso da sessão.
 * Depende somente de BootScreen; a próxima tela é escolhida quando a sessão mudar.
 */

import BootScreen from '../../components/BootScreen';
export default function LoadingScreen() {
  return <BootScreen />;
}
