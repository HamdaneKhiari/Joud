import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '@themes/tokens';
import { baseColors } from '@themes/colors';

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: baseColors.white,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },

  // ===== MASTERY CARD (Remplace Summary/Celebration) =====
  masteryCard: {
    margin: spacing.xl,
    padding: spacing.xl,
    backgroundColor: baseColors.white,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: baseColors.gray100,
    ...shadows.md,
  },
  masteryLabel: {
    fontSize: fontSize.base,
    color: baseColors.gray600,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  masteryPercentage: {
    fontSize: 56, // Très gros pour l'impact visuel
    fontWeight: fontWeight.extraBold,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 12,
    width: '100%',
    backgroundColor: baseColors.gray100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  statsSummary: {
    fontSize: fontSize.sm,
    color: baseColors.gray500,
    fontWeight: fontWeight.medium,
  },

  // ===== BOUTON D'ACTION (Le bouton "🚀 Lancer") =====
  actionSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  startButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradientButton: {
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonEmoji: {
    fontSize: 40,
    marginRight: spacing.lg,
  },
  startButtonText: {
    color: baseColors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  startButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: fontSize.sm,
    marginTop: 2,
  },

  // ===== SECTION COMPÉTENCES (SKILLS) =====
  skillsSection: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: baseColors.gray900,
    marginBottom: spacing.md,
  },
  skillsGrid: {
    gap: spacing.md, // Espace entre les FlowCards
  }
});