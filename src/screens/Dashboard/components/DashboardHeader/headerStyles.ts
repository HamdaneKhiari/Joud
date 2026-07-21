import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';

  return StyleSheet.create({
    // ========== CONTAINER ==========
    header: {
      paddingHorizontal: tokens.spacing.lg,
      paddingTop: 48, // ✅ Réduit de 60 à 48
      paddingBottom: tokens.spacing.md, // ✅ Réduit
      ...tokens.shadows.elevated,
      position: 'relative',
      overflow: 'hidden',
    },

    // ========== DÉCORATIONS (Playful) - Réduites ==========
    decorativeCircle: {
      position: 'absolute',
      top: -30,
      right: -30,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: withOpacity(identity.text.onPrimary, 0.08), // ✅ White Label
    },

    decorativeCircleSmall: {
      position: 'absolute',
      bottom: -15,
      left: -15,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: withOpacity(identity.text.onPrimary, 0.05), // ✅ White Label
    },

    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: isPlayful ? 'flex-start' : 'center',
      position: 'relative',
      zIndex: 1,
    },

    // ========== GAUCHE : BONJOUR [NOM] ==========
    welcomeSection: {
      gap: tokens.spacing.xs,
      flex: 1,
    },

    emojiContainer: {
      marginBottom: tokens.spacing.xs,
    },

    emoji: {
      fontSize: isPlayful ? 24 : 20, // ✅ Réduit
    },

    greeting: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      fontFamily: identity.fontFamily.medium,
      color: withOpacity(identity.text.onPrimary, 0.85),
      letterSpacing: 0.3,
    },

    userName: {
      fontSize: isPlayful ? tokens.fontSize.xxl : tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.black,
      fontFamily: identity.fontFamily.extrabold,
      color: identity.text.onPrimary,
      letterSpacing: -0.5,
      textShadowColor: isPlayful ? 'rgba(0, 0, 0, 0.08)' : undefined, // ✅ Plus subtil
      textShadowOffset: isPlayful ? { width: 0, height: 1 } : undefined,
      textShadowRadius: isPlayful ? 2 : undefined,
    },

    // ========== DROITE : NOM DE L'ORGANISATION ==========
    organizationSection: {
      alignItems: 'flex-end',
      backgroundColor: isPlayful ? withOpacity(identity.text.onPrimary, 0.12) : undefined, // ✅ White Label
      paddingHorizontal: isPlayful ? tokens.spacing.sm : 0,
      paddingVertical: isPlayful ? tokens.spacing.xs : 0,
      borderRadius: isPlayful ? 12 : 0,
    },

    organizationName: {
      fontSize: tokens.fontSize.sm, // ✅ Unifié et réduit
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.onPrimary,
      letterSpacing: 0.2,
      textAlign: 'right',
      opacity: 0.9,
    },
  });
};
