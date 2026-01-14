import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '@/themes/tokens';
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
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress}%` }]} />
      </View>
      {progressText && (
        <Text style={styles.text}>{progressText}</Text>
      )}
    </View>
  );
};

const createStyles = (identity: Identity) => StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  track: {
    height: 8,
    backgroundColor: identity.branding.themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: identity.branding.dashboardLevelProgressColor || identity.branding.accent,
    borderRadius: borderRadius.round,
  },
  text: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: identity.branding.textOnMain,
    fontWeight: fontWeight.medium,
    opacity: 0.8,
  }
});

export default ExerciseProgressBar;