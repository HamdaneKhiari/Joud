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

  const clampedProgress = Math.min(100, Math.max(0, progressPercent));

  return (
    <View style={styles.container}>
      {progressText && (
        <Text style={styles.progressText}>{progressText}</Text>
      )}

      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: clampedProgress }}
      >
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
    height: 6,
    backgroundColor: withOpacity(identity.text.primary, 0.08),
    borderRadius: tokens.borderRadius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: identity.palette.accent,
    borderRadius: tokens.borderRadius.sm,
    shadowColor: identity.palette.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});

export default ExerciseProgressBar;
