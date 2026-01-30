/**
 * ============================================
 * RevisionCard - Version FlowCard
 * 100% White Label + Mood-Aware
 * ============================================
 */

import React, { useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import FlowCard from '@/components/flow/FlowCard';
import { useTheme } from '@/themes/ThemeContext';

interface RevisionCardProps {
  wordsToReview: number;
  onPress: () => void;
}

const RevisionCard: React.FC<RevisionCardProps> = ({
  wordsToReview,
  onPress,
}) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  // ============================================
  // CONFIGURATION SELON LE MOOD
  // ============================================
  const content = useMemo(() => {
    const hasWords = wordsToReview > 0;

    if (isPlayful) {
      return {
        icon: hasWords ? '🔥' : '✨',
        title: hasWords ? 'Révisions quotidiennes' : 'Pas de révisions',
        subtitle: hasWords
          ? `${wordsToReview} ${wordsToReview <= 1 ? 'mot à réviser' : 'mots à réviser aujourd\'hui'}`
          : 'Tout est à jour ! Bravo !',
        badge: hasWords ? `${wordsToReview}` : null,
        description: hasWords ? 'Révisions' : null,
      };
    }

    return {
      icon: hasWords ? 'refresh' : 'check-circle',
      title: hasWords ? 'Révisions' : 'Révisions à jour',
      subtitle: hasWords
        ? `${wordsToReview} ${wordsToReview <= 1 ? 'mot' : 'mots'} à réviser`
        : 'Aucune révision en attente',
      badge: hasWords ? `${wordsToReview}` : null,
      description: null,
    };
  }, [wordsToReview, isPlayful]);

  const hasWords = wordsToReview > 0;

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <FlowCard
        variant="horizontal"
        icon={content.icon}
        title={content.title}
        subtitle={content.subtitle}
        description={content.description || undefined}
        color={hasWords ? identity.palette.accent : identity.palette.primary}
        badge={content.badge}
        onPress={hasWords ? onPress : undefined}
        locked={!hasWords}
      />
    </Animated.View>
  );
};

export default RevisionCard;
