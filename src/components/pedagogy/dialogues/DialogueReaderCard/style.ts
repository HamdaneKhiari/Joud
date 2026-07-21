import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';
  const isDark = identity.themeMode === 'dark';

  const containerRadius = isPlayful ? 24 : 16;
  const bubbleRadius = isPlayful ? 18 : 14;
  const tagRadius = isPlayful ? 20 : 12;
  const buttonRadius = isPlayful ? 26 : 18;

  return StyleSheet.create({
    dialogueContainer: {
      flex: 1,
      backgroundColor: identity.palette.surface,
      borderRadius: containerRadius,
      borderWidth: 2,
      borderColor: isDark ? identity.palette.primary + '40' : identity.palette.primary + '20',
      overflow: 'hidden',
      shadowColor: identity.palette.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },

    charactersBar: {
      backgroundColor: identity.palette.background,
      paddingVertical: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.xl,
      flexDirection: 'row',
      gap: tokens.spacing.lg,
      borderBottomWidth: 2,
      borderBottomColor: isDark ? identity.palette.primary + '30' : identity.palette.primary + '15',
    },

    characterTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
      backgroundColor: identity.palette.surface,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.xs + 2,
      borderRadius: tagRadius,
      borderWidth: 1,
      borderColor: isDark ? identity.palette.primary + '50' : identity.palette.primary + '30',
    },

    characterDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    characterName: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
    },

    messagesContainer: {
      flex: 1,
      backgroundColor: identity.palette.background,
    },

    messagesContent: {
      padding: tokens.spacing.xl,
      gap: tokens.spacing.lg,
    },

    messageBubble: {
      gap: tokens.spacing.xs,
      maxWidth: '75%',
    },

    messageBubbleLeft: {
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },

    messageBubbleRight: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
    },

    bubbleName: {
      fontSize: tokens.fontSize.xs + 1,
      fontWeight: tokens.fontWeight.extrabold,
      paddingHorizontal: tokens.spacing.sm,
      marginBottom: tokens.spacing.xs,
      letterSpacing: 0.3,
    },

    bubbleNameRight: {
      textAlign: 'right',
    },

    bubbleTextContainer: {
      position: 'relative',
    },

    bubbleText: {
      padding: tokens.spacing.md + 2,
      paddingHorizontal: tokens.spacing.lg,
      borderRadius: bubbleRadius,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },

    bubbleTextLeft: {
      borderBottomLeftRadius: isPlayful ? 6 : 4,
      backgroundColor: identity.palette.surface,
      borderWidth: 1,
      borderColor: isDark ? identity.palette.primary + '40' : identity.palette.primary + '20',
    },

    bubbleTextRight: {
      borderBottomRightRadius: isPlayful ? 6 : 4,
      backgroundColor: identity.palette.primary,
      borderWidth: 0,
    },

    bubbleTextContent: {
      fontSize: tokens.fontSize.base,
      lineHeight: 22,
      fontWeight: tokens.fontWeight.medium,
    },

    bubbleAudioBtn: {
      position: 'absolute',
      top: '50%',
      right: -40,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: identity.palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: identity.palette.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
      transform: [{ translateY: -18 }],
    },

    bubbleAudioBtnRight: {
      right: 'auto',
      left: -40,
    },

    bubbleAudioBtnPlaying: {
      backgroundColor: '#10B981', // Green success
    },

    bubbleTranslation: {
      fontSize: tokens.fontSize.xs + 1,
      color: identity.text.secondary,
      fontStyle: 'italic',
      paddingHorizontal: tokens.spacing.sm,
      marginTop: tokens.spacing.xs,
      fontWeight: tokens.fontWeight.medium,
    },

    bubbleTranslationRight: {
      textAlign: 'right',
    },

    navigationBar: {
      backgroundColor: identity.palette.surface,
      padding: tokens.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing.xl,
      borderTopWidth: 2,
      borderTopColor: isDark ? identity.palette.primary + '30' : identity.palette.primary + '15',
    },

    navButton: {
      width: 52,
      height: 52,
      borderRadius: buttonRadius,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
      backgroundColor: identity.palette.accent,
    },

    navButtonNext: {
      backgroundColor: identity.palette.accent,
    },

    navButtonFinish: {
      backgroundColor: '#10B981', // Green success
    },

    navButtonDisabled: {
      opacity: 0.3,
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
    },

    navigationText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.extrabold,
      color: identity.text.primary,
    },
  });
};
