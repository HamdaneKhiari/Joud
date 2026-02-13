import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

const getTimelineDimensions = (isPlayful: boolean) => ({
  containerHeight: isPlayful ? 90 : 80,
  columnWidth: isPlayful ? 56 : 50,
  badgeSize: isPlayful ? 44 : 38,
  badgeRadius: isPlayful ? 22 : 19,
  badgeBorder: isPlayful ? 3 : 2,
  lineWidth: isPlayful ? 3 : 2,
  badgeFontSize: isPlayful ? tokens.fontSize.lg : tokens.fontSize.sm,
});

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';
  const tl = getTimelineDimensions(isPlayful);

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      minHeight: tl.containerHeight,
    },
    timelineContainer: {
      width: tl.columnWidth,
      alignItems: 'center',
    },
    badge: {
      width: tl.badgeSize,
      height: tl.badgeSize,
      borderRadius: tl.badgeRadius,
      backgroundColor: identity.palette.surface,
      borderWidth: tl.badgeBorder,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
      ...tokens.shadows.md,
    },
    badgeText: {
      fontSize: tl.badgeFontSize,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
    },
    line: {
      width: tl.lineWidth,
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
    progressBadge: {
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical: tokens.spacing.xs,
      borderRadius: isPlayful ? 12 : 8,
      marginRight: tokens.spacing.sm,
    },
    progressText: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
    },
    iconContainer: {
      marginLeft: tokens.spacing.sm,
    }
  });
};