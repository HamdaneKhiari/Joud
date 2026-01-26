/**
 * ============================================
 * LevelCard Styles - 100% White Label
 * Toutes les couleurs pilotées par Identity
 * ============================================
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) =>
  StyleSheet.create({
    card: {
      backgroundColor: identity.palette.primary,
      borderRadius: tokens.borderRadius.md,
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.md,
      marginBottom: tokens.spacing.xs,
      position: 'relative',
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
      ...tokens.shadows.sm,
    },

    cardDark: {
      backgroundColor: identity.palette.primary,
    },

    // ========== STRUCTURE PRINCIPALE ==========
    mainContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    levelBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },

    levelNumber: {
      color: identity.text.onPrimary,
      fontSize: 16,
      fontWeight: tokens.fontWeight.extrabold,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    infoContainer: {
      flex: 1,
      marginLeft: tokens.spacing.md,
      justifyContent: 'center',
    },

    levelTitle: {
      fontSize: tokens.fontSize.md,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.onPrimary,
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
      color: identity.text.onPrimary,
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

    // ========== BADGES TYPOGRAPHIQUES ==========
    statusTextCompleted: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.onPrimary,
      letterSpacing: 1,
      opacity: 0.9,
    },

    statusTextProgress: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: withOpacity(identity.text.onPrimary, 0.7),
      letterSpacing: 1,
    },

    // ========== TIMELINE (Ligne verticale) ==========
    timelineContainer: {
      position: 'relative',
    },

    timelineLine: {
      position: 'absolute',
      left: 16,
      top: 48,
      bottom: 0,
      width: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },

    // ========== AFFORDANCE (État pressed) ==========
    cardPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
  });
