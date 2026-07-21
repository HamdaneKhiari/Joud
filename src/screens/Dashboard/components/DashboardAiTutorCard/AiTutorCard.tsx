import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import FlowCard from '@/components/flow/FlowCard';

const AITutorCard: React.FC = () => {
  const router = useRouter();
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

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
        onPress={() => router.push('/ai-tutor')}
      />
    </Animated.View>
  );
};

export default AITutorCard;