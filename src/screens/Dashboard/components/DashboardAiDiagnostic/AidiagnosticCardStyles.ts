/**
 * AIDiagnosticCard Styles - 100% White Label + Mood-Aware
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';
  const cardRadius = isPlayful ? 24 : identity.ui.cardRadius;

  return StyleSheet.create({
    container: {
      backgroundColor: identity.palette.surface,
      borderRadius: cardRadius,
      padding: isPlayful ? tokens.spacing.xl : tokens.spacing.lg,
      marginHorizontal: isPlayful ? tokens.spacing.lg : tokens.spacing.xl,
      marginVertical: tokens.spacing.md,
      ...tokens.shadows.elevated,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.spacing.lg,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
    },
    title: {
      fontSize: isPlayful ? tokens.fontSize.lg : tokens.fontSize.base,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
    },
    masteryBadge: {
      backgroundColor: withOpacity(identity.aiDiagnostic.accent, isPlayful ? 0.15 : 0.1),
      paddingHorizontal: isPlayful ? tokens.spacing.lg : tokens.spacing.md,
      paddingVertical: isPlayful ? tokens.spacing.sm : 4,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md,
    },
    masteryText: {
      color: identity.aiDiagnostic.accent,
      fontWeight: tokens.fontWeight.black,
      fontSize: isPlayful ? tokens.fontSize.lg : tokens.fontSize.sm,
    },
    section: {
      marginBottom: tokens.spacing.lg,
    },
    sectionLabel: {
      fontSize: isPlayful ? tokens.fontSize.xs : 10,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.tertiary,
      marginBottom: tokens.spacing.sm,
      letterSpacing: isPlayful ? 0.5 : 1,
      textTransform: isPlayful ? undefined : 'uppercase',
    },
    bubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: withOpacity(identity.aiDiagnostic.error, 0.1),
      padding: isPlayful ? tokens.spacing.lg : tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md,
    },
    bubbleText: {
      color: identity.aiDiagnostic.error,
      fontSize: isPlayful ? tokens.fontSize.base : tokens.fontSize.sm,
      fontWeight: isPlayful ? tokens.fontWeight.semibold : tokens.fontWeight.medium,
      marginLeft: tokens.spacing.sm,
      flex: 1,
    },
    bold: {
      fontWeight: tokens.fontWeight.black,
    },
    solutionBox: {
      padding: isPlayful ? tokens.spacing.xl : tokens.spacing.lg,
      borderRadius: isPlayful ? tokens.borderRadius.xxl : tokens.borderRadius.lg,
      borderWidth: isPlayful ? 0 : 1,
      borderColor: withOpacity(identity.aiDiagnostic.accent, 0.2),
    },
    coachMessage: {
      fontSize: isPlayful ? tokens.fontSize.base : tokens.fontSize.sm,
      color: identity.text.secondary,
      fontStyle: isPlayful ? undefined : 'italic',
      fontWeight: isPlayful ? tokens.fontWeight.medium : tokens.fontWeight.regular,
      lineHeight: isPlayful ? 24 : 20,
      marginBottom: tokens.spacing.lg,
    },
    ctaButton: {
      backgroundColor: identity.aiDiagnostic.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isPlayful ? tokens.spacing.lg : tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md,
      ...tokens.shadows.md,
    },
    ctaText: {
      color: identity.text.onPrimary,
      fontWeight: tokens.fontWeight.black,
      fontSize: isPlayful ? tokens.fontSize.base : tokens.fontSize.sm,
      marginRight: tokens.spacing.sm,
    },
  });
};
