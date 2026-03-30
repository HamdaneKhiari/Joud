/**
 * ============================================
 * COMMON WORD GAMES STYLES (White Label)
 * Styles partagés entre tous les composants wordgames
 * 100% dynamique - aucune couleur hardcodée
 * ============================================
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';

// ============================================
// TYPES
// ============================================

export interface WordGameStyles {
  // Base Card
  container: object;
  content: object;
  card: object;
  colorBar: object;
  titleSection: object;
  titleIcon: object;
  titleText: object;

  // Options
  optionsContainer: object;
  optionButton: object;
  optionButtonSelected: object;
  optionButtonCorrect: object;
  optionButtonIncorrect: object;
  optionText: object;
  optionTextWhite: object;

  // Content Box
  contentBox: object;
  contentText: object;
  contentTextBold: object;
}

// ============================================
// FACTORY FUNCTION (White Label)
// ============================================

/**
 * Génère les styles dynamiques selon l'identité
 * @param identity - Identité white label (primary, college, lycee, adult)
 * @returns Styles dynamiques pour les jeux de mots
 */
export const createWordGameStyles = (identity: Identity): ReturnType<typeof StyleSheet.create> => {
  const isPlayful = identity.ui.mood === 'playful';

  return StyleSheet.create({
    // =================== BASE CARD ===================
    container: {
      flex: 1,
    },

    content: {
      paddingBottom: tokens.spacing.xl,
    },

    card: {
      backgroundColor: identity.palette.surface, // ✅ White label
      borderRadius: identity.ui.cardRadius, // ✅ White label (playful = 24, clean = 12)
      borderTopWidth: 4,
      borderTopColor: identity.palette.primary, // ✅ White label
      overflow: 'hidden',
      ...tokens.shadows.md,
      marginBottom: tokens.spacing.xl,
    },

    colorBar: {
      height: 4,
      backgroundColor: identity.palette.primary, // ✅ White label
      elevation: 2,
    },

    titleSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: isPlayful ? 'center' : 'flex-start', // ✅ Mood
      paddingVertical: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.xl,
    },

    titleIcon: {
      fontSize: isPlayful ? tokens.fontSize.xxl : tokens.fontSize.xl, // ✅ Mood
      marginRight: tokens.spacing.md,
    },

    titleText: {
      fontSize: isPlayful ? tokens.fontSize.xl : tokens.fontSize.lg, // ✅ Mood
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary, // ✅ White label
      textAlign: isPlayful ? 'center' : 'left', // ✅ Mood
    },

    // =================== OPTIONS ===================
    optionsContainer: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.xl,
      gap: tokens.spacing.md,
    },

    optionButton: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md, // ✅ Mood
      borderWidth: 2,
      borderColor: identity.palette.primary, // ✅ White label
      backgroundColor: identity.palette.surface, // ✅ White label
      justifyContent: 'center',
      minHeight: 50,
    },

    // État: sélectionné (avant validation)
    optionButtonSelected: {
      backgroundColor: identity.palette.accent, // ✅ White label
      borderColor: identity.palette.accent,
      borderWidth: 2,
    },

    // État: correct (après validation)
    optionButtonCorrect: {
      backgroundColor: baseColors.green500, // ✅ Couleur système (succès)
      borderColor: baseColors.green600,
      borderWidth: 2,
    },

    // État: incorrect (après validation)
    optionButtonIncorrect: {
      backgroundColor: baseColors.red500, // ✅ Couleur système (erreur)
      borderColor: baseColors.red600,
      borderWidth: 2,
    },

    optionText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.primary, // ✅ White label
      textAlign: isPlayful ? 'center' : 'left', // ✅ Mood
    },

    optionTextWhite: {
      color: baseColors.white,
      fontWeight: tokens.fontWeight.bold,
    },

    // =================== CONTENT BOX ===================
    contentBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.xl,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.lg,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md, // ✅ Mood
      borderWidth: 2,
      borderColor: identity.palette.primary, // ✅ White label
      backgroundColor: identity.palette.background, // ✅ White label (fond plus clair que surface)
    },

    contentText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.primary, // ✅ White label
      lineHeight: 24,
      textAlign: isPlayful ? 'center' : 'left', // ✅ Mood
    },

    contentTextBold: {
      fontWeight: tokens.fontWeight.bold,
    },
  });
};

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Fusionne les styles de base avec des styles personnalisés
 * @param baseStyles - Styles de base
 * @param customStyles - Styles personnalisés
 * @returns Styles fusionnés
 */
export const mergeStyles = (baseStyles: Record<string, object>, customStyles: Record<string, object> = {}) => {
  return { ...baseStyles, ...customStyles };
};
