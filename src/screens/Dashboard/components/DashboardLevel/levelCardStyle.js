// src/screens/Dashboard/styles/levelCardStyle.js
// VERSION COLLEGE - Design sobre et élégant
import { StyleSheet } from 'react-native';
import {
  spacing,
  fontSize,
  fontWeight,
  collegeBorderRadius,
  collegeShadows,
  withOpacity,
} from '@themes/tokens';
import { baseColors, collegeColors } from '@themes/colors';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: baseColors.white,
    borderRadius: collegeBorderRadius.xl, // 20px - plus arrondi pour modernité
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg, // Plus de padding
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...collegeShadows.elevated, // Ombre plus prononcée
    borderWidth: 0, // Pas de bordure par défaut
    position: 'relative',
    overflow: 'hidden',
  },

  cardDark: {
    backgroundColor: baseColors.gray800,
    borderColor: baseColors.gray700,
  },

  cardActive: {
    borderWidth: 0, // Pas de bordure même quand actif
    ...collegeShadows.elevated, // Ombre encore plus prononcée
  },

  // ========== ÉLÉMENTS DÉCORATIFS POUR LEVEL CARDS ==========
  decorativeAccent: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -30,
    right: -30,
  },

  decorativeAccentSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -15,
    left: -15,
  },

  // ========== LEFT SECTION ==========
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },

  icon: {
    fontSize: 52, // Plus grand pour plus d'impact
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 2,
  },

  infoSection: {
    flex: 1,
  },

  title: {
    fontSize: fontSize.xl + 2, // 22px - encore plus grand
    fontWeight: fontWeight.black, // 900 - ultra audacieux
    color: baseColors.gray800,
    marginBottom: spacing.xxs,
    letterSpacing: -0.3, // Serré et moderne
    zIndex: 2,
  },

  titleLight: {
    color: baseColors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  badge: {
    fontSize: fontSize.xs, // 12px - plus petit que le titre
    fontWeight: fontWeight.semibold, // 600 - discret
    color: baseColors.gray500,
    letterSpacing: 0.2,
    zIndex: 2,
  },

  badgeLight: {
    color: baseColors.white, // Blanc sur fond coloré
    opacity: 0.85, // Légèrement transparent pour discrétion
  },

  encouragement: {
    fontSize: fontSize.xs, // 12px
    fontWeight: fontWeight.bold, // 700 - plus affirmé
    color: baseColors.white,
    opacity: 1, // Pleine opacité
    marginTop: spacing.xs,
    letterSpacing: 0.3,
    zIndex: 2,
  },

  // ========== RIGHT SECTION ==========
  rightSection: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },

  statusIcon: {
    fontSize: 28, // Plus grand
    zIndex: 2,
  },

  progressSection: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },

  progressText: {
    fontSize: fontSize.lg, // 18px - encore plus visible
    fontWeight: fontWeight.black, // 900 - ultra audacieux
    color: collegeColors.secondary,
    letterSpacing: -0.2, // Serré et moderne
    zIndex: 2,
  },

  progressTextDark: {
    color: collegeColors.secondaryLight,
  },

  progressBar: {
    width: 110, // Un peu plus large
    height: 8, // Plus épais
    backgroundColor: withOpacity(collegeColors.secondary, 0.2),
    borderRadius: collegeBorderRadius.round,
    overflow: 'hidden',
    borderWidth: 0, // Pas de bordure pour plus de modernité
    zIndex: 2,
  },

  progressBarDark: {
    backgroundColor: withOpacity(collegeColors.secondaryLight, 0.2),
  },

  progressFill: {
    height: '100%',
    backgroundColor: collegeColors.secondary,
    borderRadius: collegeBorderRadius.round,
  },
});
