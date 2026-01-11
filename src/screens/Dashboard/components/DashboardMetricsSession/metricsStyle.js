// ============================================
// FICHIER: src/screens/Dashboard/styles/metricsStyle.js
// VERSION COLLEGE - Metrics avec design sobre et élégant
// ============================================

import { StyleSheet } from 'react-native';
import {
  spacing,
  fontSize,
  fontWeight,
  collegeBorderRadius,
  borderWidth,
  collegeShadows,
} from '@themes/tokens';
import { baseColors, collegeColors } from '@themes/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginVertical: spacing.lg,
  },

  // ========== CARD BASE - COLLEGE MODERNE ==========
  card: {
    flex: 1,
    backgroundColor: baseColors.white,
    borderRadius: collegeBorderRadius.xl, // 20px - plus arrondi pour effet moderne
    paddingVertical: spacing.xl + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...collegeShadows.elevated, // Ombre plus prononcée
    position: 'relative',
    overflow: 'hidden',
  },

  cardDark: {
    backgroundColor: baseColors.gray800,
  },

  // ========== CARD VARIANTS - COLLEGE MODERNE AVEC GRADIENTS ==========
  cardWordsLearned: {
    backgroundColor: collegeColors.accent, // Fond plein bleu électrique
    ...collegeShadows.elevated,
  },

  cardBadges: {
    backgroundColor: collegeColors.warning, // Fond plein orange College
    ...collegeShadows.elevated,
  },

  cardStreak: {
    backgroundColor: collegeColors.error, // Fond plein rouge College
    ...collegeShadows.elevated,
  },

  // ========== ÉLÉMENTS DÉCORATIFS POUR METRICS ==========
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

  // ========== EMOJI ICON - PLUS GRAND ==========
  emoji: {
    fontSize: 48, // Plus grand pour plus d'impact
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 2,
  },

  // ========== VALUE (LE CHIFFRE) - BLANC SUR FOND COLORÉ ==========
  value: {
    fontSize: 36, // 36px - bien visible et impactant
    fontWeight: fontWeight.black, // 900 - ultra audacieux
    color: baseColors.gray800,
    marginBottom: spacing.xs,
    letterSpacing: -0.5, // Serré et moderne
    zIndex: 2,
  },

  valueWordsLearned: {
    color: baseColors.white, // Blanc sur fond bleu
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  valueBadges: {
    color: baseColors.white, // Blanc sur fond orange
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  valueStreak: {
    color: baseColors.white, // Blanc sur fond rouge
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  valueDark: {
    color: baseColors.gray100,
  },

  // ========== LABEL (LE TEXTE DESCRIPTIF) - BLANC ==========
  label: {
    fontSize: 12, // 12px - plus petit pour hiérarchie
    fontWeight: fontWeight.bold, // 700 - affirmé mais pas trop
    color: baseColors.gray500,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
    zIndex: 2,
  },

  labelWordsLearned: {
    color: baseColors.white,
    opacity: 0.95,
  },

  labelBadges: {
    color: baseColors.white,
    opacity: 0.95,
  },

  labelStreak: {
    color: baseColors.white,
    opacity: 0.95,
  },

  labelDark: {
    color: baseColors.gray400,
  },

  // ========== ENCOURAGEMENT TEXT - JAUNE VIF ==========
  encouragement: {
    fontSize: fontSize.xs, // 12px
    fontWeight: fontWeight.bold, // 700 - plus affirmé
    color: baseColors.green500,
    textAlign: 'center',
    marginTop: spacing.xs,
    letterSpacing: 0.3,
    zIndex: 2,
  },

  encouragementLight: {
    color: collegeColors.accentYellow, // Jaune vif pour punch
    opacity: 1, // Pleine opacité
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  encouragementDark: {
    color: baseColors.green300,
  },
});
