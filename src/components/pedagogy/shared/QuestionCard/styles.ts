// ============================================
// styles.ts - Styles 100% White Label
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, withOpacity, shadows } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const getStyles = (identity: Identity, brandColor: string) => {
  // 🆕 Typography depuis identity avec fallback
  const typography = identity.typography || {
    sizes: { base: 16, md: 18, sm: 14, lg: 15 },
    weights: { bold: '700', regular: '400' },
    lineHeights: { normal: 1.5, relaxed: 1.6 },
  };

  return StyleSheet.create({
    questionCard: {
      padding: spacing.lg,
      borderRadius: identity.ui.cardRadius || 16,
      borderWidth: 2,
      backgroundColor: identity.branding.surface || '#FFFFFF',
      borderColor: withOpacity(identity.text.tertiary, 0.1),
      marginBottom: spacing.xl,
      // 🆕 Ombre depuis tokens au lieu de valeurs en dur
      ...shadows.sm,
    },
    questionText: {
      // 🆕 Typography 100% dynamique
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: identity.text.primary,
      marginBottom: spacing.lg,
      lineHeight: typography.sizes.md * (typography.lineHeights.normal || 1.5),
      // 🆕 Font family si définie
      ...(typography.families?.primary && { fontFamily: typography.families.primary }),
    },
    optionsContainer: {
      gap: spacing.md,
    },
    hintSection: {
      marginTop: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: withOpacity(identity.text.tertiary, 0.05),
      paddingTop: spacing.lg,
    },
    hintToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,  // 🆕 Utilise spacing.sm au lieu de 8
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: identity.ui?.buttonRadius || 20,  // 🆕 Rayon personnalisable
      borderWidth: 1.5,
      borderColor: brandColor,
      alignSelf: 'flex-start',
    },
    hintToggleText: {
      color: brandColor,
      fontWeight: typography.weights.bold,
      fontSize: typography.sizes.sm,
      ...(typography.families?.primary && { fontFamily: typography.families.primary }),
    },
    hintContent: {
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: identity.ui?.cardRadius ? identity.ui.cardRadius * 0.75 : 12,  // 🆕 Proportionnel au cardRadius
      backgroundColor: withOpacity(brandColor, 0.05),
      borderLeftWidth: 4,
      borderLeftColor: brandColor,
    },
   hintText: {
  color: identity.text.primary,
  fontSize: typography.sizes.lg,
  lineHeight: typography.sizes.lg * (typography.lineHeights.relaxed || 1.6),
  fontStyle: typography.styles?.hint || 'normal',  // ✅ Dynamique avec fallback
  ...(typography.families?.secondary && { fontFamily: typography.families.secondary }),
}
  });
};

