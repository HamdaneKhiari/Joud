import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.xl,
      marginVertical: tokens.spacing.lg,
    },

    // ========== CARD BASE ==========
    card: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: identity.ui.cardRadius,
      paddingVertical: tokens.spacing.xl + 4,
      paddingHorizontal: tokens.spacing.lg,
      alignItems: 'center',
      ...tokens.shadows.elevated,
      position: 'relative',
      overflow: 'hidden',
    },

    cardDark: {
      backgroundColor: '#1F2937',
    },

    // ========== CARD VARIANTS - AVEC COULEURS THÉMATIQUES ==========
    cardWordsLearned: {
      backgroundColor: identity.branding.accent,
      ...tokens.shadows.elevated,
    },

    cardBadges: {
      backgroundColor: identity.branding.main,
      ...tokens.shadows.elevated,
    },

    cardStreak: {
      backgroundColor: identity.ai.accent,
      ...tokens.shadows.elevated,
    },

    // ========== ÉLÉMENTS DÉCORATIFS ==========
    decorativeShape: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      top: -20,
      right: -20,
    },

    decorativeShapeSmall: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom: -10,
      left: -10,
    },

    // ========== EMOJI ICON ==========
    emoji: {
      fontSize: 48,
      marginBottom: tokens.spacing.md,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      zIndex: 2,
    },

    // ========== VALUE (LE CHIFFRE) ==========
    value: {
      fontSize: 36,
      fontWeight: tokens.fontWeight.black,
      color: '#1F2937',
      marginBottom: tokens.spacing.xs,
      letterSpacing: -0.5,
      zIndex: 2,
    },

    valueWordsLearned: {
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    valueBadges: {
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    valueStreak: {
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    valueDark: {
      color: '#F3F4F6',
    },

    // ========== LABEL (LE TEXTE DESCRIPTIF) ==========
    label: {
      fontSize: 12,
      fontWeight: tokens.fontWeight.bold,
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: tokens.spacing.xs,
      letterSpacing: 0.2,
      zIndex: 2,
    },

    labelWordsLearned: {
      color: '#FFFFFF',
      opacity: 0.95,
    },

    labelBadges: {
      color: '#FFFFFF',
      opacity: 0.95,
    },

    labelStreak: {
      color: '#FFFFFF',
      opacity: 0.95,
    },

    labelDark: {
      color: '#9CA3AF',
    },

    // ========== ENCOURAGEMENT TEXT ==========
    encouragement: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: '#10B981',
      textAlign: 'center',
      marginTop: tokens.spacing.xs,
      letterSpacing: 0.3,
      zIndex: 2,
    },

    encouragementLight: {
      color: identity.branding.accent,
      opacity: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    encouragementDark: {
      color: '#34D399',
    },
  });
