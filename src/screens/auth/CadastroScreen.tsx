/**
 * Papel da pasta (src/screens): reúne as telas que recebem ações do usuário e ligam componentes aos serviços e à navegação.
 * Papel da pasta (src/screens/auth): reúne boas-vindas, acesso à conta, recuperação e configuração inicial do estabelecimento.
 * Abre o formulário compartilhado no modo de criação de conta.
 * Depende de CredenciaisScreen e das rotas de AuthNavigator; permite voltar ao Login.
 * Depois do cadastro, a sessão encaminha o usuário à configuração do estabelecimento.
 */

import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import CredenciaisScreen from './CredenciaisScreen';

export default function CadastroScreen({ navigation }: StackScreenProps<AuthStackParamList, 'Cadastro'>) {
  return <CredenciaisScreen cadastro alternar={() => navigation.navigate('Login')} />;
}
