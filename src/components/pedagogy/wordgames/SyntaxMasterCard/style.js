// ============================================
// FICHIER: src/components/pedagogy/word_games/SentenceCard/style.js
// ✅ Utilise commonWordGameStyles pour les styles partagés
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, borderWidth as borderWidths } from '@themes/tokens';
import { baseColors } from '@themes/colors';
import { baseCardStyles } from '../shared/commonWordGameStyles';

export const styles = StyleSheet.create({
  ...baseCardStyles,

  // Styles spécifiques à SentenceCard

  sentenceBox: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidths.base,
    backgroundColor: '#F0F9FF',
    minHeight: 70,
  },

  orderedWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  orderedWord: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },

  orderedWordText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: baseColors.white,
  },

  emptyText: {
    fontSize: fontSize.sm,
    color: baseColors.gray400,
    fontStyle: 'italic',
  },

  availableWordsContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },

  availableLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray600,
    marginBottom: spacing.md,
  },

  availableWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  availableWord: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: borderWidths.base,
    backgroundColor: baseColors.white,
  },

  availableWordText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray900,
  },

  resetButton: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidths.base,
    alignItems: 'center',
  },

  resetButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});

export default styles;