/**
 * Permite sair pelo header durante a configuração inicial do estabelecimento.
 * Depende de SessionProvider e do tema; o toque chama o encerramento da sessão.
 * RootNavigator reage ao estado de autenticação e passa ao fluxo deslogado.
 */

import { Pressable, Text, StyleSheet } from 'react-native';
import { useSession } from '../session/SessionProvider';
import { colors, spacing, touchTarget, typography } from '../theme';

export default function LogoutButton() {
  const { encerrarSessao } = useSession();
  return <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={() => { void encerrarSessao(); }} style={styles.button}>
    <Text style={styles.text}>Sair</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ button: { minWidth: touchTarget, minHeight: touchTarget, paddingHorizontal: spacing.lg,
  alignItems: 'center', justifyContent: 'center' }, text: { ...typography.label, color: colors.primary } });
