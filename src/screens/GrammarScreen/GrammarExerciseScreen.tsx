/**
 * ============================================
 * GRAMMAR EXERCISE SCREEN (TSX Premium Edition)
 * Version TypeScript avec types propres et White Labeling
 * ============================================
 */

import React, { useState, useCallback, useMemo } from 'react';
import { log } from '../../utils/logUtils';
import type { StackNavigationProp } from '@react-navigation/stack';

// Composants
import ExerciseLayout from '../../components/layout/ExerciseLayout';
import GrammarCard from '../../components/pedagogy/grammar/GrammarCard';
import ExerciseValidation from '../../components/common/ExerciseValidation';

// Helpers & Hooks
import { getFamilyById } from '../../data';
import { getLevelData, getExerciseData } from '../../utils/constants';
import { useProgress } from '../../contexts/ProgressContext';
import useExerciseBackground from '../../hooks/useExerciseBackground';
import useSafeNavigation from '../../hooks/useSafeNavigation';
import { useExerciseActivity } from '../../hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '../../hooks/exercises/useExerciseSaveOnUnmount';
import { useErrorTracking } from '../../hooks/useErrorTracking';
import { useTheme } from '@/themes/ThemeContext';

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
  route: {
    params?: GrammarScreenRouteParams;
  };
}

const GrammarExerciseScreen: React.FC<GrammarExerciseScreenProps> = ({ navigation, route }) => {
  // =================== PARAMS & DYNAMISME ===================
  const { familyId, moduleId, levelId = 1 } = route.params || {};
  const numLevelId = Number.parseInt(String(levelId), 10);

  // =================== HOOKS ===================
  const { identity } = useTheme();
  const { trackItemCompletion, getFamilyProgress } = useProgress();
  const { trackErrorAuto } = useErrorTracking();

  const currentLevelData = useMemo(() => getLevelData(numLevelId), [numLevelId]);
  const moduleData = useMemo(() => getExerciseData(EXERCISE_TYPE), []);

  // ✅ WHITE LABEL: Utilise identity au lieu de levelColor legacy
  const { gradientColors } = useExerciseBackground(EXERCISE_TYPE, identity.branding.main);

  const safeGoBack = useSafeNavigation(useCallback(() => navigation.goBack(), [navigation]));

  const grammarFamily = useMemo(
    () => getFamilyById(moduleId, numLevelId, familyId),
    [moduleId, numLevelId, familyId]
  );

  // =================== STATE ===================
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    selectedOption: null,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // Données de la règle actuelle
  const rules = grammarFamily?.rules || [];
  const totalRules = rules.length;
  const currentRule = rules[currentRuleIndex];
  const isLastRule = currentRuleIndex === totalRules - 1;
  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, familyId);

  // =================== HOOKS UTILITAIRES ===================
  useExerciseActivity({
    type: 'grammar',
    levelId: numLevelId,
    familyId,
    moduleId,
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

    const isCorrect = exerciseState.selectedOption === currentRule.exercise.correctAnswer;
    const newAttemptCount = exerciseState.attemptCount + 1;

    setExerciseState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: newAttemptCount,
    }));

    // ✅ TRACKING D'ERREUR POUR MODE VOLTAGE
    if (!isCorrect) {
      trackErrorAuto(EXERCISE_TYPE, {
        question: currentRule.exercise.question || currentRule.content,
        userAnswer: exerciseState.selectedOption,
        correctAnswer: currentRule.exercise.correctAnswer,
        ruleId: currentRule.id || familyId,
      });
    }

    // Marquer comme complété si correct ou si dernier essai
    if (isCorrect || newAttemptCount >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentRuleIndex, totalRules);
    }
  };

  const handleNext = () => {
    if (isLastRule) {
      safeGoBack.navigate();
    } else {
      setCurrentRuleIndex(prev => prev + 1);
      setExerciseState({
        selectedOption: null,
        isValidated: false,
        isCorrect: false,
        attemptCount: 0,
      });
    }
  };

  const handleRetry = () => {
    setExerciseState(prev => ({
      ...prev,
      selectedOption: null,
      isValidated: false,
      isCorrect: false,
    }));
  };

  if (!grammarFamily || !currentRule) return null;

  return (
    <ExerciseLayout
      gradientColors={gradientColors}
      headerProps={{
        variant: 'exercise',
        onBack: safeGoBack.navigate,
        rightIcon: moduleData?.icon || 'book',
        onRightIconPress: () => log.debug('Grammar info pressed'),
        showLevelBadge: true,
        levelTitle: currentLevelData?.badge,
        exerciseTitle: grammarFamily.title || 'Grammaire',
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `${realProgress}% • Règle ${currentRuleIndex + 1}/${totalRules}`,
      }}
      footer={
        <ExerciseValidation
          state={
            !exerciseState.isValidated
              ? 'initial'
              : exerciseState.isCorrect
                ? 'correct'
                : exerciseState.attemptCount >= MAX_ATTEMPTS
                  ? 'skip'
                  : 'incorrect'
          }
          attemptCount={exerciseState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          correctAnswer={currentRule.exercise.correctAnswer}
          onValidate={handleValidate}
          onNext={handleNext}
          onRetry={handleRetry}
          onSkip={handleNext}
          disabled={!exerciseState.isValidated && !exerciseState.selectedOption}
          isLastQuestion={isLastRule}
        />
      }
    >
      <GrammarCard
        lessonData={{
          rule: currentRule.content,
          examples: currentRule.examples,
          exercise: currentRule.exercise,
        }}
        exerciseState={exerciseState}
        onAnswer={handleAnswer}
        onAudioPress={() => log.debug('Audio play requested')}
      />
    </ExerciseLayout>
  );
};

export default GrammarExerciseScreen;
