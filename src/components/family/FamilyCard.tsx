/**
 * FamilyCard - Wrapper autour de FlowCard pour les familles
 * Composant léger qui délègue tout à FlowCard
 */

import React from 'react';
import FlowCard, { FlowCardProps } from '@/components/flow/FlowCard';

// ============================================
// TYPES
// ============================================

export interface FamilyCardProps extends Omit<FlowCardProps, 'variant'> {
  // Hérite de tous les props de FlowCard sauf variant
  // variant est forcé à 'grid' pour les familles
}

// ============================================
// COMPOSANT
// ============================================

const FamilyCard: React.FC<FamilyCardProps> = (props) => {
  return <FlowCard {...props} variant="grid" />;
};

export default FamilyCard;
