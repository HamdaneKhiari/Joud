// ============================================
// FICHIER: src/components/exercise-common/NavigationButtons/style.js
// VERSION FINALE - Bouton disabled corrigé + tokens
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, borderRadius, borderWidth as borderWidths, shadows } from '@themes/tokens';
import { baseColors } from '@themes/colors';

export const styles = StyleSheet.create({
  // ============================================
  // CONTAINER PRINCIPAL
  // ============================================
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: baseColors.white,
    borderTopWidth: borderWidths.thin,
    borderTopColor: 'rgba(0,0,0,0.06)',
    ...shadows.lg,
  },

  // Espaceur central flexible
  spacer: {
    flex: 1,
  },

  // ============================================
  // BOUTONS DE NAVIGATION
  // ============================================

  // Bouton base - Design moderne et rond
  navButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },

  // Bouton Précédent - Couleur secondaire
  navButtonPrev: {
    backgroundColor: baseColors.pink500,
  },

  // Bouton Suivant - Couleur primaire (bleu)
  navButtonNext: {
    backgroundColor: baseColors.blue500,
  },

  // Bouton Terminer - Couleur succès (vert)
  navButtonFinish: {
    backgroundColor: baseColors.green500,
  },

  // ============================================
  // État DÉSACTIVÉ - Plus visible
  // ============================================
  navButtonDisabled: {
    backgroundColor: baseColors.gray300,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.gray400,
    shadowOpacity: 0.1,
    elevation: 3,
  },
});
