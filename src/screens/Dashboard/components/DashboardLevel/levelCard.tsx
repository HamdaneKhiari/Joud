/**
 * LevelCard - Version White Label avec Timeline
 * Design : Badge timeline (gauche) + Card personnalisée (droite)
 * 100% Mood-Aware + White Label
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './levelCardStyle';

interface LevelData {
  id: number;
  level: number; // ✅ Utilisé pour le badge rond (1, 2, 3, 4)
  status?: 'completed' | 'in_progress' | 'locked';
  title?: string; // ✅ Titre complet depuis la DB (ex: "Les Bases", "L'Essentiel")
  score?: number;
}

interface LevelCardProps {
  data: LevelData;
  onPress: () => void;
  isLast?: boolean;
  animationDelay?: number;
}

const LevelCard: React.FC<LevelCardProps> = ({
  data,
  onPress,
  isLast = false,
  animationDelay = 0
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  const isPlayful = identity.ui.mood === 'playful';
  const isCompleted = data?.status === 'completed';
  const isLocked = data?.status === 'locked';

  // ============================================
  // CONFIG VISUELLE SELON L'ÉTAT (100% White Label)
  // ============================================
  const config = useMemo(() => {
    // ✅ Badge rond : JUSTE LE NUMÉRO (1, 2, 3, 4)
    const badgeNumber = data.level.toString();

    if (isCompleted) {
      return {
        badgeColor: identity.palette.primary,
        icon: isPlayful ? 'star' : 'check-decagram',
        label: isPlayful ? 'Bravo !' : 'Terminé',
        content: badgeNumber
      };
    }

    if (isLocked) {
      return {
        badgeColor: identity.text.tertiary,
        icon: 'lock',
        label: 'Bientôt',
        content: badgeNumber
      };
    }

    // En cours ou à démarrer
    const activeLabel = isPlayful ? 'C\'est parti !' : 'À démarrer';
    return {
      badgeColor: identity.palette.primary,
      icon: isPlayful ? 'rocket-launch' : 'play-circle',
      label: activeLabel,
      content: badgeNumber
    };
  }, [isCompleted, isLocked, isPlayful, identity, data]);

  const handlePress = () => {
    if (isLocked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  if (!data) return null;

  return (
    <Animated.View
      entering={FadeInRight.delay(animationDelay).springify()}
      style={styles.container}
    >
      {/* ============================================
          TIMELINE BADGE (Gauche)
          ============================================ */}
      <View style={styles.timelineContainer}>
        <View style={[styles.badge, { borderColor: config.badgeColor }]}>
          <Text style={[
            styles.badgeText,
            { color: isCompleted ? config.badgeColor : identity.text.primary }
          ]}>
            {config.content}
          </Text>
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      {/* ============================================
          CARD PERSONNALISÉE (Droite)
          ============================================ */}
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          disabled={isLocked}
          style={[
            styles.card,
            isLocked && { opacity: 0.5 },
            !isPlayful && { borderLeftColor: config.badgeColor }
          ]}
        >
          <View style={styles.textContainer}>
            {/* ✅ Titre depuis la DB (ex: "Les Bases", "L'Essentiel") */}
            <Text style={styles.title}>
              {data.title}
            </Text>
            {/* ✅ Label dynamique selon le mood */}
            <Text style={styles.subtitle}>
              {config.label}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={config.icon as any}
              size={28}
              color={config.badgeColor}
            />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default LevelCard;