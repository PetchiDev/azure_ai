import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriangleAlert, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { KineticButton } from '../ui/KineticButton';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  resourceName: string;
}

interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  style?: ViewStyle; // Explicitly type style as ViewStyle
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  resourceName,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <TriangleAlert size={32} color={THEME.colors.error} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={THEME.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>
              {description} {' '}
              <Text style={styles.resourceName}>{resourceName}</Text> will be permanently deleted.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <KineticButton
              title="Delete Everything"
              onPress={onConfirm}
              variant="primary"
              style={styles.deleteButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: THEME.colors.surfaceContainer,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#FFFFFF33',
    overflow: 'hidden',
  },
  header: {
    padding: THEME.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.error + '1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: THEME.spacing.md,
    top: THEME.spacing.md,
  },
  body: {
    paddingHorizontal: THEME.spacing.lg,
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontFamily: THEME.typography.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: THEME.spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontFamily: THEME.typography.fontFamily,
    fontSize: 14,
    color: THEME.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  resourceName: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  footer: {
    padding: THEME.spacing.lg,
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    height: 48,
    backgroundColor: THEME.colors.error,
  },
});
