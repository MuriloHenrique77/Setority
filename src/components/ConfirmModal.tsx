import React from 'react';
import { colors, radii, spacing, typography } from '../theme';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type ConfirmModalProps = {
  visible: boolean;
  busy?: boolean;
  destructive?: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  busy = false,
  destructive = true,
  title,
  message,
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => { if (!busy) onCancel(); }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              activeOpacity={0.8}
              disabled={busy}
              accessibilityState={{ disabled: busy }}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, !destructive && { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              disabled={busy}
              accessibilityState={{ disabled: busy }}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },

  title: {
    ...typography.cardTitle,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },

  message: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 10,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    minWidth: 100,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: colors.primarySoft,
  },

  cancelButtonText: {
    color: colors.primary,
    ...typography.label,
    fontWeight: '600',
  },

  confirmButton: {
    backgroundColor: colors.danger,
  },

  confirmButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});