/**
 * ============================================
 * EXERCISE VALIDATION - STYLES (100% White Label)
 * Fonction dynamique basée sur Identity
 * ============================================
 */

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, borderWidth as borderWidths, shadows, withOpacity } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import type { Identity } from '@/themes/ThemeContext';

/**
 * Génère les styles dynamiquement en fonction de l'Identity
 * ✅ WHITE LABEL: Utilise identity.branding pour les couleurs principales
 * ✅ TOKENS SÉMANTIQUES: Utilise baseColors uniquement pour success/error (couleurs système)
 */
export const getStyles = (identity: Identity) => StyleSheet.create({
  // ============================================
  // CONTAINER PLEINE LARGEUR AVEC COINS ARRONDIS
  // ============================================
  container: {
    paddingHorizontal: 0,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: baseColors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    borderTopWidth: borderWidths.thin,
    borderTopColor: withOpacity('#000000', 0.05),
    ...shadows.lg,
  },

  // ============================================
  // FEEDBACK BANNER
  // ============================================
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: borderWidths.thick,
    ...shadows.md,
  },

  feedbackCorrect: {
    backgroundColor: baseColors.green50,
    borderColor: baseColors.green500,
  },

  feedbackIncorrect: {
    backgroundColor: baseColors.red50,
    borderColor: baseColors.red500,
  },

  // ✅ NO-MEDIA: Icône Ionicons sobre avec background circulaire
  feedbackIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: baseColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    ...shadows.sm,
  },

  feedbackTextContainer: {
    flex: 1,
  },

  feedbackTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extraBold as any,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },

  feedbackTitleCorrect: {
    color: baseColors.green600,
  },

  feedbackTitleIncorrect: {
    color: baseColors.red500,
  },

  feedbackMessage: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as any,
    lineHeight: 21,
    letterSpacing: 0.2,
  },

  feedbackMessageCorrect: {
    color: baseColors.green600,
  },

  feedbackMessageIncorrect: {
    color: baseColors.red600,
  },

  // Badge décoratif sur succès
  successBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: baseColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    ...shadows.sm,
  },

  // ============================================
  // BOUTON PRINCIPAL
  // ============================================
  buttonWrapper: {
    marginHorizontal: spacing.md,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    ...shadows.xl,
  },

  buttonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    backgroundColor: withOpacity(baseColors.white, 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  buttonLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extraBold as any,
    color: identity.text.onMain, // ✅ WHITE LABEL
    textTransform: 'uppercase' as any,
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center' as any,
  },

  buttonArrow: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: withOpacity(baseColors.white, 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  // ============================================
  // ÉTATS DU BOUTON (✅ WHITE LABEL)
  // ============================================

  // État INITIAL (Valider) - Utilise la couleur principale de l'identité
  buttonInitial: {
    backgroundColor: identity.branding.main, // ✅ WHITE LABEL
    borderWidth: borderWidths.thick,
    borderColor: withOpacity(baseColors.white, 0.3),
  },

  // État CORRECT (Suivant) - Couleur système success
  buttonCorrect: {
    backgroundColor: baseColors.green500,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.green600,
  },

  // État INCORRECT (Réessayer) - Couleur système warning
  buttonIncorrect: {
    backgroundColor: baseColors.orange500,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.orange600,
  },

  // État SKIP (Continuer après 2 erreurs) - Gris neutre
  buttonSkip: {
    backgroundColor: baseColors.gray400,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.gray500,
    ...shadows.xl,
  },

  // ============================================
  // État DÉSACTIVÉ - BIEN VISIBLE
  // ============================================
  buttonDisabled: {
    backgroundColor: baseColors.gray300,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.gray400,
    opacity: 1,
    shadowOpacity: 0.1,
    elevation: 3,
  },
});
