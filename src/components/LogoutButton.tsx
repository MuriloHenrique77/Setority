import { Pressable, Text, StyleSheet } from 'react-native';
import { useSession } from '../session/SessionProvider';

export default function LogoutButton() {
  const { encerrarSessao } = useSession();
  return <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={() => { void encerrarSessao(); }} style={styles.button}>
    <Text style={styles.text}>Sair</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ button: { minWidth: 48, minHeight: 48, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }, text: { color: '#1565C0', fontWeight: '600', fontSize: 16 } });
