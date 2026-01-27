/**
 * ModuleCard - Wrapper autour de FlowCard pour les modules
 * Composant léger qui délègue tout à FlowCard
 */

import React from 'react';
import FlowCard, { FlowCardProps } from '@/components/flow/FlowCard';

// ============================================
// TYPES
// ============================================

export interface ModuleCardProps extends Omit<FlowCardProps, 'variant'> {
  // Hérite de tous les props de FlowCard sauf variant
  // variant est forcé à 'grid' pour les modules
}

// ============================================
// COMPOSANT
// ============================================

const ModuleCard: React.FC<ModuleCardProps> = (props) => {
  return <FlowCard {...props} variant="grid" />;
};

export default ModuleCard;
