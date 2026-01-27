import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      minHeight: 80,
    },
    // --- Colonne de gauche (Timeline) ---
    timelineContainer: {
      width: 50,
      alignItems: 'center',
    },
    badge: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: identity.palette.surface,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
      ...tokens.shadows.sm,
    },
    badgeText: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
    },
    line: {
      width: 2,
      flex: 1,
      backgroundColor: withOpacity(identity.palette.primary, 0.2),
      marginTop: -2, // Pour bien coller au badge
    },
    // --- Colonne de droite (Contenu) ---
    cardWrapper: {
      flex: 1,
      paddingBottom: tokens.spacing.md,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: tokens.spacing.md,
      backgroundColor: identity.palette.surface,
      // ADAPTATION MOOD
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
      fontSize: tokens.fontSize.md,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: tokens.fontSize.xs,
      color: identity.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    iconContainer: {
      marginLeft: tokens.spacing.sm,
    }
  });
};