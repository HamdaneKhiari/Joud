// ============================================
// FICHIER: src/components/pedagogy/connector/RephrasingCard/style.js
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius } from '@themes/tokens';
import { baseColors } from '@themes/colors';
import { baseCardStyles } from '../../wordgames/shared/commonWordGameStyles';

export const styles = StyleSheet.create({
  ...baseCardStyles,

  // Box phrase de base
  baseSentenceBox: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },

  baseSentenceLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: baseColors.gray700,
    marginBottom: spacing.xs,
  },

  baseSentenceText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: baseColors.gray900,
  },

  // Box instruction
  instructionBox: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  instructionIcon: {
    fontSize: fontSize.xl,
  },

  instructionText: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  // Section réponse
  answerSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },

  answerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: baseColors.gray700,
    marginBottom: spacing.sm,
  },

  answerInput: {
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: baseColors.gray900,
    backgroundColor: baseColors.white,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  answerInputCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },

  answerInputIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  // Box de correction
  correctAnswerBox: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#F0FDF4',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#22C55E',
  },

  correctAnswerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#15803D',
    marginBottom: spacing.xs,
  },

  correctAnswerText: {
    fontSize: fontSize.base,
    color: '#166534',
    fontWeight: fontWeight.medium,
  },

  // Traduction
  translationBox: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.lg,
  },

  translationText: {
    fontSize: fontSize.sm,
    color: baseColors.gray600,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default styles;
