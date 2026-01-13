/**
 * ============================================
 * FICHIER: src/components/pedagogy/vocabulary/WordCard.styles.ts
 * Styles dynamiques pilotés par l'identité (ThemeContext)
 * ============================================
 */

import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { Identity } from '@/themes/ThemeContext';

interface WordCardStyles {
  container: ViewStyle;
  wordContainer: ViewStyle;
  wordRow: ViewStyle;
  englishWord: TextStyle;
  frenchWord: TextStyle;
  separator: ViewStyle;
  exampleContainer: ViewStyle;
  exampleText: TextStyle;
  visualContainer: ViewStyle;
  emojiText: TextStyle;
  image: ImageStyle;
}

export const getWordCardStyles = (identity: Identity): WordCardStyles => {
  const { branding, ui } = identity;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: branding.surface || '#FFFFFF',
      borderRadius: ui.cardRadius,
      padding: 24,
      marginHorizontal: 4,
      marginVertical: 10,
      // Ombres douces et dynamiques
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    wordContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    wordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 8,
    },
    englishWord: {
      fontSize: 42,
      fontWeight: '800',
      color: branding.main, // Couleur principale de la marque
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    frenchWord: {
      fontSize: 24,
      fontWeight: '500',
      color: '#6B7280', // Gris neutre pour la traduction
      textAlign: 'center',
      fontStyle: 'italic',
    },
    separator: {
      width: 40,
      height: 4,
      backgroundColor: branding.accent, // Touche de couleur d'accent
      borderRadius: 2,
      marginBottom: 32,
      opacity: 0.6,
    },
    exampleContainer: {
      backgroundColor: ui.hasGradient ? 'rgba(0,0,0,0.03)' : 'transparent',
      padding: 16,
      borderRadius: ui.cardRadius / 1.5,
      width: '100%',
    },
    exampleText: {
      fontSize: 18,
      color: '#374151',
      textAlign: 'center',
      lineHeight: 26,
    },
    visualContainer: {
      marginBottom: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emojiText: {
      fontSize: 80,
    },
    image: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
    },
  });
};