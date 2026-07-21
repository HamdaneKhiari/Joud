import React, { useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Moteurs & Hooks
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseContent, SentenceData } from '@/hooks/exercises/useExerciseContent';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useProgress } from '@/contexts/ProgressContext';
import useResumeIndex from '@/hooks/exercises/useResumeIndex';
import useExerciseCompletion from '@/hooks/exercises/useExerciseCompletion';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { useLevelLabel } from '@/utils/labelMapper';
import { makeCompositeFamilyId } from '@/contexts/progressUtils';

// UI Components
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import CompletionModal from '@/components/common/CompletionModal';
import ExerciseLoadingState from '@/components/common/ExerciseLoadingState';
import ExerciseEmptyState from '@/components/common/ExerciseEmptyState';
import SentenceCard from '../../components/pedagogy/Sentence/SentenceCard';
import SentenceBlanksCard from '../../components/pedagogy/Sentence/SentenceBlanksCard';
import SentenceTilesCard from '../../components/pedagogy/Sentence/SentenceTilesCard';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { ValidationState, FeedbackData } from '@/components/common/ExerciseValidation/types';

// Mode dispatch & helpers
import { getPhraseModeForAudience } from '@/config/phraseModesConfig';
import { getExpectedPhraseEn, cleanPhrase, tokenizePhraseForTiles, TileToken } from '@/utils/phraseUtils';

const EXERCISE_TYPE = 'phrase_types';
const MAX_ATTEMPTS = 2;

interface SentenceExerciseParams {
  familyId: string;
  subfamilyId?: string;
  levelId?: string;
}

