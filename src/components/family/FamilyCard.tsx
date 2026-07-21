// Wrapper léger autour de FlowCard : variant forcé à 'grid' pour les familles
import React from 'react';
import FlowCard, { FlowCardProps } from '@/components/flow/FlowCard';

export type FamilyCardProps = Omit<FlowCardProps, 'variant'>;

const FamilyCard: React.FC<FamilyCardProps> = (props) => {
  return <FlowCard {...props} variant="grid" />;
};

export default FamilyCard;
