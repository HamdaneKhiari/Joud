// ============================================
// styles.ts - Styles 100% White Label
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, withOpacity, shadows, fontSize, fontWeight } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const getStyles = (identity: Identity, brandColor: string) => {
  return StyleSheet.create({
    questionCard: {
      padding: spacing.lg,
      borderRadius: identity.ui.cardRadius || 16,
      borderWidth: 2,
      backgroundColor: identity.palette.surface || '#FFFFFF',
      borderColor: withOpacity(identity.text.tertiary, 0.1),
      marginBottom: spacing.xl,
      // 🆕 Ombre depuis tokens au lieu de valeurs en dur
      ...shadows.sm,
    },
    questionText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold as any,
      color: identity.text.primary,
      marginBottom: spacing.lg,
      lineHeight: fontSize.md * 1.5,
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
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: identity.ui.cardRadius || 20,
      borderWidth: 1.5,
      borderColor: brandColor,
      alignSelf: 'flex-start',
    },
    hintToggleText: {
      color: brandColor,
      fontWeight: fontWeight.bold as any,
      fontSize: fontSize.sm,
    },
    hintContent: {
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: identity.ui.cardRadius * 0.75,
      backgroundColor: withOpacity(brandColor, 0.05),
      borderLeftWidth: 4,
      borderLeftColor: brandColor,
    },
    hintText: {
      color: identity.text.primary,
      fontSize: fontSize.lg,
      lineHeight: fontSize.lg * 1.6,
      fontStyle: 'normal' as any,
    }
  });
};

