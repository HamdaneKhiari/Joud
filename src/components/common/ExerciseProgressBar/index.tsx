/**
 * ============================================
 * ExerciseProgressBar - 100% White Label
 * Barre de progression élégante avec texte
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

interface ExerciseProgressBarProps {
  progressPercent: number;
  progressText?: string;
}

const ExerciseProgressBar: React.FC<ExerciseProgressBarProps> = ({
  progressPercent,
  progressText
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Sécurisation du pourcentage entre 0 et 100
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));

  return (
    <View style={styles.container}>
      {/* Texte de progression */}
      {progressText && (
        <Text style={styles.progressText}>{progressText}</Text>
      )}

      {/* Barre de progression */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress}%` }]} />
      </View>
    </View>
  );
};

const createStyles = (identity: Identity) => StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    backgroundColor: identity.palette.surface,
    gap: tokens.spacing.sm,
  },
  progressText: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.semibold,
    color: identity.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  track: {
    height: 6, // ✅ Hauteur augmentée pour meilleure visibilité
    backgroundColor: withOpacity(identity.text.primary, 0.08),
    borderRadius: tokens.borderRadius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: identity.palette.accent,
    borderRadius: tokens.borderRadius.sm,
    // ✅ Effet de glow subtil
    shadowColor: identity.palette.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});

export default ExerciseProgressBar;
