/**
 * FamilyCard - Wrapper autour de FlowCard pour les familles
 * Composant léger qui délègue tout à FlowCard
 * ✅ Support de la progression pour afficher les badges de %
 */

import React from 'react';
import FlowCard, { FlowCardProps } from '@/components/flow/FlowCard';

// ============================================
// TYPES
// ============================================

export interface FamilyCardProps extends Omit<FlowCardProps, 'variant'> {
  // Hérite de tous les props de FlowCard sauf variant
  // variant est forcé à 'grid' pour les familles
  // ✅ Supporte maintenant `progress` pour afficher le % en badge
}

// ============================================
// COMPOSANT
// ============================================

const FamilyCard: React.FC<FamilyCardProps> = (props) => {
  return <FlowCard {...props} variant="grid" />;
};

export default FamilyCard;
