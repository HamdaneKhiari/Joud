/**
 * ============================================
 * FICHIER: WordCard.styles.ts (Premium Edition)
 * Styles dynamiques pilotés par l'identité + Design Tokens
 * ============================================
 */

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { getExerciseConfig } from '@/utils/exerciseMoodHelper';

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
  const { palette } = identity;
  const colors = getSemanticColors(identity);
  const config = getExerciseConfig(identity);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: config.borderRadius.card,
      padding: config.padding.container,
      marginHorizontal: tokens.spacing.md,
      marginVertical: tokens.spacing.lg,
      ...tokens.shadows.lg,
      justifyContent: 'center',
      alignItems: config.alignment,
      gap: config.spacing,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    wordContainer: {
      alignItems: config.alignment,
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
      fontSize: config.fontSize.title,
      fontWeight: tokens.fontWeight.extrabold,
      color: palette.primary,
      textAlign: config.alignment === 'center' ? 'center' : 'left',
      letterSpacing: 0.5,
      flexShrink: 1,
    },
    frenchWord: {
      fontSize: config.fontSize.subtitle,
      fontWeight: tokens.fontWeight.medium,
      color: colors.translation,
      textAlign: config.alignment === 'center' ? 'center' : 'left',
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
      padding: config.padding.card,
      borderRadius: config.borderRadius.input,
      width: '100%',
    },
    exampleText: {
      fontSize: config.fontSize.body,
      color: colors.example,
      textAlign: config.alignment === 'center' ? 'center' : 'left',
      lineHeight: 26,
    },
  });
};
