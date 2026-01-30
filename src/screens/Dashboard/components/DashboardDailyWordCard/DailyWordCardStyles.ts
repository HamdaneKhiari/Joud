/**
 * DailyWordCard Styles - 100% White Label + Mood-Aware
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';
  const cardRadius = isPlayful ? 24 : identity.ui.cardRadius;

  return StyleSheet.create({
    container: {
      padding: isPlayful ? tokens.spacing.xl : tokens.spacing.lg,
      marginHorizontal: tokens.spacing.lg,
      marginVertical: tokens.spacing.md,
      borderRadius: cardRadius,
      position: 'relative',
      overflow: 'hidden',
      // Bordure uniquement en mode clean
      borderLeftWidth: isPlayful ? 0 : 4,
      borderLeftColor: identity.palette.primary,
      // Ombre adaptée
      ...tokens.shadows.md,
      // Alignement selon le mood
      ...(isPlayful && { alignItems: 'center' }),
    },
    watermark: {
      position: 'absolute',
      right: isPlayful ? '50%' : -10,
      bottom: -10,
      fontSize: isPlayful ? 100 : 80,
      opacity: isPlayful ? 0.08 : 0.05,
      ...(isPlayful && { transform: [{ translateX: 50 }] }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.spacing.sm,
      ...(isPlayful && { justifyContent: 'center' }),
    },
    tag: {
      fontSize: isPlayful ? tokens.fontSize.xs : 10,
      fontWeight: tokens.fontWeight.black as any,
      textTransform: isPlayful ? undefined : 'uppercase',
      letterSpacing: isPlayful ? 0.5 : 1.2,
      color: identity.palette.primary,
    },
    wordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: tokens.spacing.sm,
      ...(isPlayful && { justifyContent: 'center' }),
    },
    englishWord: {
      fontSize: isPlayful ? tokens.fontSize.xxxl : tokens.fontSize.xxl,
      fontWeight: tokens.fontWeight.black as any,
      color: identity.text.primary,
      letterSpacing: -0.5,
    },
    frenchTranslation: {
      fontSize: isPlayful ? tokens.fontSize.lg : tokens.fontSize.md,
      fontWeight: tokens.fontWeight.semibold as any,
      color: identity.text.secondary,
      marginTop: tokens.spacing.xs,
      ...(isPlayful && { textAlign: 'center' }),
    }
  });
};