import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './levelCardStyle';

interface LevelData {
  id: number;
  level: number;
  difficulty?: string;
  status?: 'completed' | 'in_progress';
  title?: string; // Optionnel pour compatibilité
}

interface LevelCardProps {
  data: LevelData;
  onPress: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ data, onPress }) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Sécurité anti-crash : si data est undefined, on ne rend rien
  if (!data) return null;

  const isCompleted = data?.status === 'completed';

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8} 
      style={styles.card}
    >
      {identity.ui.showDecorativeShapes && (
        <View style={styles.decorativeCircle} />
      )}

      <View style={styles.mainContainer}>
        {/* Badge circulaire avec le numéro de niveau */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{data.level || '?'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.levelTitle}>
            {data.title || `Niveau ${data.level}`}
          </Text>
          
          {data.difficulty && (
            <View style={styles.difficultyTag}>
              <Text style={styles.difficultyText}>
                {data.difficulty.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statusContainer}>
          <Text style={isCompleted ? styles.checkIcon : styles.playIcon}>
            {isCompleted ? "✅" : "▶️"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LevelCard;