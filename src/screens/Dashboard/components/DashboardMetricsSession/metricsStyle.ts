/**
 * ============================================
 * MetricsStyle - 100% White Label
 * Toutes les couleurs pilotées par Identity
 * ============================================
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

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
      backgroundColor: identity.palette.surface,
      borderRadius: identity.ui.cardRadius,
      paddingVertical: tokens.spacing.xl + 4,
      paddingHorizontal: tokens.spacing.lg,
      alignItems: 'center',
      ...tokens.shadows.elevated,
      position: 'relative',
      overflow: 'hidden',
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
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.extrabold,
      color: withOpacity(identity.text.onPrimary, 0.5),
      letterSpacing: 2,
      marginBottom: tokens.spacing.sm,
      textAlign: 'center',
      zIndex: 2,
    },

    // ========== EMOJI ICON (Fallback) ==========
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
      fontSize: 12,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.secondary,
      textAlign: 'center',
      marginBottom: tokens.spacing.xs,
      letterSpacing: 0.2,
      zIndex: 2,
    },

    labelWordsLearned: {
      color: identity.text.onPrimary,
      opacity: 0.95,
    },

    labelBadges: {
      color: identity.text.onPrimary,
      opacity: 0.95,
    },

    labelStreak: {
      color: identity.text.onPrimary,
      opacity: 0.95,
    },

    labelDark: {
      color: identity.text.tertiary,
    },

    // ========== ENCOURAGEMENT TEXT ==========
    encouragement: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: identity.palette.accent,
      textAlign: 'center',
      marginTop: tokens.spacing.xs,
      letterSpacing: 0.3,
      zIndex: 2,
    },

    encouragementLight: {
      color: identity.palette.accent,
      opacity: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    encouragementDark: {
      color: identity.palette.accent,
    },
  });
