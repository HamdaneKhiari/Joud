/**
 * ============================================
 * DashboardHeader Styles - Version Minimaliste
 * Simple et élégant - 100% White Label
 * ============================================
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  return StyleSheet.create({
    // ========== CONTAINER ==========
    header: {
      paddingHorizontal: tokens.spacing.xl,
      paddingTop: 60, // Pour passer sous la barre de statut
      paddingBottom: tokens.spacing.xl,
      ...tokens.shadows.elevated,
    },

    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    // ========== GAUCHE : BONJOUR [NOM] ==========
    welcomeSection: {
      gap: tokens.spacing.xs,
      flex: 1,
    },

    greeting: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: withOpacity(identity.text.onPrimary, 0.9),
      letterSpacing: 0.5,
    },

    userName: {
      fontSize: tokens.fontSize.xxxl,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.onPrimary,
      letterSpacing: -0.5,
    },

    // ========== DROITE : NOM DE L'ORGANISATION ==========
    organizationSection: {
      alignItems: 'flex-end',
    },

    organizationName: {
      fontSize: tokens.fontSize.md,
      fontWeight: tokens.fontWeight.bold,
      color: withOpacity(identity.text.onPrimary, 0.95),
      letterSpacing: 0.3,
      textAlign: 'right',
    },
  });
};
