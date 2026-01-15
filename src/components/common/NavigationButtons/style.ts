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
 * ✅ 72px pour élégance et impact visuel
 */
const BUTTON_SIZE = 72;

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
      // ✅ Breathing room généreux (32px)
      paddingHorizontal: tokens.spacing.xxxl,
      paddingVertical: tokens.spacing.xxl,
      paddingBottom: tokens.spacing.xxxl, // Extra padding en bas pour détacher du bord
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
      // ✅ Ombre ultra-premium (XL pour impact maximal)
      ...tokens.shadows.xl,
    },
    navButtonPrev: {
      backgroundColor: neutralBg,
      borderWidth: tokens.borderWidth.thick,
      borderColor: neutralBorder,
    },
    navButtonNext: {
      // Utilise primary si disponible, sinon main
      backgroundColor: identity.branding.primary || identity.branding.main,
      // ✅ Bordure neutre pour look premium
      borderWidth: tokens.borderWidth.thin,
      borderColor: isDark ? withOpacity('#FFFFFF', 0.3) : withOpacity('#000000', 0.15),
      // ✅ Glow accent pour effet dynamique
      shadowColor: identity.branding.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
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
