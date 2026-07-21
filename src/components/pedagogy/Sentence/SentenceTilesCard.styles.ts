/**
 * ============================================
 * STYLES: SentenceTilesCard
 * Styles dynamiques avec White Label complet
 * ============================================
 */

import { StyleSheet } from 'react-native';
import { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { getExerciseConfig } from '@/utils/exerciseMoodHelper';

/**
 * Génère les styles dynamiques pour la carte de reconstruction de phrase (tiles).
 * @param identity - Identité visuelle de l'app (white label)
 * @param moduleColor - Couleur du module sentences
 */
export const getSentenceTilesCardStyles = (identity: Identity, moduleColor: string) => {
  const { text, ui } = identity;
  const config = getExerciseConfig(identity);
  const isPlayful = ui.mood === 'playful';

  return StyleSheet.create({
    container: {
      padding: config.padding.container,
    },

    // =================== INSTRUCTION ===================
    instructionBox: {
      marginBottom: tokens.spacing.sm,
    },
    instruction: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.black,
      color: text.secondary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },

    // =================== CONSIGNE FR ===================
    promptBox: {
      marginBottom: tokens.spacing.xl,
    },
    promptText: {
      fontSize: config.fontSize.title,
      fontWeight: tokens.fontWeight.bold,
      color: text.primary,
      lineHeight: config.fontSize.title * 1.3,
    },

    // =================== ZONE DE CONSTRUCTION ===================
    buildZone: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing.sm,
      minHeight: 56,
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.sm,
      marginBottom: tokens.spacing.lg,
      borderRadius: config.borderRadius.input,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: withOpacity(text.tertiary, 0.3),
      backgroundColor: withOpacity(text.primary, 0.02),
    },
    emptyText: {
      fontSize: tokens.fontSize.sm,
      color: text.tertiary,
      fontStyle: 'italic',
    },
    placedTile: {
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: moduleColor,
    },
    placedTileText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.onPrimary,
    },
    punctuation: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color: text.secondary,
    },

    // =================== POOL DE TUILES ===================
    poolContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.spacing.sm,
      marginBottom: tokens.spacing.xl,
      justifyContent: isPlayful ? 'center' : 'flex-start',
    },
    poolTile: {
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: moduleColor,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: identity.palette.surface,
    },
    poolTileText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: text.primary,
    },

    // =================== BLOC ASTUCE (TIP) ===================
    tipBlock: {
      borderLeftWidth: 3,
      borderLeftColor: moduleColor,
      backgroundColor: withOpacity(moduleColor, 0.07),
      borderRadius: tokens.borderRadius.sm,
      padding: tokens.spacing.md,
      paddingLeft: tokens.spacing.lg,
      marginBottom: tokens.spacing.xl,
      gap: tokens.spacing.xs,
    },
    tipLabel: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.black,
      color: moduleColor,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    tipText: {
      fontSize: tokens.fontSize.sm,
      lineHeight: 20,
      color: text.secondary,
    },

    // =================== FEEDBACK APRÈS VALIDATION ===================
    feedbackContainer: {
      marginTop: tokens.spacing.md,
      gap: tokens.spacing.lg,
    },
    correctAnswerBlock: {
      borderLeftWidth: 4,
      paddingLeft: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.borderRadius.sm,
    },
    correctAnswerLabel: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      marginBottom: 4,
    },
    correctAnswerText: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color: text.primary,
    },
    explanationBlock: {
      padding: tokens.spacing.lg,
      borderRadius: ui.cardRadius || tokens.borderRadius.md,
      borderWidth: 1,
    },
    explanationTitle: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.black,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    explanationText: {
      fontSize: tokens.fontSize.md,
      lineHeight: 22,
      color: text.secondary,
    },
  });
};
