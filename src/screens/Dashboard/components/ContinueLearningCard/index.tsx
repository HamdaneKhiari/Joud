/**
 * ============================================
 * ContinueLearningCard - Version FlowCard
 * 100% White Label + Mood-Aware
 * ============================================
 */

import React, { useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { View } from 'react-native';
import FlowCard from '@/components/flow/FlowCard';
import { ActivityData } from '@/hooks/useLastActivity';
import { useTheme } from '@/themes/ThemeContext';

interface ContinueLearningCardProps {
  activity: ActivityData | null;
  onPress?: () => void;
  onStartPress?: () => void;
}

const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  activity,
  onPress,
  onStartPress,
}) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  // ============================================
  // CONFIGURATION SELON LE MOOD
  // ============================================
  const content = useMemo(() => {
    if (isPlayful) {
      return {
        emptyTitle: "Commencer l'aventure",
        emptySubtitle: "Choisis ton premier exercice !",
        emptyIcon: "🚀",
        emptyBadge: "Nouveau",
        activeTitle: "Continuer l'aventure",
        activeBadge: "En cours"
      };
    }
    return {
      emptyTitle: "Démarrer le parcours",
      emptySubtitle: "Sélectionnez un module pour débuter",
      emptyIcon: "➤",
      emptyBadge: null,
      activeTitle: "Reprendre l'activité",
      activeBadge: null
    };
  }, [isPlayful]);

  // Icône par défaut si l'activité n'en a pas
  const fallbackIcon = isPlayful ? '🔥' : 'play-circle';

  // ============================================
  // BADGE MODULE (Type d'exercice)
  // ============================================
  const moduleLabel = useMemo(() => {
    if (!activity) return '';
    const slug = activity.moduleSlug || '';
    const moduleNames: Record<string, string> = {
      grammar: 'Grammaire',
      dialogues: 'Dialogues',
      phrase_types: 'Phrases',
      reading: 'Lecture',
      word_games: 'Jeux',
      vocab: 'Vocabulaire'
    };
    return moduleNames[slug] || 'Module';
  }, [activity]);

  // ============================================
  // ÉTAT VIDE : Première utilisation
  // ============================================
  if (!activity) {
    return (
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <FlowCard
          variant="horizontal"
          icon={content.emptyIcon}
          title={content.emptyTitle}
          subtitle={content.emptySubtitle}
          description={content.emptyBadge || undefined}
          color={identity.palette.primary}
          badge={isPlayful ? content.emptyBadge : null}
          onPress={onStartPress}
        />
      </Animated.View>
    );
  }

  // ============================================
  // ÉTAT ACTIF : Reprise d'activité
  // ============================================
  const displaySubtitle = `${moduleLabel} • ${activity.familyName} • Niveau ${activity.level}`;

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <FlowCard
        variant="horizontal"
        icon={activity.icon || fallbackIcon}
        title={content.activeTitle}
        subtitle={displaySubtitle}
        description={isPlayful ? "Dernière activité" : undefined}
        color={identity.palette.primary}
        badge={isPlayful ? content.activeBadge : null}
        progress={activity.progress || null}
        onPress={onPress}
      />
    </Animated.View>
  );
};

export default ContinueLearningCard;
