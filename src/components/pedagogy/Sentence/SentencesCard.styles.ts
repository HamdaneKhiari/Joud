import { StyleSheet } from 'react-native';
import { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { getExerciseConfig } from '@/utils/exerciseMoodHelper';

/**
 * Génère les styles dynamiques pour la carte de traduction.
 * @param identity - L'objet d'identité visuelle de l'app
 * @param moduleColor - La couleur du module actuel (ex: bleu pour sentences)
 */
export const getSentenceCardStyles = (identity: Identity, moduleColor: string) => {
  const { palette, text, themeMode } = identity;
  const isDark = themeMode === 'dark';
  const config = getExerciseConfig(identity);

  return StyleSheet.create({
    container: {
      padding: config.padding.container,
    },
    // --- SECTION ÉNONCÉ ---
    questionBox: {
      marginBottom: tokens.spacing.xxl,
    },
    instruction: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.black,
      color: text.tertiary, // Couleur neutre pour ne pas distraire
      letterSpacing: 1.2,
      marginBottom: tokens.spacing.xs,
      textTransform: 'uppercase',
    },
    phraseSource: {
      fontSize: config.fontSize.title,
      fontWeight: tokens.fontWeight.bold,
      color: text.primary,
      lineHeight: config.fontSize.title * 1.3,
    },
    // --- ZONE DE SAISIE LIBRE ---
    input: {
      fontSize: config.fontSize.body,
      color: text.primary,
      minHeight: config.padding.container * 4,
      textAlignVertical: 'top',
      padding: config.padding.card,
      borderRadius: config.borderRadius.input,
      borderWidth: 2,
      backgroundColor: withOpacity(text.primary, 0.03),
    },
    // --- ZONE DE RÉVÉLATION (AUTO-CORRECTION) ---
    revealContainer: {
      marginTop: tokens.spacing.xxl,
      gap: tokens.spacing.xl,
    },
    correctionBlock: {
      // Utilise la couleur du module pour marquer la réponse "officielle"
      borderLeftWidth: 4,
      borderLeftColor: moduleColor,
      paddingLeft: tokens.spacing.lg,
      paddingVertical: tokens.spacing.xs,
      backgroundColor: withOpacity(moduleColor, 0.04),
      borderRadius: tokens.borderRadius.sm,
    },
    labelCorrection: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: moduleColor,
      marginBottom: 4,
    },
    phraseTarget: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color: text.primary,
    },
    // --- BLOCS PÉDAGOGIQUES (CONCRÈTEMENT / BUILD) ---
    pedagogyCard: {
      backgroundColor: withOpacity(moduleColor, 0.07),
      padding: config.padding.card,
      borderRadius: config.borderRadius.input,
      borderWidth: 1,
      borderColor: withOpacity(moduleColor, 0.1),
    },
    pedagogyTitle: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.black,
      color: moduleColor,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    pedagogyText: {
      fontSize: tokens.fontSize.md,
      lineHeight: 22,
      color: text.secondary,
    }
  });
};