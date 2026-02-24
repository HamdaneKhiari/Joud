/**
 * ============================================
 * COMPLETION MODAL — White Label
 * Affiché quand une série d'exercices est terminée
 * Remplace les Alert.alert de fin de série
 * ============================================
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

export interface CompletionModalProps {
  visible: boolean;
  /** Titre affiché — défaut: "Series complete!" */
  title?: string;
  /** Sous-titre / encouragement */
  subtitle?: string;
  /** Emoji de célébration */
  emoji?: string;
  /** Callback quand l'utilisateur appuie sur "Done" */
  onDone: () => void;
  /** Libellé du bouton — défaut: "Continue" */
  doneLabel?: string;
}

// ============================================
// COMPOSANT
// ============================================

const CompletionModal: React.FC<CompletionModalProps> = ({
  visible,
  title = 'Series complete!',
  subtitle = 'Great work! Keep it up.',
  emoji = '🎉',
  onDone,
  doneLabel = 'Continue',
}) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDone}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.card,
          {
            backgroundColor: identity.palette.surface,
            borderColor: identity.palette.primary,
            borderRadius: isPlayful ? tokens.borderRadius.xxl : tokens.borderRadius.xl,
          }
        ]}>
          <Text style={styles.emoji}>{emoji}</Text>

          <Text style={[styles.title, { color: identity.text.primary }]}>
            {title}
          </Text>

          <Text style={[styles.subtitle, { color: identity.text.secondary }]}>
            {subtitle}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: identity.palette.primary,
                borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
              }
            ]}
            onPress={onDone}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: identity.text.onPrimary }]}>
              {doneLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.layout.screenPadding,
  },
  card: {
    width: '100%',
    borderWidth: 2,
    padding: tokens.spacing.xxl,
    alignItems: 'center',
    ...tokens.shadows.md,
  },
  emoji: {
    fontSize: 64,
    marginBottom: tokens.spacing.lg,
  },
  title: {
    fontSize: tokens.fontSize.xxl,
    fontWeight: tokens.fontWeight.black,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
    lineHeight: 22,
  },
  button: {
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xxl,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
  },
});

export default CompletionModal;
