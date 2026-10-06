import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Opcao = { id: string; nome: string };
type Props = { titulo: string; todos: string; opcoes: Opcao[]; valor?: string; disabled?: boolean; onChange: (id?: string) => void };
export default function FiltroSelecao({ titulo, todos, opcoes, valor, onChange, disabled }: Props) {
  const [aberto, setAberto] = useState(false), [busca, setBusca] = useState('');
  const escolhido = valor ? opcoes.find(o => o.id === valor)?.nome ?? 'Seleção indisponível' : todos;
  const termo = busca.trim().toLocaleLowerCase('pt-BR');
  const itens = [{ id: '', nome: todos }, ...opcoes.filter(o => o.nome.toLocaleLowerCase('pt-BR').includes(termo))];
  return <View style={styles.campo}>
    <Text style={styles.label}>{titulo}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={'Selecionar ' + titulo.toLowerCase()}
      accessibilityState={{ disabled }} disabled={disabled} style={styles.botao}
      onPress={() => { setBusca(''); setAberto(true); }}>
      <Text style={styles.nome}>{escolhido}</Text><Text style={styles.indicador}>Selecionar</Text>
    </Pressable>
    <Modal visible={aberto} animationType="slide" onRequestClose={() => setAberto(false)}>
      <SafeAreaView style={styles.modal}>
        <Text style={styles.titulo}>Selecionar {titulo.toLowerCase()}</Text>
        <TextInput accessibilityLabel={'Buscar ' + titulo.toLowerCase()} placeholder="Buscar por nome"
          style={styles.busca} value={busca} onChangeText={setBusca} />
        <FlatList data={itens} keyExtractor={o => o.id} keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={item.nome}
            accessibilityState={{ selected: item.id === (valor ?? '') }} style={styles.opcao}
            onPress={() => { onChange(item.id || undefined); setAberto(false); }}>
            <Text style={styles.nome}>{item.nome}{item.id === (valor ?? '') ? ' • Selecionado' : ''}</Text>
          </Pressable>} />
        <Pressable accessibilityRole="button" style={styles.fechar} onPress={() => setAberto(false)}><Text style={styles.nome}>Fechar seleção</Text></Pressable>
      </SafeAreaView>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  campo: { marginBottom: 16 }, label: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#222' },
  botao: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 14, minHeight: 52 },
  nome: { color: '#222', fontSize: 16, flexShrink: 1 }, indicador: { color: '#1565C0', fontSize: 13, marginTop: 6 },
  modal: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 }, titulo: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  busca: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, minHeight: 48, marginBottom: 12, fontSize: 16 },
  opcao: { minHeight: 52, padding: 16, borderBottomWidth: 1, borderColor: '#DDD' },
  fechar: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
});
