// ============================================
// FICHIER: src/components/pedagogy/shared/QuestionCard/style.js
// VERSION COLLEGE - Styles adaptatifs pour QuestionCard
// ============================================

import { StyleSheet } from 'react-native';
import {
  spacing,
  fontSize,
  fontWeight,
  collegeBorderRadius,
  borderWidth as borderWidths,
  collegeShadows,
} from '@themes/tokens';
import { grammarTheme, readingTheme, baseColors } from '@themes/colors';

export const styles = StyleSheet.create({
  // =================== QUESTION CARD BASE - COLLEGE ===================
  questionCard: {
    padding: spacing.lg + 2,
    borderRadius: collegeBorderRadius.lg, // 16px - sobre
    borderWidth: borderWidths.base, // Bordure fine
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
    borderRadius: collegeBorderRadius.md, // 12px (semi-rond)
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

  questionNumberText: {
    color: baseColors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  questionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
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

  // =================== HINT SECTION - COLLEGE SOBRE ===================
  hintSection: {
    marginTop: spacing.lg,
  },

  hintToggleButton: {
    paddingVertical: spacing.md, // Plus de padding vertical
    paddingHorizontal: spacing.xl, // Plus de padding horizontal
    borderRadius: collegeBorderRadius.md, // 12px
    borderWidth: 2,
    backgroundColor: baseColors.transparent, // Outline transparent
    alignSelf: 'flex-start',
    minHeight: 44, // Taille minimum tactile
    justifyContent: 'center',
  },

  hintToggleButton_grammar: {
    borderColor: grammarTheme.primary,
  },

  hintToggleButton_reading: {
    borderColor: baseColors.gray400,
  },

  hintToggleButtonUsed: {
    opacity: 0.6,
  },

  hintToggleText: {
    color: baseColors.gray600,
    fontSize: fontSize.base, // Plus gros
    fontWeight: fontWeight.bold, // Plus bold
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

  hintContentDark: {
    backgroundColor: baseColors.gray800,
  },

  hintText: {
    fontSize: fontSize.sm,
    color: grammarTheme.questionText,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },

  hintTextDark: {
    color: baseColors.gray200,
  },
});

export default styles;
