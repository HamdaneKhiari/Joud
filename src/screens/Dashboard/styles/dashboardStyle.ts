import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  // Espacement dynamique selon l'identité
  // Primary (enfants) : plus aéré et ludique
  // Adult : plus compact et sobre
  const getSectionSpacing = () => {
    switch (identity.id) {
      case 'primary':
        return tokens.spacing.xl; // 20px - plus aéré
      case 'college':
        return tokens.spacing.lg; // 16px - équilibré
      case 'lycee':
        return tokens.spacing.md; // 12px - plus compact
      case 'adult':
        return tokens.spacing.md; // 12px - sobre
      default:
        return tokens.spacing.lg;
    }
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: identity.palette.surface,
    },

    scrollContent: {
      paddingBottom: tokens.spacing.xxxl,
    },

    section: {
      marginTop: getSectionSpacing(),
    },

    sectionHeader: {
      marginTop: tokens.spacing.xl,
      paddingHorizontal: tokens.spacing.xl,
    },

    levelsGrid: {
      position: 'relative', // ✅ Pour la ligne Timeline
      gap: tokens.spacing.md,
    },

    // ========== TIMELINE ==========
    timelineLine: {
      position: 'absolute',
      left: 16, // ✅ Aligné avec le centre du badge (32px/2 = 16px)
      top: 48, // ✅ Commence après la première card
      bottom: 0,
      width: 2,
      backgroundColor: identity.themeMode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.08)', // ✅ Ligne subtile adaptative
      zIndex: 0, // ✅ Derrière les cards
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
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
      marginBottom: tokens.spacing.md,
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
