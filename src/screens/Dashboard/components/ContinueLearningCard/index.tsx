/**
 * ============================================
 * ContinueLearningCard - TypeScript
 * 100% White Label - Couleur pilotée par Identity
 * ============================================
 */

import React, { useMemo } from 'react';
import DashboardCard from '../DashboardCard';
import { ActivityData } from '@/hooks/useLastActivity';

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
        icon="🚀"
        title="Commencer l'aventure"
        subtitle="Choisis ton premier exercice !"
        buttonText="Découvrir le niveau 1"
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
      icon={activity.icon || '🔥'}
      title="Continuer"
      subtitle={displayLabel}
      buttonText="Reprendre"
      variantColor="primary"
      onPress={onPress}
      showArrow
    />
  );
};

export default ContinueLearningCard;
