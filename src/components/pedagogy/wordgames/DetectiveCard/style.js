// ============================================
// FICHIER: src/components/pedagogy/wordgames/DetectiveCard/style.js
// ✅ Utilise commonWordGameStyles pour cohérence
// ============================================

import { StyleSheet } from 'react-native';
import { baseCardStyles, optionButtonStyles, contentBoxStyles } from '../shared/commonWordGameStyles';
import { spacing, fontSize, fontWeight } from '@themes/tokens';
import { baseColors } from '@themes/colors';

export const styles = StyleSheet.create({
  ...baseCardStyles,

  // Boîte d'instruction
  instructionBox: {
    ...contentBoxStyles.box,
    backgroundColor: '#FEF3C7',
  },

  instructionText: {
    ...contentBoxStyles.text,
    fontWeight: fontWeight.semibold,
  },

  // Container des mots
  wordsContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Styles des mots (comme des options)
  wordButton: {
    ...optionButtonStyles.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 'auto',
  },

  wordButtonSelected: optionButtonStyles.selected,
  wordButtonCorrect: optionButtonStyles.correct,
  wordButtonIncorrect: optionButtonStyles.incorrect,

  wordText: {
    ...optionButtonStyles.text,
    fontSize: fontSize.base,
  },

  wordTextWhite: optionButtonStyles.textWhite,

  // Correction text
  correctionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    color: '#10B981',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default styles;
