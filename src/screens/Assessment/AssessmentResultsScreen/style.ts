/**
 * AssessmentResultsScreen Styles
 * (Legacy screen - non routé mais conservé pour référence)
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';

const { spacing, fontSize, fontWeight, borderRadius, shadows } = tokens;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseColors.white,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
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
    fontWeight: fontWeight.extrabold,
    color: baseColors.gray900,
    marginBottom: spacing.xs,
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
    fontWeight: fontWeight.extrabold,
    marginBottom: spacing.xs,
  },
  scoreDetails: {
    fontSize: fontSize.base,
    color: baseColors.gray600,
  },
  detailsSection: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: baseColors.gray900,
    marginBottom: spacing.lg,
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
