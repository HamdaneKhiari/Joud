// ============================================
// FICHIER: src/components/pedagogy/word_games/DefinitionCard/style.js
// ✅ Utilise commonWordGameStyles pour les styles partagés
// ============================================

import { StyleSheet } from 'react-native';
import { baseCardStyles, optionButtonStyles, contentBoxStyles } from '../shared/commonWordGameStyles';

export const styles = StyleSheet.create({
  ...baseCardStyles,

  // Styles spécifiques à DefinitionCard
  definitionBox: {
    ...contentBoxStyles.box,
    backgroundColor: '#F0F9FF',
  },

  definitionText: contentBoxStyles.text,

  optionsContainer: optionButtonStyles.container,
  optionButton: optionButtonStyles.button,
  optionButtonSelected: optionButtonStyles.selected,
  optionButtonCorrect: optionButtonStyles.correct,
  optionButtonIncorrect: optionButtonStyles.incorrect,
  optionText: optionButtonStyles.text,
  optionTextWhite: optionButtonStyles.textWhite,
});

export default styles;