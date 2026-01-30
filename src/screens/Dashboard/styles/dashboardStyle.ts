import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  // ============================================
  // CONFIGURATION MOOD-AWARE
  // ============================================
  const isPlayful = identity.ui.mood === 'playful';

  // 🎯 Espacement dynamique basé sur le mood
  const sectionSpacing = isPlayful ? tokens.spacing.xl : tokens.spacing.md;
  const cardRadius = isPlayful ? 24 : 16;
  const contentPadding = isPlayful ? tokens.spacing.lg : tokens.spacing.md;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: identity.palette.background, // ✅ background au lieu de surface
    },

    scrollContent: {
      paddingBottom: tokens.spacing.xxxl,
    },

    section: {
      marginTop: sectionSpacing, // ✅ Mood-aware
    },

    sectionHeader: {
      marginTop: tokens.spacing.xl,
      paddingHorizontal: contentPadding, // ✅ Mood-aware
    },

    levelsGrid: {
      position: 'relative',
      gap: isPlayful ? tokens.spacing.lg : tokens.spacing.md, // ✅ Mood-aware
    },

    // ========== TIMELINE ==========
    timelineLine: {
      position: 'absolute',
      left: isPlayful ? 24 : 16, // ✅ Adapté au mood
      top: isPlayful ? 64 : 48,
      bottom: 0,
      width: isPlayful ? 3 : 2, // ✅ Plus épaisse si playful
      backgroundColor: identity.themeMode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.08)',
      zIndex: 0,
    },

    // ========== DAILY WORD (Mot du jour) ==========
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

    // ========== REVISION ==========
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

    // ========== SECTION TITLES ==========
    sectionTitle: {
      fontSize: isPlayful ? tokens.fontSize.xxl : tokens.fontSize.lg, // ✅ Plus grand si playful
      fontWeight: tokens.fontWeight.black, // ✅ Plus bold
      color: identity.text.primary,
      marginBottom: tokens.spacing.md,
      letterSpacing: isPlayful ? -0.5 : 0, // ✅ Condensé si playful
      ...(isPlayful && { textAlign: 'center' }), // ✅ Centré si playful
    },

    // ========== RESUME LESSON ==========
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

    // ========== RESUME PROGRESS BAR ==========
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
