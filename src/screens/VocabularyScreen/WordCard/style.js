// ============================================
// FICHIER: src/components/pedagogy/vocabulary/WordCard/style.js
// VERSION COLLEGE - Card centrée, sobre et mature
// ============================================

import { StyleSheet } from 'react-native';
import {
  spacing,
  fontSize,
  fontWeight,
  collegeBorderRadius,
  collegeShadows,
} from '@themes/tokens';
import { baseColors, collegeColors } from '@themes/colors';

export const styles = StyleSheet.create({
  // =================== CARD PRINCIPALE - CENTRÉE ET ÉLÉGANTE ===================
  card: {
    backgroundColor: baseColors.white,
    borderRadius: collegeBorderRadius.xl, // 20px
    borderWidth: 2,
    borderColor: baseColors.gray300,
    overflow: 'hidden',
    ...collegeShadows.elevated,
    // Card centrée avec largeur max
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: spacing.lg,
  },

  // =================== BARRE COULEUR (SUBTILE) ===================
  colorBar: {
    height: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
  },

  // =================== ESPACEMENTS ===================
  spacerTop: {
    height: spacing.xxxl, // 32px - Plus d'espace en haut
  },

  spacerBottom: {
    height: spacing.xl,
  },

  // =================== MOT ANGLAIS - ULTRA GRAND ET CENTRÉ ===================
  englishWordTitle: {
    fontSize: 32, // ÉNORME - 72px pour impact maximal College
    fontWeight: fontWeight.black, // 900
    textAlign: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxxl,
    letterSpacing: -1.5, // Encore plus serré et moderne
    color: collegeColors.primary, // #2C3E50 - Bleu nuit College
    // Text shadow pour profondeur
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // =================== ZONE TRADUCTION - SOBRE ===================
  translationContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  translationBox: {
    backgroundColor: '#F8F9FA', // Gris très clair (sobre)
    borderWidth: 1, // Bordure fine
    borderColor: '#E0E0E0', // Gris neutre (sobre)
    borderRadius: collegeBorderRadius.sm, // 8px (plus petit)
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  frenchWordText: {
    fontSize: fontSize.base, // 16px (sobre et lisible)
    fontWeight: fontWeight.semibold, // 600 (sobre, pas ultra punchy)
    color: '#7F8C8D', // Gris moyen sobre (pas violet)
    textAlign: 'center',
    lineHeight: 24, // Ajusté pour la nouvelle taille
    letterSpacing: 0.3, // Spacing léger
    fontStyle: 'italic', // Style italien sobre
  },

  // =================== PHRASE EXEMPLE - SOBRE ===================
  exampleSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderTopWidth: 3, // Plus épais (2→3)
    borderTopColor: collegeColors.accent, // Bleu électrique au lieu de gray200
    borderRadius: collegeBorderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: baseColors.white, // Fond blanc clean
  },

  exampleDivider: {
    height: 2,
    marginBottom: spacing.md,
    borderRadius: collegeBorderRadius.round,
  },

  exampleLabel: {
    fontSize: fontSize.base, // 16px
    fontWeight: fontWeight.black, // 800 (gras pour visibilité)
    letterSpacing: 0.5, // Spacing léger
    marginBottom: spacing.md,
    color: '#2C3E50', // Gris foncé sobre (pas orange)
  },

  exampleContent: {
    backgroundColor: baseColors.white,
    borderRadius: collegeBorderRadius.md, // 12px
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: baseColors.gray200,
    ...collegeShadows.card,
  },

  exampleEnglish: {
    fontSize: fontSize.xl, // 20px (lg→xl) - Plus GROS
    fontWeight: fontWeight.extrabold, // 800 (700→800)
    color: collegeColors.primary, // Bleu nuit College au lieu de gray900
    lineHeight: 28, // Augmenté (24→28)
    marginBottom: spacing.sm,
    letterSpacing: -0.2, // Moderne
  },

  exampleFrench: {
    fontSize: fontSize.lg, // 18px (base→lg) - Plus GROS
    fontWeight: fontWeight.semibold, // 600 (500→600)
    color: collegeColors.textSecondary, // #7F8C8D au lieu de gray600
    lineHeight: 26, // Augmenté (22→26)
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },

  // =================== GAMIFICATION - SUBTLE ===================
  gamificationIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },

  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
    marginHorizontal: spacing.xs,
  },
});

export default styles;
