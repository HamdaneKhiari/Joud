/**
 * ============================================
 * ContinueLearningCard - TypeScript
 * 100% White Label - Couleur pilotée par Identity
 * ============================================
 */

import React, { useMemo } from 'react';
import DashboardCard from '../DashboardCard';
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

  // Configuration du contenu textuel et visuel selon le Mood
  const content = useMemo(() => {
    if (isPlayful) {
      return {
        emptyTitle: "Commencer l'aventure",
        emptySubtitle: "Choisis ton premier exercice !",
        emptyButton: "Découvrir le niveau 1",
        emptyIcon: "🚀",
        activeTitle: "Continuer",
        activeButton: "Reprendre"
      };
    }
    return {
      emptyTitle: "Démarrer le parcours",
      emptySubtitle: "Sélectionnez un module pour débuter",
      emptyButton: "Accéder au contenu",
      emptyIcon: "⏩", // Plus sobre que la fusée
      activeTitle: "Reprendre l'activité",
      activeButton: "Continuer"
    };
  }, [isPlayful]);

  // Icône par défaut si l'activité n'en a pas (Feu pour le jeu, Play pour le sérieux)
  const fallbackIcon = isPlayful ? '🔥' : 'play-circle';

  // Logique des badges (type d'exercice)
  const typeLetter = useMemo(() => {
    if (!activity) return '';
    const slug = activity.moduleSlug || '';
    switch (slug) {
      case 'grammar':
        return 'G';
      case 'dialogues':
        return 'D';
      case 'phrase_types':
        return 'P';
      case 'reading':
        return 'L';
      case 'word_games':
        return 'Q';
      case 'vocab':
        return 'V';
      default:
        return 'V';
    }
  }, [activity]);

  // ========== ÉTAT VIDE : Première utilisation ==========
  if (!activity) {
    return (
      <DashboardCard
        icon={content.emptyIcon}
        title={content.emptyTitle}
        subtitle={content.emptySubtitle}
        buttonText={content.emptyButton}
        variantColor="primary"
        onPress={onStartPress}
        showArrow
      />
    );
  }

  // ========== ÉTAT ACTIF : Reprise d'activité ==========
  const displayLabel = `${typeLetter} : ${activity.familyName} - N${activity.level}`;

  return (
    <DashboardCard
      icon={activity.icon || fallbackIcon}
      title={content.activeTitle}
      subtitle={displayLabel}
      buttonText={content.activeButton}
      variantColor="primary"
      onPress={onPress}
      showArrow
    />
  );
};

export default ContinueLearningCard;
