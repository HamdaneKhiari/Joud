/**
 * ============================================
 * SummaryPhase - Résumé de la session de révision
 * ============================================
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import FlowCard from '@/components/flow/FlowCard';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import { tokens } from '@/themes/tokens';
import { Identity } from '@/themes/ThemeContext';

interface SummaryPhaseProps {
  identity: Identity;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  onBack: () => void;
  onRestart: () => void;
}

const SummaryPhase: React.FC<SummaryPhaseProps> = ({
  identity,
  totalQuestions,
  correctCount,
  incorrectCount,
  onBack,
  onRestart,
}) => {
  const isPlayful = identity.ui.mood === 'playful';
  const successRate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const getMessage = () => {
    if (successRate >= 80) return isPlayful ? '🎉 Incroyable !' : '✓ Excellent';
    if (successRate >= 60) return isPlayful ? '👍 Bien joué !' : '✓ Bon travail';
    if (successRate >= 40) return isPlayful ? '💪 Continue !' : 'Continue';
    return isPlayful ? '📖 Révise encore !' : 'Révise plus';
  };

  return (
    <View style={{ flex: 1, backgroundColor: identity.palette.background }}>
      <ExerciseLayout
        headerProps={{
          variant: 'exercise',
          onBack,
          rightIcon: '🎯',
          exerciseTitle: 'Résumé',
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: tokens.spacing.xl,
            gap: tokens.spacing.xl,
            alignItems: 'center',
          }}
        >
          <Animated.View entering={FadeInDown.delay(0).springify()}>
            <Text
              style={{
                fontSize: tokens.fontSize.xxxl,
                fontWeight: tokens.fontWeight.black,
                color: identity.palette.primary,
                textAlign: 'center',
              }}
            >
              {successRate}%
            </Text>
            <Text
              style={{
                fontSize: tokens.fontSize.xl,
                fontWeight: tokens.fontWeight.bold,
                color: identity.text.primary,
                textAlign: 'center',
                marginTop: tokens.spacing.sm,
              }}
            >
              {getMessage()}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={{
              width: '100%',
              backgroundColor: identity.palette.surface,
              borderRadius: tokens.borderRadius.lg,
              padding: tokens.spacing.xl,
              gap: tokens.spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: tokens.fontSize.base, color: identity.text.secondary }}>
                Mots révisés
              </Text>
              <Text
                style={{
                  fontSize: tokens.fontSize.base,
                  fontWeight: tokens.fontWeight.bold,
                  color: identity.text.primary,
                }}
              >
                {totalQuestions}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: tokens.fontSize.base, color: identity.text.secondary }}>
                ✅ Réussis
              </Text>
              <Text
                style={{
                  fontSize: tokens.fontSize.base,
                  fontWeight: tokens.fontWeight.bold,
                  color: identity.palette.primary,
                }}
              >
                {correctCount}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: tokens.fontSize.base, color: identity.text.secondary }}>
                ❌ Échecs
              </Text>
              <Text
                style={{
                  fontSize: tokens.fontSize.base,
                  fontWeight: tokens.fontWeight.bold,
                  color: identity.palette.accent,
                }}
              >
                {incorrectCount}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={{ width: '100%', gap: tokens.spacing.md }}
          >
            <FlowCard
              variant="horizontal"
              icon="refresh"
              title="Refaire"
              subtitle=""
              color={identity.palette.primary}
              onPress={onRestart}
            />
            <FlowCard
              variant="horizontal"
              icon="home"
              title="Dashboard"
              subtitle=""
              color={identity.palette.accent}
              onPress={onBack}
            />
          </Animated.View>
        </ScrollView>
      </ExerciseLayout>
    </View>
  );
};

export default SummaryPhase;
