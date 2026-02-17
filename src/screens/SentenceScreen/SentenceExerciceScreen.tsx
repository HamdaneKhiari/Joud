/**
 * ============================================
 * FICHIER: src/screens/exercises/Sentences/SentenceExerciseScreen.tsx
 * Moteur de Traduction Active avec Auto-Correction Bienveillante
 * ✅ 100% White Label & TypeScript Compliant
 * ============================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';

// Moteurs & Hooks
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseContent, SentenceData } from '@/hooks/exercises/useExerciseContent';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useProgress } from '@/contexts/ProgressContext';
import useFirstIncompleteIndex from '@/hooks/exercises/useFirstIncompleteIndex';
import useSafeNavigation from '@/hooks/useSafeNavigation';

// UI Components
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import SentenceCard from '../../components/pedagogy/Sentence/SentenceCard';
import SentenceBlanksCard from '../../components/pedagogy/Sentence/SentenceBlanksCard';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { ValidationState, FeedbackData } from '@/components/common/ExerciseValidation/types';

const EXERCISE_TYPE = 'phrase_types';

const SentenceExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const route = useRoute();
  
  // 1. Navigation sécurisée (Utilise le goBack par défaut du hook)
  const safeGoBack = useSafeNavigation();
  
  // Paramètres de route
  const params            = route.params as { familyId: string | number; subfamilyId?: string | number; levelId?: string | number };
  const familyIdNum       = Number(params.familyId    || '1');
  const dashboardLevelId  = Number(params.levelId     || '1');
  const subfamilyId       = Number(params.subfamilyId || '1');
  const compositeFamilyId = `${params.familyId}-${subfamilyId}`;

  // 2. Chargement du contenu
  const { module, family, contentItems, isLoading } = useExerciseContent<SentenceData>(familyIdNum, subfamilyId);

  // 2b. Progression
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();

  // 3. États de l'exercice
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [userDraft, setUserDraft] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // Pour mode blanks
  const [validationState, setValidationState] = useState<ValidationState>('initial');
  const [customFeedback, setCustomFeedback] = useState<FeedbackData | null>(null);

  // 3b. Reprise à l'index non complété
  const getInitialIndex = useFirstIncompleteIndex(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId, contentItems.length);
  useEffect(() => {
    if (contentItems.length > 0) {
      setCurrentIndex(getInitialIndex());
    }
  }, [contentItems.length, getInitialIndex]);

  const currentItem = contentItems[currentIndex];
  // Détection du mode selon l'audience :
  // Primary + College → blanks (guidé avec options)
  // Lycée + Adult → free (traduction libre, effort personnel)
  const isBlanksAudience = identity.id === 'primary' || identity.id === 'college';
  const hasBlanksData = currentItem?.data?.sentence && currentItem?.data?.options;
  const mode = (isBlanksAudience && hasBlanksData) ? 'blanks' : 'free';
  
  // Correction erreur Module.color : on utilise l'identité branding main
  const moduleColor  = identity.palette.primary;
  const realProgress = getFamilyProgress(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId);

  // 4. Suivi de l'activité
  useExerciseActivity({
    moduleSlug: EXERCISE_TYPE,
    familyId: compositeFamilyId,
    levelId: dashboardLevelId,
    familyName: family?.name || '',
    icon: module?.icon || 'message-text',
    currentIndex,
    totalItems: contentItems.length,
    enabled: !isLoading && !!currentItem
  });

  // 5. Sauvegarde auto (Appel sans arguments selon ton hook)
  useExerciseSaveOnUnmount();

  // 6. Enregistrement des erreurs pour le Coach IA
  const { recordError } = useRecordError();

  // --- LOGIQUE DE VALIDATION ---

  const handleValidate = () => {
    setIsRevealed(true);

    if (mode === 'blanks') {
      // Mode BLANKS : Vérification de l'option sélectionnée
      const isCorrect = selectedOption === (currentItem.data.correctAnswer || currentItem.data.correct_answer);
      setValidationState(isCorrect ? 'correct' : 'incorrect');
      setCustomFeedback(
        isCorrect
          ? { title: "BRAVO !", message: "C'est la bonne réponse !" }
          : { title: "PAS TOUT À FAIT", message: "Regarde bien la bonne réponse." }
      );

      // ✅ Enregistrer l'erreur → Coach IA
      if (!isCorrect) {
        recordError({
          familyId:      String(familyIdNum),
          moduleSlug:    EXERCISE_TYPE,
          question:      currentItem.data.sentence || '',
          userAnswer:    selectedOption || '',
          correctAnswer: currentItem.data.correctAnswer || currentItem.data.correct_answer || '',
          level:         dashboardLevelId,
        });
      }
    } else {
      // Mode FREE : Vérification de la saisie libre
      // Reconstituer phrase_en si absente (fallback depuis sentence + correct_answer)
      const phraseEn = currentItem.data.phrase_en
        || (currentItem.data.sentence && currentItem.data.correct_answer
          ? currentItem.data.sentence.replace('___', currentItem.data.correct_answer)
          : '');
      const cleanUser = userDraft.trim().toLowerCase().replace(/[.,!?;]/g, "");
      const cleanTarget = phraseEn.trim().toLowerCase().replace(/[.,!?;]/g, "");

      if (cleanUser === cleanTarget) {
        setValidationState('correct');
        setCustomFeedback({
          title: "EXACT !",
          message: "Ta traduction est parfaitement fidèle à la structure."
        });
      } else {
        setValidationState('incorrect');
        setCustomFeedback({
          title: "OBSERVE LA NUANCE",
          message: "Ton sens est peut-être bon, mais compare bien avec la structure attendue."
        });

        // ✅ Enregistrer l'erreur (phrase tapée vs correcte) → Coach IA analyse structure/vocab
        recordError({
          familyId:      String(familyIdNum),
          moduleSlug:    EXERCISE_TYPE,
          question:      currentItem.data.phrase_fr || currentItem.data.sentence || '',
          userAnswer:    userDraft.trim(),
          correctAnswer: phraseEn,
          level:         dashboardLevelId,
        });
      }
    }
  };

  const handleNext = useCallback(() => {
    trackItemCompletion(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId, currentIndex, contentItems.length);
    if (currentIndex < contentItems.length - 1) {
      setIsRevealed(false);
      setUserDraft('');
      setSelectedOption(null); // Reset pour mode blanks
      setValidationState('initial');
      setCustomFeedback(null);
      setCurrentIndex(prev => prev + 1);
    } else {
      saveProgressNow().then(() => safeGoBack.navigate());
    }
  }, [currentIndex, contentItems.length, safeGoBack, trackItemCompletion, dashboardLevelId, compositeFamilyId, saveProgressNow]);

  const handleRetry = () => {
    setIsRevealed(false);
    setValidationState('initial');
    setCustomFeedback(null);
    // On ne reset pas userDraft ni selectedOption pour permettre la correction
  };

  if (isLoading || !currentItem || !family) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={identity.palette.primary} />
      </View>
    );
  }

  return (
    <ExerciseLayout
      headerProps={{
        variant: "exercise",
        onBack: safeGoBack.navigate, // Branchement direct sur le hook
        rightIcon: <DynamicIcon name={module?.icon} size={28} color={identity.header.accent} fallback="message-text" />,
        showLevelBadge: true,
        levelTitle: `Niveau ${dashboardLevelId}`,
        exerciseTitle: family.name,
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `${realProgress}% • Phrase ${currentIndex + 1}/${contentItems.length}`,
      }}
      footer={
        <ExerciseValidation
          state={validationState}
          onValidate={handleValidate}
          onNext={handleNext}
          onRetry={handleRetry}
          feedbackMessage={customFeedback || undefined}
          showFeedback={isRevealed}
          isLastQuestion={currentIndex === contentItems.length - 1}
          disabled={
            mode === 'blanks'
              ? !selectedOption || safeGoBack.disabled
              : userDraft.trim().length < 2 || safeGoBack.disabled
          }
        />
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {mode === 'blanks' ? (
          <SentenceBlanksCard
            data={currentItem.data}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            isValidated={isRevealed}
            isCorrect={validationState === 'correct'}
            moduleColor={moduleColor}
          />
        ) : (
          <SentenceCard
            data={currentItem.data}
            isRevealed={isRevealed}
            userDraft={userDraft}
            setUserDraft={setUserDraft}
            moduleColor={moduleColor}
          />
        )}
      </KeyboardAvoidingView>
    </ExerciseLayout>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default SentenceExerciseScreen;