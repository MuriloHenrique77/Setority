/**
 * Abre o formulário compartilhado no modo de entrada de uma conta existente.
 * Depende de CredenciaisScreen e das rotas de AuthNavigator.
 * Oferece acesso ao cadastro e à recuperação; o login segue pelo estado da sessão.
 */

import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import CredenciaisScreen from './CredenciaisScreen';

export default function LoginScreen({ navigation }: StackScreenProps<AuthStackParamList, 'Login'>) {
  return <CredenciaisScreen cadastro={false} alternar={() => navigation.navigate('Cadastro')}
    recuperar={() => navigation.navigate('RecuperarSenha')} />;
}
