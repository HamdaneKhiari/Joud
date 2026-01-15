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
      {/* ✅ Texte supprimé pour design minimaliste */}
    </View>
  );
};

const createStyles = (identity: Identity) => StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0, // ✅ Pas de padding horizontal pour coller au header
    paddingVertical: 0,   // ✅ Pas de padding vertical pour être collée
  },
  track: {
    height: 2, // ✅ Ultra-fine (2px au lieu de 8px)
    backgroundColor: identity.branding.themeMode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.05)', // ✅ Opacité réduite
    borderRadius: 0, // ✅ Pas d'arrondi pour ligne parfaite
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: identity.branding.accent, // ✅ Toujours accent
    borderRadius: 0,
    opacity: 0.7, // ✅ Opacité réduite pour être presque invisible
  },
});

export default ExerciseProgressBar;