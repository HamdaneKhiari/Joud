import { StyleSheet } from 'react-native';
import { tokens, withOpacity } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

const BUTTON_SIZE = 72;

export const createStyles = (identity: Identity) => {
  const isDark = identity.themeMode === 'dark';
  const neutralBorder = isDark
    ? withOpacity('#FFFFFF', 0.2)
    : withOpacity('#000000', 0.1);
  const neutralBg = isDark
    ? withOpacity('#FFFFFF', 0.1)
    : withOpacity('#000000', 0.05);

  return StyleSheet.create({
    navigationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: tokens.spacing.xxxl,
      paddingVertical: tokens.spacing.xxl,
      paddingBottom: tokens.spacing.xxxl, // Extra padding en bas pour détacher du bord
      backgroundColor: identity.palette.surface,
      borderTopWidth: tokens.borderWidth.thin,
      borderTopColor: neutralBorder,
      ...tokens.shadows.lg,
    },
    spacer: {
      flex: 1,
    },
    navItem: {
      alignItems: 'center',
      gap: tokens.spacing.xs,
    },
    navLabel: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.secondary,
    },
    navButton: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: tokens.borderRadius.round,
      alignItems: 'center',
      justifyContent: 'center',
      ...tokens.shadows.xl,
    },
    navButtonPrev: {
      backgroundColor: identity.palette.primary,
      borderWidth: tokens.borderWidth.thin,
      borderColor: isDark ? withOpacity('#FFFFFF', 0.3) : withOpacity('#000000', 0.15),
      shadowColor: identity.palette.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    navButtonNext: {
      backgroundColor: identity.palette.primary,
      borderWidth: tokens.borderWidth.thin,
      borderColor: isDark ? withOpacity('#FFFFFF', 0.3) : withOpacity('#000000', 0.15),
      shadowColor: identity.palette.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    navButtonFinish: {
      backgroundColor: identity.palette.accent,
      shadowColor: identity.palette.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    navButtonDisabled: {
      backgroundColor: neutralBg,
      borderWidth: tokens.borderWidth.thick,
      borderColor: neutralBorder,
      ...tokens.shadows.xs,
      opacity: tokens.opacity.disabled,
    },
  });
};
