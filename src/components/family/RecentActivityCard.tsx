/**
 * RecentActivityCard - Wrapper autour de FlowCard pour la dernière activité
 * Composant léger qui délègue tout à FlowCard avec variant="horizontal"
 */

import React from 'react';
import FlowCard, { FlowCardProps } from '@/components/flow/FlowCard';

// ============================================
// TYPES
// ============================================

export interface RecentActivityCardProps extends Omit<FlowCardProps, 'variant' | 'description'> {
  // Hérite de tous les props de FlowCard sauf variant et description
  // variant est forcé à 'horizontal'
  // description devient le label "Reprendre"
}

// ============================================
// COMPOSANT
// ============================================

const RecentActivityCard: React.FC<RecentActivityCardProps> = (props) => {
  return (
    <FlowCard
      {...props}
      variant="horizontal"
      description="Reprendre"
    />
  );
};

export default RecentActivityCard;
