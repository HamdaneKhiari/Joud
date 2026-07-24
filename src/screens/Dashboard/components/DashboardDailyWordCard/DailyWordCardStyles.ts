import { StyleSheet } from 'react-native';
import { tokens } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

const getMoodConfig = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';
  return {
    isPlayful,
    cardRadius: isPlayful ? 24 : identity.ui.cardRadius,
    containerPadding: isPlayful ? tokens.spacing.xl : tokens.spacing.lg,
    borderLeftWidth: isPlayful ? 0 : 4,
    watermarkRight: isPlayful ? '50%' as const : -10,
    watermarkFontSize: isPlayful ? 100 : 80,
    watermarkOpacity: isPlayful ? 0.08 : 0.05,
  };
};

export const createStyles = (identity: Identity) => {
  const mood = getMoodConfig(identity);

  return StyleSheet.create({
    container: {
      padding: mood.containerPadding,
      marginHorizontal: tokens.spacing.lg,
      marginVertical: tokens.spacing.md,
      borderRadius: mood.cardRadius,
      position: 'relative',
      overflow: 'hidden',
      borderLeftWidth: mood.borderLeftWidth,
      borderLeftColor: identity.palette.primary,
      ...(mood.isPlayful ? tokens.shadows.md : tokens.shadows.sm),
      ...(mood.isPlayful && { alignItems: 'center' }),
    },
    watermark: {
      position: 'absolute',
      right: mood.watermarkRight,
      bottom: -10,
      fontSize: mood.watermarkFontSize,
      opacity: mood.watermarkOpacity,
      ...(mood.isPlayful && { transform: [{ translateX: 50 }] }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.spacing.sm,
      ...(mood.isPlayful && { justifyContent: 'center' }),
    },
    tag: {
      fontSize: mood.isPlayful ? tokens.fontSize.xs : 10,
      fontWeight: tokens.fontWeight.black,
      textTransform: mood.isPlayful ? undefined : 'uppercase',
      letterSpacing: mood.isPlayful ? 0.5 : 1.2,
      color: identity.palette.primary,
    },
    wordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: tokens.spacing.sm,
      ...(mood.isPlayful && { justifyContent: 'center' }),
    },
    englishWord: {
      fontSize: mood.isPlayful ? tokens.fontSize.xxxl : tokens.fontSize.xxl,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      letterSpacing: -0.5,
    },
    frenchTranslation: {
      fontSize: mood.isPlayful ? tokens.fontSize.lg : tokens.fontSize.md,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.secondary,
      marginTop: tokens.spacing.xs,
      ...(mood.isPlayful && { textAlign: 'center' }),
    }
  });
};