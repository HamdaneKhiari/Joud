import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './levelCardStyle';

interface LevelData {
  id: number;
  level: number;
  status?: 'completed' | 'in_progress' | 'locked';
  title?: string;
  score?: number;
}

interface LevelCardProps {
  data: LevelData;
  onPress: () => void;
  isLast?: boolean;
}

const LevelCard: React.FC<LevelCardProps> = ({ data, onPress, isLast = false }) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);
  const [isPressed, setIsPressed] = useState(false);

  const isPlayful = identity.ui.mood === 'playful';
  const isCompleted = data?.status === 'completed';
  const isLocked = data?.status === 'locked';

  // Config visuelle selon l'état
  const config = useMemo(() => {
    if (isCompleted) {
      return {
        badgeColor: isPlayful ? '#FFD700' : identity.palette.primary,
        icon: isPlayful ? 'star' : 'check-decagram',
        label: isPlayful ? 'Bravo !' : 'Terminé',
        content: data.score ? `${data.score}%` : 'OK'
      };
    }
    return {
      badgeColor: isLocked ? '#E0E0E0' : identity.palette.primary,
      icon: isPlayful ? 'rocket-launch' : 'play-circle',
      label: isLocked ? 'Bientôt' : (isPlayful ? 'C\'est parti !' : 'À démarrer'),
      content: data.level
    };
  }, [isCompleted, isLocked, isPlayful, identity, data]);

  if (!data) return null;

  return (
    <View style={styles.container}>
      {/* SECTION TIMELINE */}
      <View style={styles.timelineContainer}>
        <View style={[styles.badge, { borderColor: config.badgeColor }]}>
          <Text style={[styles.badgeText, isCompleted && { color: config.badgeColor }]}>
            {config.content}
          </Text>
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      {/* SECTION CARTE CLICKABLE */}
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          disabled={isLocked}
          style={[
            styles.card,
            isPressed && { transform: [{ scale: 0.98 }] },
            !isPlayful && { borderLeftColor: config.badgeColor }
          ]}
        >
          <View style={styles.textContainer}>
            <Text style={styles.title}>{data.title || `Niveau ${data.level}`}</Text>
            <Text style={styles.subtitle}>{config.label}</Text>
          </View>

          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={config.icon as any} 
              size={26} 
              color={config.badgeColor} 
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LevelCard;