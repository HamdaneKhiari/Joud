// ============================================
// FICHIER: src/screens/exercises/Assessment/styles/questionStyles.js
// 🎨 Styles partagés pour tous les types de questions
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '@themes/tokens';
import { baseColors } from '@themes/colors';

export const questionStyles = StyleSheet.create({
  // ===== CONTAINER PRINCIPAL =====
  card: {
    backgroundColor: baseColors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },

  // ===== EN-TÊTE DE QUESTION =====
  questionContainer: {
    marginBottom: spacing.xl,
  },

  questionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: baseColors.gray900,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },

  questionTextFr: {
    fontSize: fontSize.base,
    color: baseColors.gray600,
    fontStyle: 'italic',
  },

  // ===== PASSAGE (pour Reading) =====
  passageContainer: {
    backgroundColor: baseColors.gray50,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: baseColors.blue500,
    marginBottom: spacing.xl,
  },

  passageText: {
    fontSize: fontSize.base,
    color: baseColors.gray700,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // ===== OPTIONS (Choix multiples) =====
  optionsContainer: {
    gap: spacing.md,
  },

  optionButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: baseColors.gray50,
    borderWidth: 2,
    borderColor: baseColors.gray200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  optionSelected: {
    backgroundColor: baseColors.blue50,
    borderWidth: 3,
  },

  optionCorrect: {
    backgroundColor: baseColors.green50,
    borderColor: baseColors.green500,
    borderWidth: 3,
  },

  optionIncorrect: {
    backgroundColor: baseColors.red50,
    borderColor: baseColors.red500,
    borderWidth: 3,
  },

  optionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray700,
    flex: 1,
    lineHeight: 22,
  },

  optionTextLarge: {
    fontSize: fontSize.lg,
  },

  optionTextSelected: {
    fontWeight: fontWeight.bold,
  },

  optionTextCorrect: {
    color: baseColors.green700,
    fontWeight: fontWeight.bold,
  },

  optionTextIncorrect: {
    color: baseColors.red700,
    fontWeight: fontWeight.bold,
  },

  optionIcon: {
    fontSize: 24,
    color: baseColors.green500,
    fontWeight: fontWeight.bold,
  },

  optionIconIncorrect: {
    fontSize: 24,
    color: baseColors.red500,
    fontWeight: fontWeight.bold,
  },

  // ===== INPUT (Blanks) =====
  inputContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },

  input: {
    borderWidth: 3,
    borderColor: baseColors.gray300,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray900,
    backgroundColor: baseColors.gray50,
  },

  inputCorrect: {
    borderColor: baseColors.green500,
    backgroundColor: baseColors.green50,
    color: baseColors.green700,
  },

  inputIncorrect: {
    borderColor: baseColors.red500,
    backgroundColor: baseColors.red50,
    color: baseColors.red700,
  },

  inputIcon: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    transform: [{ translateY: -12 }],
    fontSize: 24,
    color: baseColors.green500,
    fontWeight: fontWeight.bold,
  },

  inputIconIncorrect: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    transform: [{ translateY: -12 }],
    fontSize: 24,
    color: baseColors.red500,
    fontWeight: fontWeight.bold,
  },

  // ===== BONNE RÉPONSE =====
  correctAnswerContainer: {
    padding: spacing.lg,
    backgroundColor: baseColors.green50,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: baseColors.green500,
    marginBottom: spacing.lg,
  },

  correctAnswerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: baseColors.green700,
    marginBottom: spacing.xs,
  },

  correctAnswerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: baseColors.green700,
  },

  // ===== EXPLICATION =====
  explanationContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: baseColors.blue50,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: baseColors.blue500,
    flexDirection: 'row',
    gap: spacing.md,
  },

  explanationIcon: {
    fontSize: 20,
  },

  explanationText: {
    fontSize: fontSize.base,
    color: baseColors.gray700,
    flex: 1,
    lineHeight: 22,
  },
});