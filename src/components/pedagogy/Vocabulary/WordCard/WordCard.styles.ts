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
  const isDark = identity.branding.themeMode === 'dark';

  return {
    // Couleur de la traduction (liée à main avec opacité)
    translation: withOpacity(identity.branding.main, 0.6),
    // Couleur du texte d'exemple (liée à main avec opacité plus légère)
    example: withOpacity(identity.branding.main, 0.7),
    // Bordure subtile de la card
    cardBorder: isDark ? withOpacity('#FFFFFF', 0.1) : withOpacity('#000000', 0.05),
  };
};

export const getWordCardStyles = (identity: Identity): WordCardStyles => {
  const { branding, ui } = identity;
  const colors = getSemanticColors(identity);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: branding.surface || '#FFFFFF',
      borderRadius: ui.cardRadius,
      padding: tokens.layout.cardPadding,
      marginHorizontal: tokens.spacing.xs,
      marginVertical: tokens.spacing.sm,
      // ✅ Ombre Premium (lg pour un effet dramatique)
      ...tokens.shadows.lg,
      // ✅ Centrage vertical parfait (No-Media)
      justifyContent: 'space-evenly',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    wordContainer: {
      alignItems: 'center',
      // ✅ Réduit car plus d'emoji au-dessus
      marginBottom: tokens.spacing.lg,
    },
    wordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing.md,
      marginBottom: tokens.spacing.sm,
    },
    englishWord: {
      // ✅ Utilise fontSize.huge (48) mais réduit légèrement pour équilibre visuel
      fontSize: tokens.fontSize.huge - 6, // 42px (proche de l'original)
      fontWeight: tokens.fontWeight.extrabold,
      color: branding.main, // Couleur principale de la marque
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    frenchWord: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.medium,
      color: colors.translation, // ✅ Couleur sémantique
      textAlign: 'center',
      fontStyle: 'italic',
    },
    separator: {
      width: 40,
      height: 4,
      backgroundColor: branding.accent, // Touche de couleur d'accent
      borderRadius: tokens.borderRadius.sm / 4, // Arrondi subtil (2px)
      marginBottom: tokens.spacing.xxxl,
      opacity: tokens.opacity.overlay,
    },
    exampleContainer: {
      backgroundColor: ui.hasGradient
        ? withOpacity('#000000', 0.03)
        : 'transparent',
      padding: tokens.spacing.lg,
      borderRadius: ui.cardRadius / 1.5,
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
