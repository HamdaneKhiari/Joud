import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';

export const createWordGameStyles = (identity: Identity): ReturnType<typeof StyleSheet.create> => {
  const isPlayful = identity.ui.mood === 'playful';

  return StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      paddingBottom: tokens.spacing.xl,
    },

    card: {
      backgroundColor: identity.palette.surface,
      borderRadius: identity.ui.cardRadius,
      borderTopWidth: 4,
      borderTopColor: identity.palette.primary,
      overflow: 'hidden',
      ...tokens.shadows.md,
      marginBottom: tokens.spacing.xl,
    },

    colorBar: {
      height: 4,
      backgroundColor: identity.palette.primary,
      elevation: 2,
    },

    titleSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: isPlayful ? 'center' : 'flex-start',
      paddingVertical: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.xl,
    },

    titleIcon: {
      fontSize: isPlayful ? tokens.fontSize.xxl : tokens.fontSize.xl,
      marginRight: tokens.spacing.md,
    },

    titleText: {
      fontSize: isPlayful ? tokens.fontSize.xl : tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      textAlign: isPlayful ? 'center' : 'left',
    },

    optionsContainer: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.xl,
      gap: tokens.spacing.md,
    },

    optionButton: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.surface,
      justifyContent: 'center',
      minHeight: 50,
    },

    // Sélectionné, avant validation
    optionButtonSelected: {
      backgroundColor: identity.palette.accent,
      borderColor: identity.palette.accent,
      borderWidth: 2,
    },

    // Correct, après validation
    optionButtonCorrect: {
      backgroundColor: baseColors.green500,
      borderColor: baseColors.green600,
      borderWidth: 2,
    },

    // Incorrect, après validation
    optionButtonIncorrect: {
      backgroundColor: baseColors.red500,
      borderColor: baseColors.red600,
      borderWidth: 2,
    },

    optionText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.primary,
      textAlign: isPlayful ? 'center' : 'left',
    },

    optionTextWhite: {
      color: baseColors.white,
      fontWeight: tokens.fontWeight.bold,
    },

    contentBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.xl,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.lg,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.background,
    },

    contentText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.primary,
      lineHeight: 24,
      textAlign: isPlayful ? 'center' : 'left',
    },

    contentTextBold: {
      fontWeight: tokens.fontWeight.bold,
    },
  });
};