const SentenceExerciseScreen: React.FC = () => {
  const { identity } = useTheme();

  // 1. Navigation sécurisée (Utilise le goBack par défaut du hook)
  const safeGoBack = useSafeNavigation();

  // Paramètres de route
  const params             = useLocalSearchParams() as unknown as SentenceExerciseParams;
  const familyIdNum        = Number(params.familyId    || '1');
  const dashboardLevelId   = Number(params.levelId     || '1');
  const levelLabel         = useLevelLabel(dashboardLevelId);
  const subfamilyId        = Number(params.subfamilyId || '1');
  const compositeFamilyId  = makeCompositeFamilyId(params.familyId, subfamilyId);

  // 2. Chargement du contenu
  const { module, family, contentItems, isLoading } = useExerciseContent<SentenceData>(familyIdNum, subfamilyId);

  // 2b. Progression
  const { trackItemCompletion, getFamilyProgress } = useProgress();

  // 3. États de l'exercice
  const [currentIndex, setCurrentIndex] = useResumeIndex(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId, contentItems.length);
  const { showCompletion, complete } = useExerciseCompletion();
  const [isRevealed, setIsRevealed] = useState(false);
  const [userDraft, setUserDraft] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // Pour mode blanks
  const [placedTiles, setPlacedTiles] = useState<TileToken[]>([]); // Pour mode tiles
  const [validationState, setValidationState] = useState<ValidationState>('initial');
  const [customFeedback, setCustomFeedback] = useState<FeedbackData | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const currentItem = contentItems[currentIndex];
  // Détection du mode selon l'audience (config PHRASE_MODE_BY_AUDIENCE) :
  // primary → blanks (QCM à trou) | college → tiles (reconstruction) | lycee/adult → free (saisie libre)
  // Garde-fous data : si le mode demandé n'a pas les données nécessaires, on retombe sur un mode disponible.
  const requestedMode = getPhraseModeForAudience(identity.id);
  const hasBlanksData = !!(currentItem?.data?.sentence && currentItem?.data?.options);
  const phraseEnForMode = currentItem ? getExpectedPhraseEn(currentItem.data) : '';
  const tilesTotalCount = tokenizePhraseForTiles(phraseEnForMode).tokens.length;
  const hasTilesData = tilesTotalCount >= 2;

  let mode: 'blanks' | 'tiles' | 'free';
  if (requestedMode === 'blanks') {
    mode = hasBlanksData ? 'blanks' : 'free';
  } else if (requestedMode === 'tiles') {
    mode = hasTilesData ? 'tiles' : (hasBlanksData ? 'blanks' : 'free');
  } else {
    mode = 'free';
  }

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
    const isFinalAttempt = attemptCount + 1 >= MAX_ATTEMPTS;

    // Applique le résultat de la validation, commun aux 3 modes : état, feedback,
    // incrémentation des tentatives, et remontée au Coach IA seulement à la tentative finale ratée.
    const applyResult = (
      isCorrect: boolean,
      correctFeedback: FeedbackData,
      incorrectFeedback: FeedbackData,
      finalFeedback: FeedbackData,
      question: string,
      userAnswer: string,
      correctAnswer: string,
    ) => {
      setValidationState(isCorrect ? 'correct' : (isFinalAttempt ? 'skip' : 'incorrect'));
      setCustomFeedback(isCorrect ? correctFeedback : (isFinalAttempt ? finalFeedback : incorrectFeedback));
      setAttemptCount(prev => prev + 1);

      if (!isCorrect && isFinalAttempt) {
        recordError({
          familyId: String(familyIdNum),
          moduleSlug: EXERCISE_TYPE,
          question,
          userAnswer,
          correctAnswer,
          level: dashboardLevelId,
        });
      }
    };

    if (mode === 'blanks') {
      const correctAnswer = currentItem.data.correctAnswer || currentItem.data.correct_answer || '';
      const isCorrect = selectedOption === correctAnswer;
      applyResult(
        isCorrect,
        { title: "BRAVO !", message: "C'est la bonne réponse !" },
        { title: "PAS TOUT À FAIT", message: "Regarde bien la bonne réponse." },
        { title: "PAS TOUT À FAIT", message: "Voici la bonne réponse, on continue." },
        currentItem.data.sentence || '',
        selectedOption || '',
        correctAnswer,
      );
    } else if (mode === 'tiles') {
      const phraseEn = getExpectedPhraseEn(currentItem.data);
      const userPhrase = placedTiles.map((t) => t.text).join(' ');
      const isCorrect = cleanPhrase(userPhrase) === cleanPhrase(phraseEn);
      applyResult(
        isCorrect,
        { title: "EXACT !", message: "Ta reconstruction est parfaitement fidèle à la structure." },
        { title: "OBSERVE LA NUANCE", message: "Regarde bien l'ordre des mots dans la structure attendue." },
        { title: "OBSERVE LA NUANCE", message: "Voici la structure attendue, on continue." },
        currentItem.data.phrase_fr || currentItem.data.translation || currentItem.data.sentence || '',
        userPhrase,
        phraseEn,
      );
    } else {
      const phraseEn = getExpectedPhraseEn(currentItem.data);
      const isCorrect = cleanPhrase(userDraft) === cleanPhrase(phraseEn);
      applyResult(
        isCorrect,
        { title: "EXACT !", message: "Ta traduction est parfaitement fidèle à la structure." },
        { title: "OBSERVE LA NUANCE", message: "Ton sens est peut-être bon, mais compare bien avec la structure attendue." },
        { title: "OBSERVE LA NUANCE", message: "Voici la traduction attendue, on continue." },
        currentItem.data.phrase_fr || currentItem.data.sentence || '',
        userDraft.trim(),
        phraseEn,
      );
    }
  };

  const handleNext = useCallback(() => {
    trackItemCompletion(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId, currentIndex, contentItems.length);
    if (currentIndex < contentItems.length - 1) {
      setIsRevealed(false);
      setUserDraft('');
      setSelectedOption(null); // Reset pour mode blanks
      setPlacedTiles([]); // Reset pour mode tiles
      setValidationState('initial');
      setCustomFeedback(null);
      setAttemptCount(0);
      setCurrentIndex(prev => prev + 1);
    } else {
      complete();
    }
  }, [currentIndex, contentItems.length, trackItemCompletion, dashboardLevelId, compositeFamilyId, complete, setCurrentIndex]);

  const handleRetry = () => {
    setIsRevealed(false);
    setValidationState('initial');
    setCustomFeedback(null);
    // On ne reset pas userDraft ni selectedOption pour permettre la correction
  };

  if (isLoading) {
    return <ExerciseLoadingState onBack={() => { safeGoBack.navigate(); }} />;
  }

  if (!currentItem || !family) {
    return (
      <ExerciseEmptyState
        onBack={() => { safeGoBack.navigate(); }}
        headerTitle={family?.name || "Phrases"}
      />
    );
  }

  return (
    <>
      <CompletionModal
        visible={showCompletion}
        title="Series complete!"
        subtitle="Excellent work! You've completed all the sentences."
        onDone={() => safeGoBack.navigate()}
      />
      <ExerciseLayout
        headerProps={{
          variant: "exercise",
          onBack: () => { safeGoBack.navigate(); },
        rightIcon: <DynamicIcon name={module?.icon} size={28} color={identity.header.accent} fallback="message-text" />,
        showLevelBadge: true,
        levelTitle: levelLabel.badge,
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
          onSkip={handleNext}
          attemptCount={attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          feedbackMessage={customFeedback || undefined}
          showFeedback={isRevealed}
          isLastQuestion={currentIndex === contentItems.length - 1}
          disabled={
            mode === 'blanks'
              ? !selectedOption || safeGoBack.disabled
              : mode === 'tiles'
                ? placedTiles.length < tilesTotalCount || safeGoBack.disabled
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
        ) : mode === 'tiles' ? (
          <SentenceTilesCard
            data={currentItem.data}
            placedTokens={placedTiles}
            onTokensChange={setPlacedTiles}
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
    </>
  );
};

export default SentenceExerciseScreen;