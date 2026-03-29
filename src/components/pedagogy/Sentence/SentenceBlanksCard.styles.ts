/**
 * ============================================
 * STYLES: SentenceBlanksCard
 * Styles dynamiques avec White Label complet
 * ============================================
 */

import { StyleSheet } from 'react-native';
import { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { getExerciseConfig } from '@/utils/exerciseMoodHelper';

/**
 * Génère les styles dynamiques pour la carte de phrases à trous (blanks).
 * @param identity - Identité visuelle de l'app (white label)
 * @param moduleColor - Couleur du module sentences
 */
export const getSentenceBlanksCardStyles = (identity: Identity, moduleColor: string) => {
  const { palette: _palette, text, themeMode, ui } = identity;
  const _isDark = themeMode === 'dark';
  const config = getExerciseConfig(identity);

  return StyleSheet.create({
    container: {
      padding: config.padding.container,
    },

    // =================== INSTRUCTION ===================
    instructionBox: {
      marginBottom: tokens.spacing.lg,
    },
    instruction: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.black,
      color: text.secondary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },

    // =================== PHRASE AVEC TROU ===================
    sentenceContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: tokens.spacing.xxl,
      paddingHorizontal: tokens.spacing.sm,
    },
    sentenceText: {
      fontSize: config.fontSize.title,
      fontWeight: tokens.fontWeight.semibold,
      color: text.primary,
      lineHeight: config.fontSize.title * 1.3,
    },
    blankBox: {
      minWidth: 80,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.xs,
      marginHorizontal: tokens.spacing.xs,
      borderRadius: config.borderRadius.button,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    blankText: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
    },

    // =================== OPTIONS DE RÉPONSE ===================
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.spacing.md,
      marginBottom: tokens.spacing.xl,
    },
    optionButton: {
      flex: 1,
      minWidth: '45%',
      paddingVertical: config.padding.card,
      paddingHorizontal: tokens.spacing.md,
      borderRadius: config.borderRadius.button,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: moduleColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    optionText: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.semibold,
    },

    // =================== FEEDBACK APRÈS VALIDATION ===================
    feedbackContainer: {
      marginTop: tokens.spacing.xl,
      gap: tokens.spacing.lg,
    },

    // Bloc de la bonne réponse
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
    },

    // Bloc de traduction
    translationBlock: {
      padding: tokens.spacing.md,
      borderRadius: ui.cardRadius || tokens.borderRadius.md,
      borderWidth: 1,
      borderColor: withOpacity(text.tertiary, 0.2),
    },
    translationLabel: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    translationText: {
      fontSize: tokens.fontSize.md,
      fontWeight: tokens.fontWeight.semibold,
    },

    // Bloc d'explication pédagogique
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
  });
};
