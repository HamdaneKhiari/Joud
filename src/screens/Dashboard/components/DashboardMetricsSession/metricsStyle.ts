/**
 * ============================================
 * MetricsStyle - 100% White Label + Mood-Aware
 * Toutes les couleurs pilotées par Identity
 * ============================================
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  // ============================================
  // CONFIGURATION MOOD-AWARE
  // ============================================
  const isPlayful = identity.ui.mood === 'playful';
  const cardRadius = isPlayful ? 24 : 16;
  const cardPadding = isPlayful ? tokens.spacing.xl : tokens.spacing.lg;

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: tokens.spacing.sm, // ✅ Réduit
      paddingHorizontal: tokens.spacing.lg,
      marginVertical: tokens.spacing.md, // ✅ Réduit
    },

    // ========== CARD BASE ==========
    card: {
      flex: 1,
      backgroundColor: identity.palette.surface,
      borderRadius: cardRadius, // ✅ Mood-aware
      paddingVertical: tokens.spacing.md, // ✅ Réduit
      paddingHorizontal: tokens.spacing.sm, // ✅ Réduit
      alignItems: 'center',
      justifyContent: 'center',
      ...tokens.shadows.md, // ✅ Moins d'ombre
      position: 'relative',
      overflow: 'hidden',
      minHeight: isPlayful ? 100 : 90, // ✅ Réduit
    },

    cardDark: {
      backgroundColor: identity.palette.surface,
    },

    // ========== CARD VARIANTS - AVEC COULEURS THÉMATIQUES ==========
    cardWordsLearned: {
      backgroundColor: identity.palette.accent,
      ...tokens.shadows.elevated,
    },

    cardBadges: {
      backgroundColor: identity.palette.primary,
      ...tokens.shadows.elevated,
    },

    cardStreak: {
      backgroundColor: identity.aiDiagnostic.accent,
      ...tokens.shadows.elevated,
    },

    // ========== BADGE TYPOGRAPHIQUE (No-Media) ==========
    badgeLabel: {
      fontSize: 9, // ✅ Réduit et unifié
      fontWeight: tokens.fontWeight.extrabold,
      color: withOpacity(identity.text.onPrimary, 0.5),
      letterSpacing: 1.5,
      marginBottom: tokens.spacing.xs,
      textAlign: 'center',
      zIndex: 2,
    },

    // ========== EMOJI ICON (Fallback) ==========
    emoji: {
      fontSize: isPlayful ? 32 : 28, // ✅ Réduit
      marginBottom: tokens.spacing.xs,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      zIndex: 2,
    },

    // ========== VALUE (LE CHIFFRE) ==========
    value: {
      fontSize: isPlayful ? tokens.fontSize.xxxl : tokens.fontSize.xxl, // ✅ Réduit de huge/36 à xxxl/xxl
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      marginBottom: tokens.spacing.xs,
      letterSpacing: -0.5,
      zIndex: 2,
    },

    valueWordsLearned: {
      color: identity.text.onPrimary,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    valueBadges: {
      color: identity.text.onPrimary,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    valueStreak: {
      color: identity.text.onPrimary,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    valueDark: {
      color: identity.text.primary,
    },

    // ========== LABEL (LE TEXTE DESCRIPTIF) ==========
    label: {
      fontSize: 11, // ✅ Réduit et unifié
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.secondary,
      textAlign: 'center',
      letterSpacing: 0.2,
      zIndex: 2,
    },

    labelWordsLearned: {
      color: identity.text.onPrimary,
      opacity: 0.9,
    },

    labelBadges: {
      color: identity.text.onPrimary,
      opacity: 0.9,
    },

    labelStreak: {
      color: identity.text.onPrimary,
      opacity: 0.9,
    },

    labelDark: {
      color: identity.text.tertiary,
    },

    // ========== ENCOURAGEMENT TEXT - NON UTILISÉ ==========
    // ✅ Styles conservés pour compatibilité mais le texte n'est plus rendu
    encouragement: {
      fontSize: tokens.fontSize.xs,
      color: identity.palette.accent,
    },

    encouragementLight: {
      fontSize: tokens.fontSize.xs,
      color: identity.palette.accent,
    },

    encouragementDark: {
      fontSize: tokens.fontSize.xs,
      color: identity.palette.accent,
    },
  });
};
