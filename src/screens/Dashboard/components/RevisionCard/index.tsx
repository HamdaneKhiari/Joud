/**
 * ============================================
 * RevisionCard - TypeScript
 * 100% White Label - Couleur pilotée par Identity
 * ============================================
 */

import React from 'react';
import DashboardCard from '../DashboardCard';

interface RevisionCardProps {
  wordsToReview: number;
  onPress: () => void;
}

const RevisionCard: React.FC<RevisionCardProps> = ({
  wordsToReview,
  onPress,
}) => {
  return (
    <DashboardCard
      icon="🔄"
      title="Révisions"
      subtitle={`${wordsToReview} ${wordsToReview <= 1 ? 'mot à réviser' : 'mots à réviser'}`}
      buttonText="Commencer les révisions"
      variantColor="accent"
      onPress={wordsToReview > 0 ? onPress : undefined}
      showArrow={wordsToReview > 0}
    />
  );
};

export default RevisionCard;
