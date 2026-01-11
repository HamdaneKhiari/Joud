import { StyleSheet } from 'react-native';
import { Identity } from '@/themes/identities';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) =>
  StyleSheet.create({
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: identity.ui.cardRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      ...tokens.shadows.elevated,
      borderWidth: 0,
      position: 'relative',
      overflow: 'hidden',
    },

    cardDark: {
      backgroundColor: '#1F2937',
      borderColor: '#374151',
    },

    cardActive: {
      borderWidth: 0,
      ...tokens.shadows.elevated,
    },

    // ========== ÉLÉMENTS DÉCORATIFS ==========
    decorativeAccent: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      top: -30,
      right: -30,
    },

    decorativeAccentSmall: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom: -15,
      left: -15,
    },

    // ========== LEFT SECTION ==========
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.md,
      flex: 1,
    },

    icon: {
      fontSize: 52,
      textShadowColor: 'rgba(0, 0, 0, 0.15)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      zIndex: 2,
    },

    infoSection: {
      flex: 1,
    },

    title: {
      fontSize: tokens.fontSize.xl + 2,
      fontWeight: tokens.fontWeight.black,
      color: '#1F2937',
      marginBottom: 2,
      letterSpacing: -0.3,
      zIndex: 2,
    },

    titleLight: {
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },

    badge: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.semibold,
      color: '#6B7280',
      letterSpacing: 0.2,
      zIndex: 2,
    },

    badgeLight: {
      color: '#FFFFFF',
      opacity: 0.85,
    },

    encouragement: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: '#FFFFFF',
      opacity: 1,
      marginTop: tokens.spacing.xs,
      letterSpacing: 0.3,
      zIndex: 2,
    },

    // ========== RIGHT SECTION ==========
    rightSection: {
      alignItems: 'flex-end',
      gap: tokens.spacing.sm,
    },

    statusIcon: {
      fontSize: 28,
      zIndex: 2,
    },

    progressSection: {
      alignItems: 'flex-end',
      gap: tokens.spacing.xs,
    },

    progressText: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.black,
      color: identity.branding.accent,
      letterSpacing: -0.2,
      zIndex: 2,
    },

    progressTextDark: {
      color: identity.branding.accent,
    },

    progressBar: {
      width: 110,
      height: 8,
      backgroundColor: withOpacity(identity.dashboard.levelProgress, 0.2),
      borderRadius: tokens.borderRadius.round,
      overflow: 'hidden',
      borderWidth: 0,
      zIndex: 2,
    },

    progressBarDark: {
      backgroundColor: withOpacity(identity.dashboard.levelProgress, 0.2),
    },

    progressFill: {
      height: '100%',
      backgroundColor: identity.dashboard.levelProgress,
      borderRadius: tokens.borderRadius.round,
    },
  });
