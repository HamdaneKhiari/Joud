// ============================================
// FICHIER: src/screens/exercises/Assessment/AssessmentResultsScreen/style.js
// ✅ REFACTORISÉ - Utilise les tokens
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '@themes/tokens';
import { baseColors } from '@themes/colors';

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: baseColors.white,
  },

  // ===== CONTENT =====
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },

  // ===== SCORE CARD =====
  scoreCard: {
    margin: spacing.xl,
    backgroundColor: baseColors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  mainMessage: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extraBold,
    color: baseColors.gray900,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: fontSize.base,
    color: baseColors.gray600,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  scoreContainer: {
    borderWidth: 4,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: fontWeight.extraBold,
    marginBottom: spacing.xs,
  },
  scoreDetails: {
    fontSize: fontSize.base,
    color: baseColors.gray600,
  },

  // ===== DETAILS SECTION =====
  detailsSection: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: baseColors.gray900,
    marginBottom: spacing.lg,
  },

  // ===== BUTTON =====
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  continueButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  continueButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: baseColors.white,
  },
});
