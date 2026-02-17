/**
 * ============================================
 * GRAMMAR CARD - STYLES (100% White Label)
 * Design épuré avec accents colorés
 * ============================================
 */

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import type { Identity } from '@/themes/ThemeContext';
import { getExerciseConfig } from '@/utils/exerciseMoodHelper';

export const getStyles = (identity: Identity) => {
  const config = getExerciseConfig(identity);

  return StyleSheet.create({
  // ============================================
  // RULE CARD (fond teinté + accent gauche)
  // ============================================
  ruleCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    borderRadius: config.borderRadius.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },

  cardContent: {
    padding: config.padding.container,
  },

  // Titre en badge/pill
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },

  titleBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 0.5,
  },

  // Règle principale
  ruleText: {
    fontSize: config.fontSize.subtitle,
    fontWeight: fontWeight.medium as any,
    lineHeight: config.fontSize.subtitle * 1.6,
    letterSpacing: -0.2,
  },

  // Explication vulgarisée (après exemples)
  simplifiedBox: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
  },

  simplifiedLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold as any,
    textTransform: 'uppercase' as any,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },

  simplifiedText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular as any,
    lineHeight: fontSize.md * 1.5,
    fontStyle: 'italic' as any,
  },

  // ============================================
  // EXAMPLES (avec puces colorées)
  // ============================================
  examplesContainer: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },

  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold as any,
    textTransform: 'uppercase' as any,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },

  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },

  exampleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: spacing.md,
  },

  exampleText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium as any,
    lineHeight: fontSize.md * 1.5,
    letterSpacing: 0.2,
  },

  // ============================================
  // EXERCISE CARD (blanche avec ombre)
  // ============================================
  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: baseColors.white,
    borderRadius: config.borderRadius.card,
    overflow: 'hidden',
    ...shadows.md,
  },

  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    marginBottom: spacing.xl,
    lineHeight: fontSize.lg * 1.4,
    letterSpacing: -0.2,
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
    borderColor: identity.text.tertiary + '25',
  },

  optionButtonSelected: {
    borderColor: identity.palette.primary,
    backgroundColor: identity.palette.primary + '08',
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
    color: identity.text.primary,
  },

  optionTextSelected: {
    color: identity.palette.primary,
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

  optionButtonDisabled: {
    opacity: 0.5,
  },
});};
