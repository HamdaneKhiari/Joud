/**
 * ============================================
 * GRAMMAR EXERCISE SCREEN (TSX Premium Edition)
 * Version TypeScript avec types propres et White Labeling
 * ============================================
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

// Composants
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import GrammarCard from '@/components/pedagogy/grammar/GrammarCard';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import CompletionModal from '@/components/common/CompletionModal';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Helpers & Hooks
import { useProgress } from '@/contexts/ProgressContext';
import { useUser } from '@/contexts/UserContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useTheme } from '@/themes/ThemeContext';
import { log } from '@/utils/logUtils';

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
  const { familyId, moduleId, levelId = 1, subfamilyId: rawSubfamilyId } = route.params || {};
  const safeFamilyId = familyId || '';
  const safeModuleId = moduleId || '';
  const numLevelId = Number.parseInt(String(levelId), 10);
  const subfamilyId = Number(rawSubfamilyId || '0');
  const compositeFamilyId = subfamilyId > 0 ? `${safeFamilyId}-${subfamilyId}` : String(safeFamilyId);

  // =================== HOOKS ===================
  const { identity } = useTheme();
  const { db } = useUser();
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();
  const { recordError } = useRecordError();

  // ✅ Plus besoin de gradientColors - ExerciseLayout gère le gradient automatiquement

  const safeGoBack = useSafeNavigation(useCallback(() => { navigation.goBack(); }, [navigation]));

  // =================== DATA LOADING (SQLITE) ===================
  const [grammarFamily, setGrammarFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!db || typeof db === 'number' || !safeFamilyId) return;
      try {
        setLoading(true);
        // 1. Récupérer les infos de la famille
        const family = await db.getFirstAsync<{ name: string; icon: string }>(
          'SELECT name, icon FROM families WHERE id = ?',
          [safeFamilyId]
        );

        // 2. Récupérer le contenu (règles/exercices) filtré par sous-famille
        const contentRows = await db.getAllAsync<{ data: string; id: number }>(
          'SELECT id, data FROM content WHERE family_id = ? AND subfamily_id = ?',
          [safeFamilyId, subfamilyId]
        );

        // 3. Parser le JSON
        // Format: { rule_title, explanation, simplified, examples, exercises: [{ question, options, correct_answer }] }
        const rules = contentRows.map(row => {
          const data = JSON.parse(row.data);
          const firstExercise = data.exercises?.[0];
          return {
            id: row.id,
            title: data.rule_title || '',
            content: data.explanation || data.rule_title || data.rule || '',
            simplified: data.simplified || '',
            examples: data.examples || [],
            exercise: {
              question: firstExercise?.question || data.sentence || '',
              correctAnswer: firstExercise?.correct_answer || firstExercise?.correctAnswer || data.correctAnswer || '',
              options: firstExercise?.options || data.options || []
            }
          };
        });

        setGrammarFamily({ title: family?.name, icon: family?.icon, rules });
      } catch (e) {
        log.error('[GrammarExerciseScreen] Load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [db, safeFamilyId, subfamilyId]);

  // =================== STATE ===================
  const [showCompletion, setShowCompletion] = useState(false);
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

    setExerciseState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: newAttemptCount,
    }));

    // Marquer comme complété si correct ou si dernier essai
    if (isCorrect || newAttemptCount >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, EXERCISE_TYPE, compositeFamilyId, currentRuleIndex, totalRules);
    }

    // ✅ Enregistrer l'erreur si dernière tentative échouée → Coach IA
    if (!isCorrect && newAttemptCount >= MAX_ATTEMPTS && currentRule) {
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

  // =================== RENDER ===================
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: identity.palette.surface }}>
        <ActivityIndicator size="large" color={identity.palette.primary} />
        <Text style={{ marginTop: 10, color: identity.text.secondary }}>Chargement de la leçon...</Text>
      </View>
    );
  }

  if (!grammarFamily || !currentRule) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: identity.palette.background }}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>📭</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: identity.text.primary, textAlign: 'center', marginBottom: 8 }}>
          Aucune règle disponible
        </Text>
        <Text style={{ fontSize: 14, color: identity.text.secondary, textAlign: 'center', marginBottom: 24 }}>
          Ce niveau ne contient pas encore de contenu grammatical.
        </Text>
        <TouchableOpacity
          onPress={safeGoBack.navigate}
          style={{ backgroundColor: identity.palette.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: identity.text.onPrimary, fontWeight: '700' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calcul de l'état de validation pour SonarLint (logique extraite pour lisibilité)
  let validationStatus: 'initial' | 'correct' | 'skip' | 'incorrect';
  if (!exerciseState.isValidated) {
    validationStatus = 'initial';
  } else if (exerciseState.isCorrect) {
    validationStatus = 'correct';
  } else if (exerciseState.attemptCount >= MAX_ATTEMPTS) {
    validationStatus = 'skip';
  } else {
    validationStatus = 'incorrect';
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
        rightIcon: <DynamicIcon name={grammarFamily.icon} size={28} color={identity.header.accent} fallback="book-open-variant" />,
        showLevelBadge: true,
        levelTitle: `Niveau ${numLevelId}`,
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

export default GrammarExerciseScreen;
