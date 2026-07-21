import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';
  const isDark = identity.themeMode === 'dark';

  const containerRadius = isPlayful ? 24 : 16;

  return StyleSheet.create({
    questionContainer: {
      backgroundColor: identity.palette.surface,
      borderRadius: containerRadius,
      borderTopWidth: 4,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },

    colorBar: {
      height: 4,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 6,
      shadowOpacity: 0.3,
    },

    questionHeader: {
      paddingVertical: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? identity.palette.primary + '30' : identity.palette.primary + '15',
    },

    questionHeaderLabel: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.extrabold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    questionContent: {
      padding: tokens.spacing.xl,
    },
  });
};
