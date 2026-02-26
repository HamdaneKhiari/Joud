/**
 * GRAMMAR EXERCISE SCREEN
 * TypeScript avec white labeling — SQL chargé via useGrammarContent
 */

import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

// Composants
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import GrammarCard from '@/components/pedagogy/grammar/GrammarCard';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import CompletionModal from '@/components/common/CompletionModal';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Hooks & Contexts
import { useProgress } from '@/contexts/ProgressContext';
import { useUser } from '@/contexts/UserContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useTheme } from '@/themes/ThemeContext';
import { useLevelLabel } from '@/utils/labelMapper';
import { useGrammarContent } from './hooks/useGrammarContent';

// Types
import type { GrammarScreenRouteParams, ExerciseState } from './types';

const EXERCISE_TYPE = 'grammar';
const MAX_ATTEMPTS = 2;

type RootStackParamList = {
  GrammarExercise: GrammarScreenRouteParams;
  [key: string]: any;
};

interface GrammarExerciseScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'GrammarExercise'>;
  route: { params?: GrammarScreenRouteParams };
}

const GrammarExerciseScreen: React.FC<GrammarExerciseScreenProps> = ({ navigation, route }) => {
  // =================== PARAMS ===================
  const { familyId, moduleId, levelId = 1, subfamilyId: rawSubfamilyId } = route.params || {};
  const safeFamilyId = familyId || '';
  const safeModuleId = moduleId || '';
  const numLevelId = Number.parseInt(String(levelId), 10);
  const levelLabel = useLevelLabel(numLevelId);
  const subfamilyId = Number(rawSubfamilyId || '0');
  const compositeFamilyId = subfamilyId > 0 ? `${safeFamilyId}-${subfamilyId}` : String(safeFamilyId);

  // =================== HOOKS ===================
  const { identity } = useTheme();
  const { db } = useUser();
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();
  const { recordError } = useRecordError();
  const safeGoBack = useSafeNavigation(useCallback(() => { navigation.goBack(); }, [navigation]));

  // =================== CHARGEMENT ===================
  const { grammarFamily, loading } = useGrammarContent(db, safeFamilyId, subfamilyId);

  // =================== STATE ===================
  const [showCompletion, setShowCompletion] = useState(false);
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    selectedOption: null,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // =================== LOGIQUE MÉTIER ===================
  const rules = grammarFamily?.rules || [];
  const totalRules = rules.length;
  const currentRule = rules[currentRuleIndex];
  const isLastRule = currentRuleIndex === totalRules - 1;
  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, compositeFamilyId);

  // =================== HOOKS UTILITAIRES ===================
  useExerciseActivity({
    levelId: numLevelId,
    familyId: compositeFamilyId,
    moduleSlug: safeModuleId,
    familyName: grammarFamily?.title || 'Grammaire',
    icon: grammarFamily?.icon || 'book',
    currentIndex: currentRuleIndex,
    totalItems: totalRules,
    enabled: !!(grammarFamily && currentRule),
  });

  useExerciseSaveOnUnmount();

  // =================== HANDLERS ===================
  const handleAnswer = (option: string) => {
    if (exerciseState.isValidated) return;
    setExerciseState(prev => ({ ...prev, selectedOption: option }));
  };

  const handleValidate = () => {
    if (!exerciseState.selectedOption || !currentRule) return;
    const normalize = (s: string) => s.toLowerCase().trim();
    const isCorrect = normalize(exerciseState.selectedOption) === normalize(currentRule.exercise.correctAnswer);
    const newAttemptCount = exerciseState.attemptCount + 1;

    setExerciseState(prev => ({ ...prev, isValidated: true, isCorrect, attemptCount: newAttemptCount }));

    if (isCorrect || newAttemptCount >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, EXERCISE_TYPE, compositeFamilyId, currentRuleIndex, totalRules);
    }
    if (!isCorrect && newAttemptCount >= MAX_ATTEMPTS) {
      recordError({
        familyId: safeFamilyId,
        moduleSlug: EXERCISE_TYPE,
        question: currentRule.exercise.question || '',
        userAnswer: exerciseState.selectedOption || '',
        correctAnswer: currentRule.exercise.correctAnswer || '',
        level: numLevelId,
      });
    }
  };

  const handleNext = () => {
    if (isLastRule) {
      saveProgressNow().then(() => setShowCompletion(true));
    } else {
      setCurrentRuleIndex(prev => prev + 1);
      setExerciseState({ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 });
    }
  };

  const handleRetry = () => {
    setExerciseState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  };

  // =================== VALIDATION STATE ===================
  let validationStatus: 'initial' | 'correct' | 'skip' | 'incorrect';
  if (!exerciseState.isValidated) validationStatus = 'initial';
  else if (exerciseState.isCorrect) validationStatus = 'correct';
  else if (exerciseState.attemptCount >= MAX_ATTEMPTS) validationStatus = 'skip';
  else validationStatus = 'incorrect';

  // =================== RENDER ===================
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: identity.palette.surface }]}>
        <ActivityIndicator size="large" color={identity.palette.primary} />
        <Text style={[styles.loadingText, { color: identity.text.secondary }]}>Chargement de la leçon...</Text>
      </View>
    );
  }

  if (!grammarFamily || !currentRule) {
    return (
      <View style={[styles.centered, styles.emptyPadding, { backgroundColor: identity.palette.background }]}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={[styles.emptyTitle, { color: identity.text.primary }]}>Aucune règle disponible</Text>
        <Text style={[styles.emptyText, { color: identity.text.secondary }]}>
          Ce niveau ne contient pas encore de contenu grammatical.
        </Text>
        <TouchableOpacity
          onPress={safeGoBack.navigate}
          style={[styles.backButton, { backgroundColor: identity.palette.primary }]}
        >
          <Text style={[styles.backButtonText, { color: identity.text.onPrimary }]}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <CompletionModal
        visible={showCompletion}
        title="Lesson complete!"
        subtitle="You've mastered all the grammar rules in this series."
        onDone={() => safeGoBack.navigate()}
      />
      <ExerciseLayout
        headerProps={{
          variant: 'exercise',
          onBack: () => { safeGoBack.navigate(); },
          rightIcon: <DynamicIcon name={grammarFamily.icon ?? 'book-open-variant'} size={28} color={identity.header.accent} fallback="book-open-variant" />,
          showLevelBadge: true,
          levelTitle: levelLabel.badge,
          exerciseTitle: grammarFamily.title || 'Grammaire',
        }}
        progressProps={{
          progressPercent: realProgress,
          progressText: `${realProgress}% • Règle ${currentRuleIndex + 1}/${totalRules}`,
        }}
        footer={
          <ExerciseValidation
            state={validationStatus}
            attemptCount={exerciseState.attemptCount}
            maxAttempts={MAX_ATTEMPTS}
            correctAnswer={currentRule.exercise.correctAnswer}
            onValidate={handleValidate}
            onNext={handleNext}
            onRetry={handleRetry}
            onSkip={handleNext}
            disabled={!(exerciseState.isValidated || exerciseState.selectedOption)}
            isLastQuestion={isLastRule}
          />
        }
      >
        <GrammarCard
          lessonData={{
            title: currentRule.title,
            rule: currentRule.content,
            simplified: currentRule.simplified,
            examples: currentRule.examples,
            exercise: currentRule.exercise,
          }}
          exerciseState={exerciseState}
          onAnswer={handleAnswer}
        />
      </ExerciseLayout>
    </>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  emptyPadding: {
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontWeight: '700',
  },
});

export default GrammarExerciseScreen;
