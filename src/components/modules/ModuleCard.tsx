// Wrapper léger autour de FlowCard : variant forcé à 'grid' pour les modules
import React from 'react';
import FlowCard, { FlowCardProps } from '@/components/flow/FlowCard';

export type ModuleCardProps = Omit<FlowCardProps, 'variant'>;

const ModuleCard: React.FC<ModuleCardProps> = (props) => {
  return <FlowCard {...props} variant="grid" />;
};

export default ModuleCard;
