import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { withOpacity } from '@/themes/tokens'; // ✅ On utilise withOpacity pour la track
import type { Identity } from '@/themes/ThemeContext';

interface ExerciseProgressBarProps {
  progressPercent: number;
}

const ExerciseProgressBar: React.FC<ExerciseProgressBarProps> = ({ 
  progressPercent 
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
    </View>
  );
};

const createStyles = (identity: Identity) => StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    height: 2, 
    // ✅ Utilisation de identity.text.primary avec opacité via token/helper
    backgroundColor: withOpacity(identity.text.primary, 0.05),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    // ✅ On pioche dans l'accent de l'identité (souvent lié au module)
    backgroundColor: identity.palette.accent, 
    opacity: 0.8,
  },
});

export default ExerciseProgressBar;