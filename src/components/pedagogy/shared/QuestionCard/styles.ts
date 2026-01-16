/**
 * ============================================
 * QUESTION CARD - STYLES (TypeScript Edition)
 * Styles dynamiques basés sur Identity
 * ============================================
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { spacing, fontSize, fontWeight, collegeBorderRadius, borderWidth as borderWidths } from '@/themes/tokens';
import { grammarTheme, readingTheme, baseColors } from '@/themes/colors';
import type { ModuleType } from './types';

/**
 * Génère les styles dynamiquement en fonction de l'Identity
 * Note: Utilise encore grammarTheme/readingTheme legacy pour compatibilité
 * TODO: Migrer ces thèmes vers identity.branding quand tous les modules seront refaits
 */
export const getStyles = (identity: Identity) => StyleSheet.create({
  // =================== QUESTION CARD BASE ===================
  questionCard: {
    padding: spacing.lg + 2,
    borderRadius: collegeBorderRadius.lg,
    borderWidth: borderWidths.base,
    marginBottom: spacing.xl,
  },

  // Thème Grammar (violet)
  questionCard_grammar: {
    backgroundColor: grammarTheme.questionBg,
    borderColor: grammarTheme.questionBorder,
  },

  // Thème Reading (bleu)
  questionCard_reading: {
    backgroundColor: readingTheme.questionBg,
    borderColor: readingTheme.questionBorder,
  },

  // Thème Vocab (utilisera identity quand disponible)
  questionCard_vocab: {
    backgroundColor: baseColors.gray50,
    borderColor: baseColors.gray200,
  },

  // Dark mode
  questionCardDark: {
    backgroundColor: readingTheme.questionBgDark,
    borderColor: readingTheme.questionBorderDark,
  },

  // =================== QUESTION HEADER ===================
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  questionTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },

  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: collegeBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
    flexShrink: 0,
  },

  questionNumber_grammar: {
    backgroundColor: grammarTheme.primary,
  },

  questionNumber_reading: {
    backgroundColor: readingTheme.questionNumberBg,
  },

  questionNumber_vocab: {
    backgroundColor: identity.branding.main,
  },

  questionNumberText: {
    color: baseColors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold as any,
  },

  questionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as any,
    color: grammarTheme.questionText,
    flex: 1,
  },

  questionTextDark: {
    color: readingTheme.questionTextDark,
  },

  // =================== STARS INDICATOR ===================
  starsIndicator: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.md,
  },

  star: {
    fontSize: fontSize.md,
    opacity: readingTheme.starInactive,
  },

  starActive: {
    opacity: readingTheme.starActive,
  },

  // =================== OPTIONS CONTAINER ===================
  optionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  // =================== HINT SECTION ===================
  hintSection: {
    marginTop: spacing.lg,
  },

  hintToggleButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: collegeBorderRadius.md,
    borderWidth: 2,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },

  hintToggleButton_grammar: {
    borderColor: grammarTheme.primary,
  },

  hintToggleButton_reading: {
    borderColor: baseColors.gray400,
  },

  hintToggleButton_vocab: {
    borderColor: identity.branding.main,
  },

  hintToggleButtonUsed: {
    opacity: 0.6,
  },

  hintToggleText: {
    color: baseColors.gray600,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as any,
  },

  hintContent: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: collegeBorderRadius.md,
    borderLeftWidth: borderWidths.heavy,
    backgroundColor: baseColors.gray50,
  },

  hintContent_grammar: {
    borderLeftColor: grammarTheme.primary,
  },

  hintContent_reading: {
    borderLeftColor: baseColors.blue500,
  },

  hintContent_vocab: {
    borderLeftColor: identity.branding.main,
  },

  hintContentDark: {
    backgroundColor: baseColors.gray800,
  },

  hintText: {
    fontSize: fontSize.sm,
    color: grammarTheme.questionText,
    fontWeight: fontWeight.medium as any,
    lineHeight: 20,
  },

  hintTextDark: {
    color: baseColors.gray200,
  },
});
