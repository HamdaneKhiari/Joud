import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';
  const cardRadius = isPlayful ? 24 : 16;

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.lg,
      marginVertical: tokens.spacing.md,
    },

    card: {
      flex: 1,
      backgroundColor: identity.palette.surface,
      borderRadius: cardRadius,
      paddingVertical: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      ...(isPlayful ? tokens.shadows.md : tokens.shadows.sm),
      position: 'relative',
      overflow: 'hidden',
      minHeight: isPlayful ? 100 : 90,
    },

    cardDark: {
      backgroundColor: identity.palette.surface,
    },

    // Variantes avec couleurs thématiques par métrique
    cardWordsLearned: {
      backgroundColor: identity.palette.accent,
      ...(isPlayful ? tokens.shadows.elevated : tokens.shadows.md),
    },

    cardStreak: {
      backgroundColor: identity.aiDiagnostic.accent,
      ...(isPlayful ? tokens.shadows.elevated : tokens.shadows.md),
    },

    badgeLabel: {
      fontSize: 9,
      fontWeight: tokens.fontWeight.extrabold,
      color: withOpacity(identity.text.onPrimary, 0.5),
      letterSpacing: 1.5,
      marginBottom: tokens.spacing.xs,
      textAlign: 'center',
      zIndex: 2,
    },

    // Fallback si pas de badgeLabel
    emoji: {
      fontSize: isPlayful ? 32 : 28,
      marginBottom: tokens.spacing.xs,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      zIndex: 2,
    },

    value: {
      fontSize: isPlayful ? tokens.fontSize.xxxl : tokens.fontSize.xxl,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      marginBottom: tokens.spacing.xs,
      letterSpacing: -0.5,
      zIndex: 2,
    },

    valueWordsLearned: {
      color: identity.text.onPrimary,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    valueStreak: {
      color: identity.text.onPrimary,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    valueDark: {
      color: identity.text.primary,
    },

    label: {
      fontSize: 11,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.secondary,
      textAlign: 'center',
      letterSpacing: 0.2,
      zIndex: 2,
    },

    labelWordsLearned: {
      color: identity.text.onPrimary,
      opacity: 0.9,
    },

    labelStreak: {
      color: identity.text.onPrimary,
      opacity: 0.9,
    },

    labelDark: {
      color: identity.text.tertiary,
    },
  });
};
