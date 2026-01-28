// ============================================
// FICHIER: src/components/pedagogy/word_games/BlanksCard/style.js
// ✅ Utilise commonWordGameStyles pour les styles partagés
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius } from '@themes/tokens';
import { baseColors } from '@themes/colors';
import { baseCardStyles, optionButtonStyles, contentBoxStyles } from '../shared/commonWordGameStyles';

export const styles = StyleSheet.create({
  ...baseCardStyles,

  // Styles spécifiques à BlanksCard
  sentenceBox: {
    ...contentBoxStyles.box,
    backgroundColor: '#FEF3C7',
  },

  sentenceText: {
    ...contentBoxStyles.text,
    fontWeight: fontWeight.bold,
  },

  optionsContainer: optionButtonStyles.container,
  optionButton: optionButtonStyles.button,
  optionButtonSelected: optionButtonStyles.selected,
  optionButtonCorrect: optionButtonStyles.correct,
  optionButtonIncorrect: optionButtonStyles.incorrect,
  optionText: optionButtonStyles.text,
  optionTextWhite: optionButtonStyles.textWhite,

  feedbackBox: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },

  feedbackCorrect: { backgroundColor: '#DCFCE7' },
  feedbackIncorrect: { backgroundColor: '#FEE2E2' },

  feedbackIcon: { fontSize: fontSize.lg },
  feedbackText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  nextButton: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },

  nextButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: baseColors.white,
  },
});

export default styles;