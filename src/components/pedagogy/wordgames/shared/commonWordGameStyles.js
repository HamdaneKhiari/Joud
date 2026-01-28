// ============================================
// FICHIER: commonWordGameStyles.js
// Styles communs partagés entre tous les composants wordgames
// ============================================

import { StyleSheet } from 'react-native';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  borderWidth as borderWidths,
  shadows,
} from '@themes/tokens';
import { baseColors } from '@themes/colors';

/**
 * Styles de base communs à toutes les cartes de jeux de mots
 */
export const baseCardStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingBottom: spacing.xl,
  },

  card: {
    backgroundColor: baseColors.white,
    borderRadius: borderRadius.xl,
    borderTopWidth: borderWidths.heavy,
    overflow: 'hidden',
    ...shadows.xl,
    marginBottom: spacing.xl,
  },

  colorBar: {
    height: borderWidths.heavy,
    elevation: 2,
  },

  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  titleIcon: {
    fontSize: fontSize.xl,
    marginRight: spacing.md,
  },

  titleText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});

/**
 * Styles pour les options/boutons de réponse
 */
export const optionButtonStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },

  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidths.base,
    backgroundColor: baseColors.white,
    justifyContent: 'center',
    minHeight: 50,
  },

  // État: sélectionné (avant validation)
  selected: {
    backgroundColor: '#E5E7EB',
    borderWidth: borderWidths.base + 1,
  },

  // État: correct (après validation)
  correct: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    borderWidth: borderWidths.base,
  },

  // État: incorrect (après validation)
  incorrect: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
    borderWidth: borderWidths.base,
  },

  text: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray900,
  },

  textWhite: {
    color: baseColors.white,
    fontWeight: fontWeight.bold,
  },
});

/**
 * Styles pour les boîtes de contenu (sentence, definition, etc.)
 */
export const contentBoxStyles = StyleSheet.create({
  box: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidths.base,
  },

  text: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: baseColors.gray900,
    lineHeight: 24,
  },

  textBold: {
    fontWeight: fontWeight.bold,
  },
});

/**
 * Fonction helper pour combiner les styles
 * @param {Object} baseStyles - Styles de base
 * @param {Object} customStyles - Styles personnalisés
 * @returns {Object} Styles fusionnés
 */
export const mergeStyles = (baseStyles, customStyles = {}) => {
  return { ...baseStyles, ...customStyles };
};

export default {
  baseCardStyles,
  optionButtonStyles,
  contentBoxStyles,
  mergeStyles,
};
