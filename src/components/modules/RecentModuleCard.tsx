/**
 * RecentModuleCard - Wrapper autour de FlowCard pour continuer un module
 * Composant léger qui délègue tout à FlowCard avec variant="horizontal"
 */

import React from 'react';
import FlowCard, { FlowCardProps } from '@/components/flow/FlowCard';

// ============================================
// TYPES
// ============================================

export interface RecentModuleCardProps extends Omit<FlowCardProps, 'variant' | 'description'> {
  // Hérite de tous les props de FlowCard sauf variant et description
  // variant est forcé à 'horizontal'
  // description devient le label "Continuer"
}

// ============================================
// COMPOSANT
// ============================================

const RecentModuleCard: React.FC<RecentModuleCardProps> = (props) => {
  return (
    <FlowCard
      {...props}
      variant="horizontal"
      description="Continuer"
    />
  );
};

export default RecentModuleCard;
