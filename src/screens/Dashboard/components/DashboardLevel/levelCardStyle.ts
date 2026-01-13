import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) =>
  StyleSheet.create({
    card: {
      backgroundColor: identity.branding.main, // Utilise la couleur de l'identité
      borderRadius: identity.ui.cardRadius || tokens.borderRadius.lg,
      padding: tokens.spacing.lg,
      marginBottom: tokens.spacing.md,
      position: 'relative',
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...tokens.shadows.elevated,
    },

    cardDark: {
      backgroundColor: '#1F2937',
      borderColor: '#374151',
    },

    // ========== ÉLÉMENTS DÉCORATIFS ==========
    decorativeCircle: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      top: -30,
      right: -30,
    },

    // ========== STRUCTURE PRINCIPALE ==========
    mainContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    levelBadge: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },

    levelNumber: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: tokens.fontWeight.black,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    infoContainer: {
      flex: 1,
      marginLeft: tokens.spacing.lg,
      justifyContent: 'center',
    },

    levelTitle: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.bold,
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    difficultyTag: {
      marginTop: 4,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: tokens.borderRadius.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },

    difficultyText: {
      color: '#FFFFFF',
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      textTransform: 'uppercase',
      opacity: 0.9,
    },

    statusContainer: {
      marginLeft: tokens.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },

    checkIcon: {
      fontSize: 28,
    },

    playIcon: {
      fontSize: 24,
      opacity: 0.9,
    },
  });