import { dadosDeRota } from '../../navigation/dadosDeRota';
import type { StockScreenProps } from '../../navigation/types';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/setoresScreen.styles';
import { removerSetor } from '../../services/setores/setoresService';
import { useSetores } from '../../services/setores/useSetores';
import { mensagemErroSetores } from '../../utils/setores';
import type { Setor } from '../../types/setor.types';
import ConfirmModal from '../../components/ConfirmModal';
import { FormButton } from '../../components/AuthFormLayout';

export default function SetoresScreen({ navigation }: StockScreenProps<'Setores'>) {
  const { estado, contexto, tentarNovamente } = useSetores();
  const setores = estado.status === 'data' ? estado.setores : [];
  const [erro, setErro] = useState<string | null>(null);
  const carregando = estado.status === 'loading';
  const [excluindo, setExcluindo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [setorParaExcluir, setSetorParaExcluir] = useState<Setor | null>(null);
  const ocupado = useRef(false);
  const ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);
  const erroVisivel = erro ?? (estado.status === 'error' ? estado.mensagem : null);

  function handleNovoSetor() {
    navigation.navigate('SetorForm');
  }

  function handleAbrirSetor(setor: Setor) {
    navigation.navigate('Produtos', { setor: dadosDeRota(setor) });
  }

  function handleEditarSetor(setor: Setor) {
    navigation.navigate('SetorForm', { setor: dadosDeRota(setor) });
  }

  function handleExcluirSetor(setor: Setor) {
    if (ocupado.current) return;
    setSetorParaExcluir(setor);
    setModalVisible(true);
  }

  async function confirmarExclusao() {
    if (!setorParaExcluir || !contexto || ocupado.current) return;
    ocupado.current = true;
    setExcluindo(true);
    setErro(null);
    try {
      await removerSetor(contexto, setorParaExcluir.id);
    } catch (error) {
      if (ativo.current) setErro(mensagemErroSetores(error));
    } finally {
      ocupado.current = false;
      if (ativo.current) {
        setModalVisible(false);
        setSetorParaExcluir(null);
        setExcluindo(false);
      }
    }
  }

  function cancelarExclusao() {
    if (ocupado.current) return;
    setModalVisible(false);
    setSetorParaExcluir(null);
  }

  function renderSetor({ item }: { item: Setor }) {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardMainArea}
          activeOpacity={0.7}
          onPress={() => handleAbrirSetor(item)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="grid-outline" size={22} color="#1E88E5" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardDescription}>
              {item.descricao ? item.descricao : 'Sem descrição'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            accessibilityLabel={`Editar setor ${item.nome}`}
            accessibilityRole="button"
            onPress={() => handleEditarSetor(item)}
          >
            <Ionicons name="create-outline" size={20} color="#F57C00" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            accessibilityLabel={`Excluir setor ${item.nome}`}
            accessibilityRole="button"
            onPress={() => handleExcluirSetor(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderEmptyState() {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="folder-open-outline" size={64} color="#B0BEC5" />
        <Text style={styles.emptyTitle}>Nenhum setor cadastrado</Text>
        <Text style={styles.emptyText}>
          Crie seu primeiro setor para começar a organizar suas informações.
        </Text>

        <TouchableOpacity
          style={styles.emptyButton}
          activeOpacity={0.8}
          onPress={handleNovoSetor}
        >
          <Text style={styles.emptyButtonText}>Criar primeiro setor</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Setores</Text>
          <Text style={styles.subtitle}>
            Escolha um setor para acessar suas informações
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newButton}
          activeOpacity={0.8}
          onPress={handleNovoSetor}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.newButtonText}>Novo setor</Text>
        </TouchableOpacity>

        {carregando ? <Text>Carregando setores...</Text> : null}
        <FormButton label="Relatórios" onPress={() => navigation.navigate('Relatorios')} />
        {erroVisivel ? (
          <View>
            <Text accessibilityRole="alert">{erroVisivel}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => { setErro(null); tentarNovamente(); }} accessibilityRole="button">
              <Text>Tentar carregar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <FlatList
          data={setores}
          keyExtractor={(item) => item.id}
          renderItem={renderSetor}
          contentContainerStyle={[
            styles.listContent,
            setores.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={carregando || erroVisivel ? null : renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <ConfirmModal
        visible={modalVisible}
        title="Excluir setor"
        message={
          setorParaExcluir
            ? `Deseja realmente excluir o setor "${setorParaExcluir.nome}"?${excluindo ? ' Aguardando confirmação; sem conexão, a exclusão fica pendente de sincronização.' : ''}`
            : ''
        }
        confirmText={excluindo ? 'Excluindo...' : 'Excluir'}
        cancelText="Cancelar"
        onConfirm={confirmarExclusao}
        onCancel={cancelarExclusao}
      />
    </SafeAreaView>
  );
}
