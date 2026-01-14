import { StyleSheet } from 'react-native';
import { spacing, borderRadius, borderWidth as borderWidths, shadows } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const createStyles = (identity: Identity) => {
  // ✅ Dérivation dynamique des couleurs neutres (White Label Rigor)
  const isDark = identity.branding.themeMode === 'dark';
  const neutralBorder = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
  const neutralBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

  return StyleSheet.create({
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: identity.branding.surface,
    borderTopWidth: borderWidths.thin,
    borderTopColor: neutralBorder, // ✅ Bordure dynamique
    ...shadows.lg,
  },
  spacer: {
    flex: 1,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: identity.ui.cardRadius * 2, // Rond ou adapté au radius
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  navButtonPrev: {
    backgroundColor: neutralBg, // ✅ Fond neutre dynamique
    borderWidth: 1,
    borderColor: neutralBorder,
  },
  navButtonNext: {
    backgroundColor: identity.branding.primary, // Couleur principale
  },
  navButtonFinish: {
    backgroundColor: identity.branding.accent, // Couleur d'accent pour la fin
  },
  navButtonDisabled: {
    backgroundColor: neutralBg,
    borderWidth: borderWidths.thick,
    borderColor: neutralBorder,
    // Note: shadowOpacity n'est pas supporté directement par RN sans shadows.md
    elevation: 3,
  },
});
}