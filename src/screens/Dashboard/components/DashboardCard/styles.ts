/**
 * ============================================
 * DashboardCard Styles - 100% White Label
 * Aucune couleur en dur, tout piloté par Identity
 * ============================================
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (
  identity: Identity,
  variantColor: 'primary' | 'accent'
) => {
  // Récupération de la couleur depuis le palette (100% White Label)
  const bgColor = identity.palette[variantColor];

  return StyleSheet.create({
    // ========== CARD CONTAINER ==========
    card: {
      marginHorizontal: tokens.spacing.xl,
      marginVertical: tokens.spacing.md,
      padding: tokens.spacing.xl,
      borderRadius: 20,
      backgroundColor: bgColor,
      overflow: 'hidden',
      position: 'relative',
      ...tokens.shadows.elevated,
    },

    // ========== CERCLES DÉCORATIFS (Signature visuelle) ==========
    decorativeCircle: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      top: -80,
      right: -80,
    },

    decorativeCircleSmall: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      bottom: -40,
      left: -40,
    },

    // ========== HEADER ==========
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: tokens.spacing.md,
      zIndex: 2,
    },

    exerciseInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.md,
      flex: 1,
    },

    exerciseIcon: {
      fontSize: 40,
    },

    exerciseTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: identity.text.onPrimary,
    },

    levelText: {
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.9)',
      marginTop: 2,
    },

    arrowIndicator: {
      fontSize: 18,
      color: identity.text.onPrimary,
    },

    // ========== BOUTON CTA ==========
    button: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: tokens.spacing.md,
      zIndex: 2,
    },

    buttonText: {
      fontWeight: '800',
      fontSize: 16,
      color: bgColor, // Texte prend la couleur de la carte
    },
  });
};
