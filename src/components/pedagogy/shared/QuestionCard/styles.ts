import { StyleSheet } from 'react-native';
import { spacing, withOpacity, shadows, fontSize, fontWeight } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const getStyles = (identity: Identity) => {
  return StyleSheet.create({
    questionCard: {
      padding: spacing.lg,
      borderRadius: identity.ui.cardRadius || 16,
      borderWidth: 2,
      backgroundColor: identity.palette.surface || '#FFFFFF',
      borderColor: withOpacity(identity.text.tertiary, 0.1),
      marginBottom: spacing.xl,
      ...shadows.sm,
    },
    questionText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: identity.text.primary,
      marginBottom: spacing.lg,
      lineHeight: fontSize.md * 1.5,
    },
    optionsContainer: {
      gap: spacing.md,
    },
  });
};

