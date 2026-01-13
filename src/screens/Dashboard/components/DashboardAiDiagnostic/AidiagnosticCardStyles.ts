import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) =>
  StyleSheet.create({
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: identity.ui.cardRadius,
      padding: tokens.spacing.lg,
      marginHorizontal: tokens.spacing.xl,
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
    },
    title: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color: '#1F2937',
      marginLeft: tokens.spacing.sm,
    },
    masteryBadge: {
      backgroundColor: withOpacity(identity.ai.accent, 0.1),
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: 4,
      borderRadius: tokens.borderRadius.md,
    },
    masteryText: {
      color: identity.ai.accent,
      fontWeight: tokens.fontWeight.extrabold,
      fontSize: tokens.fontSize.sm,
    },
    section: {
      marginBottom: tokens.spacing.lg,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: tokens.fontWeight.black,
      color: '#9CA3AF',
      marginBottom: tokens.spacing.sm,
      letterSpacing: 1,
    },
    bubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: withOpacity(identity.ai.error, 0.1),
      padding: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
    },
    bubbleText: {
      color: identity.ai.error,
      fontSize: tokens.fontSize.sm,
      marginLeft: tokens.spacing.sm,
      flex: 1,
    },
    bold: {
      fontWeight: tokens.fontWeight.extrabold,
    },
    solutionBox: {
      padding: tokens.spacing.lg,
      borderRadius: tokens.borderRadius.lg,
      borderWidth: 1,
      borderColor: withOpacity(identity.ai.accent, 0.2),
    },
    coachMessage: {
      fontSize: tokens.fontSize.sm,
      color: '#4B5563',
      fontStyle: 'italic',
      lineHeight: 20,
      marginBottom: tokens.spacing.lg,
    },
    ctaButton: {
      backgroundColor: identity.ai.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
    },
    ctaText: {
      color: '#FFFFFF',
      fontWeight: tokens.fontWeight.bold,
      fontSize: tokens.fontSize.sm,
      marginRight: tokens.spacing.sm,
    },
  });
