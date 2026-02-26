/**
 * ============================================
 * SelectionPhase - Sélection du mode de révision
 * ============================================
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import FlowCard from '@/components/flow/FlowCard';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import { tokens } from '@/themes/tokens';
import { Identity } from '@/themes/ThemeContext';

interface SelectionPhaseProps {
  identity: Identity;
  dailyCount: number;
  spacedCount: number;
  onBack: () => void;
  onSelectMode: (mode: 'daily' | 'spaced') => void;
}

const SelectionPhase: React.FC<SelectionPhaseProps> = ({
  identity,
  dailyCount,
  spacedCount,
  onBack,
  onSelectMode,
}) => {
  const isPlayful = identity.ui.mood === 'playful';

  return (
    <View style={{ flex: 1, backgroundColor: identity.palette.background }}>
      <ExerciseLayout
        headerProps={{
          variant: 'exercise',
          onBack,
          rightIcon: '🔄',
          exerciseTitle: 'Révisions',
        }}
      >
        <ScrollView contentContainerStyle={{ padding: tokens.spacing.xl, gap: tokens.spacing.lg }}>
          <Animated.View entering={FadeInDown.delay(0).springify()}>
            <Text
              style={{
                fontSize: tokens.fontSize.xl,
                fontWeight: tokens.fontWeight.bold,
                color: identity.text.primary,
                marginBottom: tokens.spacing.md,
              }}
            >
              {isPlayful ? 'Choisis ton mode !' : 'Choisis un mode'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <FlowCard
              variant="horizontal"
              icon={isPlayful ? '🌅' : 'weather-sunny'}
              title="Quotidienne"
              subtitle={`${dailyCount} mots`}
              color={identity.palette.primary}
              onPress={() => onSelectMode('daily')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <FlowCard
              variant="horizontal"
              icon={isPlayful ? '🔥' : 'refresh'}
              title="Espacée"
              subtitle={`${spacedCount} ${spacedCount <= 1 ? 'mot' : 'mots'}`}
              color={identity.palette.accent}
              onPress={spacedCount > 0 ? () => onSelectMode('spaced') : undefined}
              locked={spacedCount === 0}
            />
          </Animated.View>

          {spacedCount === 0 && (
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text
                style={{
                  fontSize: tokens.fontSize.sm,
                  color: identity.text.secondary,
                  textAlign: 'center',
                  marginTop: tokens.spacing.lg,
                }}
              >
                💡 Fais des révisions quotidiennes pour débloquer les espacées !
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </ExerciseLayout>
    </View>
  );
};

export default SelectionPhase;
