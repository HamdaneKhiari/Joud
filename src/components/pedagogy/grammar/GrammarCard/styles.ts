/**
 * ============================================
 * GRAMMAR CARD - STYLES (100% White Label)
 * Fonction dynamique basée sur Identity
 * Design sobre et typographique inspiré Apple
 * ============================================
 */

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, shadows, withOpacity } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import type { Identity } from '@/themes/ThemeContext';
import { getExerciseConfig } from '@/utils/exerciseMoodHelper';

/**
 * Génère les styles dynamiquement en fonction de l'Identity
 * ✅ WHITE LABEL: Utilise identity.text pour les couleurs de texte
 * ✅ NO-MEDIA: Design typographique sans emojis
 */
export const getStyles = (identity: Identity) => {
  const config = getExerciseConfig(identity);

  return StyleSheet.create({
  // ============================================
  // THEME CONTAINER (Section colorée)
  // ============================================
  themeContainer: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
    borderRadius: config.borderRadius.card,
  },

  // ============================================
  // CARD CONTAINER (Section blanche exercice)
  // ============================================
  card: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
    backgroundColor: baseColors.white,
    borderRadius: config.borderRadius.card,
    overflow: 'hidden',
    ...shadows.md,
  },

  cardContent: {
    padding: config.padding.container,
  },

  // ============================================
  // SECTION: RULE (Règle de grammaire)
  // ============================================
  ruleSection: {
    marginBottom: spacing.xxl,
  },

  ruleSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as any,
    textTransform: 'uppercase' as any,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    opacity: 0.6,
    color: identity.text.onPrimary, // ✅ WHITE LABEL
  },

  ruleText: {
    fontSize: config.fontSize.subtitle,
    fontWeight: fontWeight.bold as any,
    lineHeight: config.fontSize.subtitle * 1.5,
    letterSpacing: -0.3,
    color: identity.text.onPrimary,
  },

  // ============================================
  // SECTION: EXAMPLES
  // ============================================
  examplesSection: {
    marginBottom: spacing.xxl,
  },

  examplesSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as any,
    textTransform: 'uppercase' as any,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    opacity: 0.6,
    color: identity.text.onPrimary, // ✅ WHITE LABEL
  },

  exampleItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: withOpacity('#000000', 0.03),
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },

  exampleText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium as any,
    lineHeight: fontSize.md * 1.4,
    letterSpacing: 0.2,
    color: identity.text.primary, // ✅ WHITE LABEL
  },

  // ============================================
  // SECTION: EXERCISE (Question)
  // ============================================
  exerciseSection: {
    marginBottom: spacing.lg,
  },

  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    marginBottom: spacing.xl,
    lineHeight: fontSize.lg * 1.4,
    letterSpacing: -0.2,
    color: identity.text.primary, // ✅ WHITE LABEL
  },

  // ============================================
  // OPTIONS (Boutons de réponse)
  // ============================================
  optionsContainer: {
    gap: spacing.md,
  },

  optionButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    backgroundColor: baseColors.white,
    ...shadows.sm,
  },

  optionButtonDefault: {
    borderColor: withOpacity('#000000', 0.1),
  },

  optionButtonSelected: {
    borderColor: identity.palette.primary, // ✅ WHITE LABEL
    backgroundColor: withOpacity('#000000', 0.03),
  },

  optionButtonCorrect: {
    borderColor: baseColors.green500,
    backgroundColor: baseColors.green50,
  },

  optionButtonIncorrect: {
    borderColor: baseColors.red500,
    backgroundColor: baseColors.red50,
  },

  optionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as any,
    textAlign: 'center' as any,
    letterSpacing: 0.3,
  },

  optionTextDefault: {
    color: identity.text.primary, // ✅ WHITE LABEL
  },

  optionTextSelected: {
    color: identity.text.primary, // ✅ WHITE LABEL
    fontWeight: fontWeight.bold as any,
  },

  optionTextCorrect: {
    color: baseColors.green800,
    fontWeight: fontWeight.bold as any,
  },

  optionTextIncorrect: {
    color: baseColors.red800,
    fontWeight: fontWeight.bold as any,
  },

  // ============================================
  // DISABLED STATE
  // ============================================
  optionButtonDisabled: {
    opacity: 0.5,
  },

  // ============================================
  // DIVIDER
  // ============================================
  divider: {
    height: 1,
    backgroundColor: withOpacity('#000000', 0.08),
    marginVertical: spacing.xl,
  },
});};
