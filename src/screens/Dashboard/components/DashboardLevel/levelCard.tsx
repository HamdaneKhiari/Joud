import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './levelCardStyle';

interface LevelData {
  id: number;
  level: number;
  status?: 'completed' | 'in_progress';
  title?: string;
}

interface LevelCardProps {
  data: LevelData;
  onPress: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ data, onPress }) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);
  const [isPressed, setIsPressed] = useState(false);

  // Sécurité anti-crash : si data est undefined, on ne rend rien
  if (!data) return null;

  const isCompleted = data?.status === 'completed';

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1} // ✅ Désactivé pour utiliser notre propre feedback
      style={[styles.card, isPressed && styles.cardPressed]}
    >
      <View style={styles.mainContainer}>
        {/* Badge circulaire avec le numéro de niveau */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{data.level || '?'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.levelTitle}>
            {data.title || `Niveau ${data.level}`}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={isCompleted ? styles.statusTextCompleted : styles.statusTextProgress}>
            {isCompleted ? "DONE" : "START"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LevelCard;