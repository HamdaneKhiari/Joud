/**
 * ============================================
 * NavigationButtons Styles (Premium Edition)
 * Design moderne avec breathing room et ombres premium
 * ============================================
 */

import { StyleSheet } from 'react-native';
import { tokens, withOpacity } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

/**
 * Taille des boutons de navigation
 * Basée sur l'échelle de spacing pour cohérence
 */
const BUTTON_SIZE = tokens.spacing.xxxl * 2; // 64px (plus généreux que 56px)

export const createStyles = (identity: Identity) => {
  // Dérivation dynamique des couleurs neutres (White Label Rigor)
  const isDark = identity.branding.themeMode === 'dark';
  const neutralBorder = isDark
    ? withOpacity('#FFFFFF', 0.2)
    : withOpacity('#000000', 0.1);
  const neutralBg = isDark
    ? withOpacity('#FFFFFF', 0.1)
    : withOpacity('#000000', 0.05);

  return StyleSheet.create({
    navigationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // ✅ Breathing room amélioré
      paddingHorizontal: tokens.spacing.xxl,
      paddingVertical: tokens.spacing.xl,
      paddingBottom: tokens.spacing.xxl, // Extra padding en bas pour détacher du bord
      backgroundColor: identity.branding.surface,
      borderTopWidth: tokens.borderWidth.thin,
      borderTopColor: neutralBorder,
      // ✅ Ombre premium pour élévation
      ...tokens.shadows.lg,
    },
    spacer: {
      flex: 1,
    },
    navButton: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      // ✅ Boutons parfaitement ronds
      borderRadius: tokens.borderRadius.round,
      alignItems: 'center',
      justifyContent: 'center',
      // ✅ Ombre premium pour effet "floating"
      ...tokens.shadows.md,
    },
    navButtonPrev: {
      backgroundColor: neutralBg,
      borderWidth: tokens.borderWidth.thick,
      borderColor: neutralBorder,
    },
    navButtonNext: {
      // Utilise primary si disponible, sinon main
      backgroundColor: identity.branding.primary || identity.branding.main,
    },
    navButtonFinish: {
      backgroundColor: identity.branding.accent,
      // ✅ Effet "glow" subtil pour le bouton finish (ombre colorée)
      shadowColor: identity.branding.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    navButtonDisabled: {
      backgroundColor: neutralBg,
      borderWidth: tokens.borderWidth.thick,
      borderColor: neutralBorder,
      // ✅ Ombre réduite pour état désactivé
      ...tokens.shadows.xs,
      opacity: tokens.opacity.disabled,
    },
  });
};
