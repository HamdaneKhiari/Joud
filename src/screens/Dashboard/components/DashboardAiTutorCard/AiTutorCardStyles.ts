import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) =>
  StyleSheet.create({
    container: {
      backgroundColor: identity.palette.surface,
      borderRadius: identity.ui.cardRadius, // Identique au diagnostic
      padding: tokens.spacing.lg,
      marginHorizontal: tokens.spacing.xl, // On reprend la même marge pour la largeur
      marginVertical: tokens.spacing.sm,
      ...tokens.shadows.elevated, // Même élévation
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 44,
      height: 44,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: withOpacity(identity.palette.primary, 0.1),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: tokens.spacing.md,
    },
    textBody: {
      flex: 1,
    },
    title: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
    },
    subtitle: {
      fontSize: tokens.fontSize.sm,
      color: identity.text.secondary,
      marginTop: 2,
    }
  });