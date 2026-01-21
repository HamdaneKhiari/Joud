// ============================================
// FICHIER: src/components/pedagogy/connector/LogicLinksCard/style.js
// ✅ Utilise commonWordGameStyles pour les styles partagés
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight } from '@themes/tokens';
import { baseColors } from '@themes/colors';
import { baseCardStyles, optionButtonStyles, contentBoxStyles } from '../../wordgames/shared/commonWordGameStyles';

export const styles = StyleSheet.create({
  ...baseCardStyles,

  // Box principale pour la phrase
  sentenceBox: {
    ...contentBoxStyles.box,
    backgroundColor: '#EFF6FF', // Bleu clair
  },

  sentenceText: {
    ...contentBoxStyles.text,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
  },

  // Box de traduction
  translationBox: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },

  translationText: {
    fontSize: fontSize.sm,
    color: baseColors.gray600,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Options
  optionsContainer: optionButtonStyles.container,
  optionButton: optionButtonStyles.button,
  optionButtonSelected: optionButtonStyles.selected,
  optionButtonCorrect: optionButtonStyles.correct,
  optionButtonIncorrect: optionButtonStyles.incorrect,
  optionText: optionButtonStyles.text,
  optionTextWhite: optionButtonStyles.textWhite,
});

export default styles;
