// ============================================
// FICHIER: src/components/pedagogy/word_games/SpeedMatchCard/style.js
// ✅ AVEC STYLES DU BOUTON CONTINUER
// ============================================

import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, borderWidth as borderWidths, shadows } from '@themes/tokens';
import { baseColors } from '@themes/colors';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xl },

  card: {
    backgroundColor: baseColors.white,
    borderRadius: borderRadius.xl,
    borderTopWidth: borderWidths.heavy,
    overflow: 'hidden',
    ...shadows.xl,
    marginBottom: spacing.xl,
  },

  colorBar: { height: borderWidths.heavy, elevation: 2 },

  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: borderWidths.base,
    borderBottomColor: baseColors.gray100,
  },

  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F0F9FF',
  },

  timerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  scoreText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
    color: baseColors.success,
  },

  // =================== PROGRESS SECTION ===================
  progressSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },

  progressLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray600,
    marginBottom: spacing.md,
  },

  progressBar: {
    height: 8,
    backgroundColor: baseColors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },

  // =================== INSTRUCTION ===================
  instruction: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray600,
    marginVertical: spacing.lg,
  },

  // =================== WORDS SECTION ===================
  wordsSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },

  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: baseColors.gray700,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  wordsList: {
    gap: spacing.md,
  },

  wordButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidths.base,
    backgroundColor: baseColors.white,
    minHeight: 50,
    justifyContent: 'center',
  },

  wordButtonSelected: {
    backgroundColor: '#F0F9FF',
    borderWidth: borderWidths.heavy,
  },

  wordButtonMatched: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },

  wordText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray900,
  },

  wordTextMatched: {
    color: '#166534',
    fontWeight: fontWeight.bold,
  },

  // =================== RESULT SECTION ===================
  resultSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },

  resultIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },

  resultTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: baseColors.gray900,
    marginBottom: spacing.md,
  },

  resultScore: {
    fontSize: fontSize.huge,
    fontWeight: fontWeight.black,
    color: baseColors.success,
    marginBottom: spacing.lg,
  },

  resultMatched: {
    fontSize: fontSize.base,
    color: baseColors.gray600,
    marginBottom: spacing.md,
  },

  resultSubtext: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: baseColors.gray500,
    fontStyle: 'italic',
    marginBottom: spacing.xl,
  },

  // =================== CONTINUE BUTTON ===================
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    marginTop: spacing.lg,
  },

  continueButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: baseColors.white,
  },
});

export default styles;