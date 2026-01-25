import { StyleSheet } from 'react-native';
import { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

/**
 * Génère les styles dynamiques pour la carte de traduction.
 * @param identity - L'objet d'identité visuelle de l'app
 * @param moduleColor - La couleur du module actuel (ex: bleu pour sentences)
 */
export const getSentenceCardStyles = (identity: Identity, moduleColor: string) => {
  const { branding, text, ui } = identity;
  const isDark = branding.themeMode === 'dark';

  return StyleSheet.create({
    container: {
      padding: tokens.spacing.xl,
    },
    // --- SECTION ÉNONCÉ ---
    questionBox: {
      marginBottom: tokens.spacing.xxl,
    },
    instruction: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.black,
      color: text.tertiary, // Couleur neutre pour ne pas distraire
      letterSpacing: 1.2,
      marginBottom: tokens.spacing.xs,
      textTransform: 'uppercase',
    },
    phraseSource: {
      fontSize: tokens.fontSize.xxl,
      fontWeight: tokens.fontWeight.bold,
      color: text.primary, // S'adapte au mode sombre/clair
      lineHeight: 34,
    },
    // --- ZONE DE SAISIE LIBRE ---
    input: {
      fontSize: tokens.fontSize.lg,
      color: text.primary,
      minHeight: 140, // Assez haut pour voir plusieurs lignes
      textAlignVertical: 'top',
      padding: tokens.spacing.lg,
      borderRadius: ui.cardRadius || tokens.borderRadius.lg,
      borderWidth: 2,
      // Fond très légèrement teinté pour détacher la zone de saisie
      backgroundColor: withOpacity(text.primary, 0.03),
    },
    // --- ZONE DE RÉVÉLATION (AUTO-CORRECTION) ---
    revealContainer: {
      marginTop: tokens.spacing.xxl,
      gap: tokens.spacing.xl,
    },
    correctionBlock: {
      // Utilise la couleur du module pour marquer la réponse "officielle"
      borderLeftWidth: 4,
      borderLeftColor: moduleColor,
      paddingLeft: tokens.spacing.lg,
      paddingVertical: tokens.spacing.xs,
      backgroundColor: withOpacity(moduleColor, 0.04),
      borderRadius: tokens.borderRadius.sm,
    },
    labelCorrection: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: moduleColor,
      marginBottom: 4,
    },
    phraseTarget: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color: text.primary,
    },
    // --- BLOCS PÉDAGOGIQUES (CONCRÈTEMENT / BUILD) ---
    pedagogyCard: {
      // Utilise moduleColor avec opacité pour rester dans l'univers visuel du module
      backgroundColor: withOpacity(moduleColor, 0.07),
      padding: tokens.spacing.lg,
      borderRadius: ui.cardRadius || tokens.borderRadius.md,
      borderWidth: 1,
      borderColor: withOpacity(moduleColor, 0.1),
    },
    pedagogyTitle: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.black,
      color: moduleColor,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    pedagogyText: {
      fontSize: tokens.fontSize.md,
      lineHeight: 22,
      color: text.secondary,
    }
  });
};