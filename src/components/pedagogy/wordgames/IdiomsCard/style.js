// ============================================
// FICHIER: src/components/pedagogy/wordgames/IdiomsCard/style.js
// ✅ Utilise commonWordGameStyles pour cohérence
// ============================================

import { StyleSheet } from 'react-native';
import { baseCardStyles, optionButtonStyles, contentBoxStyles } from '../shared/commonWordGameStyles';
import { spacing, fontSize, fontWeight } from '@themes/tokens';

export const styles = StyleSheet.create({
  ...baseCardStyles,

  // Boîte d'idiome
  idiomBox: {
    ...contentBoxStyles.box,
    backgroundColor: '#F0F9FF',
  },

  idiomText: {
    ...contentBoxStyles.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },

  contextText: {
    ...contentBoxStyles.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // Instruction
  instructionBox: {
    ...contentBoxStyles.box,
    backgroundColor: '#FEF3C7',
  },

  instructionText: {
    ...contentBoxStyles.text,
    fontWeight: fontWeight.semibold,
  },

  // Options (réutilise les styles communs)
  optionsContainer: optionButtonStyles.container,
  optionButton: optionButtonStyles.button,
  optionButtonSelected: optionButtonStyles.selected,
  optionButtonCorrect: optionButtonStyles.correct,
  optionButtonIncorrect: optionButtonStyles.incorrect,
  optionText: optionButtonStyles.text,
  optionTextWhite: optionButtonStyles.textWhite,

  // Validate button
  validateButton: {
    ...optionButtonStyles.button,
    minHeight: 50,
  },
});

export default styles;
