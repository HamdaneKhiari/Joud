/**
 * ============================================
 * FICHIER: WordCard.styles.ts (Premium Edition)
 * Styles dynamiques pilotés par l'identité + Design Tokens
 * ============================================
 */

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

interface WordCardStyles {
  container: ViewStyle;
  wordContainer: ViewStyle;
  wordRow: ViewStyle;
  englishWord: TextStyle;
  frenchWord: TextStyle;
  separator: ViewStyle;
  exampleContainer: ViewStyle;
  exampleText: TextStyle;
}

/**
 * Couleurs sémantiques pour le texte
 * ✅ 100% White Label : Liées à l'identité via withOpacity
 */
const getSemanticColors = (identity: Identity) => {
  const isDark = identity.themeMode === 'dark';

  return {
    // Couleur de la traduction (liée à main avec opacité)
    translation: withOpacity(identity.palette.primary, 0.6),
    // Couleur du texte d'exemple (liée à main avec opacité plus légère)
    example: withOpacity(identity.palette.primary, 0.7),
    // Bordure subtile de la card
    cardBorder: isDark ? withOpacity('#FFFFFF', 0.1) : withOpacity('#000000', 0.05),
  };
};

export const getWordCardStyles = (identity: Identity): WordCardStyles => {
  const { palette, ui } = identity;
  const colors = getSemanticColors(identity);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: ui.cardRadius,
      padding: tokens.layout.cardPadding,
      marginHorizontal: tokens.spacing.md,
      marginVertical: tokens.spacing.lg,
      // ✅ Ombre Premium via tokens (pas de valeurs en dur)
      ...tokens.shadows.lg,
      // ✅ Centrage vertical optimisé avec espacement équilibré
      justifyContent: 'center',
      alignItems: 'center',
      gap: tokens.spacing.xl,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    wordContainer: {
      alignItems: 'center',
      width: '100%',
    },
    wordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing.md,
      marginBottom: tokens.spacing.sm,
    },
    englishWord: {
      fontSize: tokens.fontSize.huge - 6, // 42px
      fontWeight: tokens.fontWeight.extrabold,
      color: palette.primary,
      textAlign: 'center',
      letterSpacing: 0.5,
      // ✅ Responsive : adapte la taille si le mot est trop long
      flexShrink: 1,
    },
    frenchWord: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.medium,
      color: colors.translation, // ✅ Couleur sémantique
      textAlign: 'center',
      fontStyle: 'italic',
    },
    separator: {
      width: 60,
      height: 4,
      backgroundColor: palette.accent,
      borderRadius: tokens.borderRadius.sm,
    },
    exampleContainer: {
      backgroundColor: withOpacity(palette.primary, 0.05),
      padding: tokens.spacing.xl,
      borderRadius: ui.cardRadius,
      width: '100%',
    },
    exampleText: {
      fontSize: tokens.fontSize.md,
      color: colors.example, // ✅ Couleur sémantique
      textAlign: 'center',
      lineHeight: 26,
    },
  });
};
