// ============================================
// FICHIER: src/screens/exercises/Assessment/AssessmentScreen/style.js
// ✅ REFACTORISÉ - Utilise les tokens
// ============================================

import { StyleSheet } from 'react-native';
import { spacing } from '@themes/tokens';
import { baseColors } from '@themes/colors';

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: baseColors.white,
  },

  // ===== CONTENT =====
  content: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    backgroundColor: baseColors.white,
  },

  scrollContent: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
