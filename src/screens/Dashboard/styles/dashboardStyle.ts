import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';

  const sectionSpacing = isPlayful ? tokens.spacing.xl : tokens.spacing.md;
  const contentPadding = isPlayful ? tokens.spacing.lg : tokens.spacing.md;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: identity.palette.background,
    },

    scrollContent: {
      paddingBottom: tokens.spacing.xxxl,
    },

    section: {
      marginTop: sectionSpacing,
    },

    sectionHeader: {
      marginTop: tokens.spacing.xl,
      paddingHorizontal: contentPadding,
    },

    levelsGrid: {
      position: 'relative',
      gap: isPlayful ? tokens.spacing.lg : tokens.spacing.md,
    },

    timelineLine: {
      position: 'absolute',
      left: isPlayful ? 24 : 16,
      top: isPlayful ? 64 : 48,
      bottom: 0,
      width: isPlayful ? 3 : 2,
      backgroundColor: identity.themeMode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.08)',
      zIndex: 0,
    },

    dailyWordTitle: {
      fontSize: tokens.fontSize.xxl,
      fontWeight: tokens.fontWeight.extrabold,
      color: identity.text.primary,
      marginTop: tokens.spacing.sm,
    },

    dailyWordSubtitle: {
      fontSize: tokens.fontSize.lg,
      color: identity.text.secondary,
      marginTop: tokens.spacing.xs,
      fontStyle: 'italic',
    },

    revisionTitle: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
      marginBottom: tokens.spacing.xs,
    },

    revisionSubtitle: {
      fontSize: tokens.fontSize.sm,
      color: identity.text.secondary,
      letterSpacing: 0.2,
    },

    sectionTitle: {
      fontSize: isPlayful ? tokens.fontSize.xxl : tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      marginBottom: tokens.spacing.md,
      letterSpacing: isPlayful ? -0.5 : 0,
      ...(isPlayful && { textAlign: 'center' }),
    },

    resumeFamilyName: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
    },

    resumeLevelText: {
      fontSize: tokens.fontSize.sm,
      color: identity.text.secondary,
      marginTop: tokens.spacing.xs,
    },

    resumeContainer: {
      marginTop: tokens.spacing.md,
      marginBottom: tokens.spacing.md,
    },

    progressBarContainer: {
      height: 8,
      backgroundColor: identity.themeMode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
      borderRadius: identity.ui.cardRadius,
      overflow: 'hidden',
    },

    progressBarFill: {
      height: '100%',
      backgroundColor: identity.dashboard.levelProgress,
      borderRadius: identity.ui.cardRadius,
    },
  });
};
