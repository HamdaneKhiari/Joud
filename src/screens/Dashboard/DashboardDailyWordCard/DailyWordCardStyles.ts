import { StyleSheet } from 'react-native';
import { tokens } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const createStyles = (identity: Identity) =>
  StyleSheet.create({
    container: {
      // On utilise 'background' qui peut être une couleur ou un dégradé (géré dans le composant)
      padding: tokens.spacing.xl,
      marginHorizontal: tokens.spacing.xl,
      marginVertical: tokens.spacing.md,
      borderRadius: identity.ui.cardRadius,
      position: 'relative',
      overflow: 'hidden',
      // Bordure décorative à gauche utilisant la palette primaire
      borderLeftWidth: 5,
      borderLeftColor: identity.palette.primary,
      // Ombre portée
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    watermark: {
      position: 'absolute',
      right: -10,
      bottom: -10,
      fontSize: 80,
      opacity: 0.05,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.spacing.xs,
    },
    tag: {
      fontSize: 10,
      fontWeight: tokens.fontWeight.bold as any,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      color: identity.palette.primary,
    },
    wordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: tokens.spacing.xs,
    },
    englishWord: {
      fontSize: 32,
      fontWeight: tokens.fontWeight.black as any,
      color: identity.text.primary,
    },
    frenchTranslation: {
      fontSize: 18,
      fontWeight: tokens.fontWeight.medium as any,
      color: identity.text.secondary,
      marginTop: 2,
    }
  });