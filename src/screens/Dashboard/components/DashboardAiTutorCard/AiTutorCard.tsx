/**
 * AITutorCard - Version FlowCard
 * 100% White Label + Mood-Aware
 */

import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/themes/ThemeContext';
import FlowCard from '@/components/flow/FlowCard';

const AITutorCard: React.FC = () => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  // ============================================
  // CONFIG SELON LE MOOD (100% White Label)
  // ============================================
  const config = {
    icon: isPlayful ? '🤖' : 'robot',
    title: identity.aiTutor.title || 'Tuteur IA',
    subtitle: identity.aiTutor.subtitle || 'Ton assistant personnel',
    description: isPlayful ? 'Intelligence Artificielle' : undefined,
    badge: isPlayful ? 'IA' : null,
    color: identity.palette.primary,
  };

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <FlowCard
        variant="horizontal"
        icon={config.icon}
        title={config.title}
        subtitle={config.subtitle}
        description={config.description}
        color={config.color}
        badge={config.badge}
        onPress={() => console.log('Ouvrir Tuteur IA')}
      />
    </Animated.View>
  );
};

export default AITutorCard;