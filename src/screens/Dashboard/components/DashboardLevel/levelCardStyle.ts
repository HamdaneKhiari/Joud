import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) =>
  StyleSheet.create({
    card: {
      backgroundColor: identity.palette.primary,
      borderRadius: tokens.borderRadius.md, // ✅ Réduit pour look plus compact
      paddingVertical: tokens.spacing.sm, // ✅ 8px au lieu de 16px
      paddingHorizontal: tokens.spacing.md, // ✅ 12px
      marginBottom: tokens.spacing.xs, // ✅ 4px au lieu de 12px (Timeline serrée)
      position: 'relative',
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48, // ✅ Hauteur minimale garantie
      // ✅ Ombre subtile pour affordance
      ...tokens.shadows.sm,
    },

    cardDark: {
      backgroundColor: '#1F2937',
      borderColor: '#374151',
    },

    // ========== ÉLÉMENTS DÉCORATIFS ==========
    // ✅ decorativeCircle supprimé (No-Media Premium)

    // ========== STRUCTURE PRINCIPALE ==========
    mainContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    levelBadge: {
      width: 32, // ✅ 32px au lieu de 54px
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },

    levelNumber: {
      color: '#FFFFFF',
      fontSize: 16, // ✅ 16px au lieu de 24px (proportionnel au badge)
      fontWeight: tokens.fontWeight.extrabold,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    infoContainer: {
      flex: 1,
      marginLeft: tokens.spacing.md, // ✅ 12px au lieu de 16px
      justifyContent: 'center',
    },

    levelTitle: {
      fontSize: tokens.fontSize.md, // ✅ 14px au lieu de 18px (compact)
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

    // ✅ Badges typographiques (No-Media Premium)
    statusTextCompleted: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: '#FFFFFF',
      letterSpacing: 1,
      opacity: 0.9,
    },

    statusTextProgress: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: 'rgba(255, 255, 255, 0.7)',
      letterSpacing: 1,
    },

    // ========== TIMELINE (Ligne verticale) ==========
    timelineContainer: {
      position: 'relative',
    },

    timelineLine: {
      position: 'absolute',
      left: 16, // ✅ Aligné avec le centre du badge (16px + 16px badge center)
      top: 48, // ✅ Commence après la première card
      bottom: 0,
      width: 2, // ✅ Ligne fine et élégante
      backgroundColor: 'rgba(0, 0, 0, 0.1)', // ✅ Subtile
    },

    // ========== AFFORDANCE (État pressed) ==========
    cardPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }], // ✅ Léger shrink au tap
    },
  });