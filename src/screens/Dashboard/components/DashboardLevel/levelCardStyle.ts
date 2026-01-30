import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      minHeight: isPlayful ? 90 : 80, // ✅ Plus haut si playful
    },
    // --- Colonne de gauche (Timeline) ---
    timelineContainer: {
      width: isPlayful ? 56 : 50, // ✅ Plus large si playful
      alignItems: 'center',
    },
    badge: {
      width: isPlayful ? 44 : 38, // ✅ Plus grand si playful
      height: isPlayful ? 44 : 38,
      borderRadius: isPlayful ? 22 : 19,
      backgroundColor: identity.palette.surface,
      borderWidth: isPlayful ? 3 : 2, // ✅ Bordure plus épaisse si playful
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
      ...tokens.shadows.md,
    },
    badgeText: {
      fontSize: isPlayful ? tokens.fontSize.lg : tokens.fontSize.sm, // ✅ Plus grand si playful
      fontWeight: tokens.fontWeight.black, // ✅ Plus bold
      color: identity.text.primary,
    },
    line: {
      width: isPlayful ? 3 : 2, // ✅ Plus épaisse si playful
      flex: 1,
      backgroundColor: withOpacity(identity.palette.primary, 0.2),
      marginTop: -2,
    },
    // --- Colonne de droite (Contenu) ---
    cardWrapper: {
      flex: 1,
      paddingBottom: tokens.spacing.md,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isPlayful ? tokens.spacing.lg : tokens.spacing.md, // ✅ Plus de padding si playful
      backgroundColor: identity.palette.surface,
      borderRadius: isPlayful ? 24 : tokens.borderRadius.md,
      ...(isPlayful
        ? tokens.shadows.md
        : {
            borderWidth: 1,
            borderColor: withOpacity(identity.palette.primary, 0.1),
            borderLeftWidth: 5,
          }
      ),
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: isPlayful ? tokens.fontSize.lg : tokens.fontSize.md, // ✅ Plus grand si playful
      fontWeight: tokens.fontWeight.black, // ✅ Plus bold
      color: identity.text.primary,
      marginBottom: tokens.spacing.xs,
    },
    subtitle: {
      fontSize: isPlayful ? tokens.fontSize.sm : tokens.fontSize.xs, // ✅ Plus grand si playful
      fontWeight: isPlayful ? tokens.fontWeight.semibold : tokens.fontWeight.medium,
      color: identity.text.secondary,
      textTransform: isPlayful ? undefined : 'uppercase', // ✅ Pas d'uppercase si playful
      letterSpacing: isPlayful ? 0 : 0.5,
    },
    iconContainer: {
      marginLeft: tokens.spacing.sm,
    }
  });
};