// ============================================
// FICHIER: src/screens/VocabularyExerciseScreen/index.js
// ✅ VERSION FINALE : Avec Sauvegarde d'Activité pour le Dashboard
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Composants
import ExerciseLayout from '../../../components/layout/ExerciseLayout';
import WordCard from '../../../components/pedagogy/vocabulary/WordCard';
import NavigationButtons from '../../../components/exercise-common/NavigationButtons';

// Helpers & Hooks
import { getFamilyById } from '../../../data';
import { getLevelData, getExerciseData } from '../../../utils/constants';
import { getLevelColor, getLevelGradient } from '@themes/colors';
import { useProgress } from '../../../contexts/ProgressContext';
import useExerciseBackground from '../../../hooks/useExerciseBackground';
import useSafeNavigation from '../../../hooks/useSafeNavigation';
import { useFirstIncompleteIndex } from '../../../hooks/exercises/useFirstIncompleteIndex';
import { useExerciseActivity } from '../../../hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '../../../hooks/exercises/useExerciseSaveOnUnmount';

const EXERCISE_TYPE = 'vocab';

const VocabularyExerciseScreen = ({ navigation, route }) => {
  // =================== PARAMS ===================
  const { familyId, levelId = 1 } = route.params || {};
  const numLevelId = Number.parseInt(levelId, 10);

  // =================== HOOKS & DATA ===================
  const { trackItemCompletion, getFamilyProgress } = useProgress();

  const currentLevelData = useMemo(() => getLevelData(numLevelId), [numLevelId]);
  const currentLevelColor = useMemo(() => getLevelColor(numLevelId), [numLevelId]);
  const currentLevelGradient = useMemo(() => getLevelGradient(numLevelId), [numLevelId]);
  const moduleData = useMemo(() => getExerciseData(EXERCISE_TYPE), []);

  const vocabFamily = useMemo(() =>
    getFamilyById(EXERCISE_TYPE, numLevelId, familyId),
    [numLevelId, familyId]
  );

  const { gradientColors, accentColor } = useExerciseBackground(EXERCISE_TYPE, currentLevelColor);

  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation.goBack(), [navigation])
  );

  // =================== PROGRESSION LOGIC ===================
  const totalWords = vocabFamily?.words?.length || 0;
  const getFirstIncompleteIndex = useFirstIncompleteIndex(
    numLevelId,
    EXERCISE_TYPE,
    familyId,
    totalWords
  );

  // =================== STATE ===================
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDataValid, setIsDataValid] = useState(false);

  useEffect(() => {
    setCurrentWordIndex(getFirstIncompleteIndex());
  }, [getFirstIncompleteIndex]);

  const currentWord = vocabFamily?.words?.[currentWordIndex] || null;
  const isLastWord = currentWordIndex === totalWords - 1;
  const isFirstWord = currentWordIndex === 0;
  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, familyId);

  // =================== ⚡ HOOKS UTILITAIRES ===================
  // Sauvegarde activité pour le Dashboard
  useExerciseActivity({
    type: 'vocab',
    levelId: numLevelId,
    familyId,
    familyName: vocabFamily?.name || vocabFamily?.title || 'Vocabulaire',
    icon: vocabFamily?.icon || '📚',
    currentIndex: currentWordIndex,
    totalItems: totalWords,
    enabled: isDataValid && !!(vocabFamily && currentWord),
  });

  // Sauvegarde progression au démontage
  useExerciseSaveOnUnmount();

  // =================== VALIDATION ===================
  useEffect(() => {
    if (!vocabFamily?.words?.length) {
      setIsDataValid(false);
      const timer = setTimeout(() => safeGoBack.navigate(), 500);
      return () => clearTimeout(timer);
    }
    setIsDataValid(true);
  }, [vocabFamily, safeGoBack]);

  if (!isDataValid || !vocabFamily || !currentWord) return null;

  // =================== HANDLERS ===================
  const handleNext = () => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentWordIndex, totalWords);
    if (!isLastWord) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handleFinish = async () => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentWordIndex, totalWords);
    await saveProgressNow();
    safeGoBack.navigate();
  };

  return (
    <ExerciseLayout
      gradientColors={gradientColors}
      headerProps={{
        variant: "exercise",
        onBack: safeGoBack.navigate,
        rightIcon: moduleData?.icon || '📚',
        showLevelBadge: true,
        levelTitle: currentLevelData?.badge,
        levelColor: currentLevelColor,
        exerciseTitle: vocabFamily.name || vocabFamily.title,
        gradientColors: currentLevelGradient,
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `${realProgress}% • Mot ${currentWordIndex + 1}/${totalWords}`,
      }}
      footer={
        <NavigationButtons
          isFirst={isFirstWord}
          isLast={isLastWord}
          onPrevious={() => currentWordIndex > 0 && setCurrentWordIndex(prev => prev - 1)}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      }
    >
      <WordCard
        key={currentWordIndex}
        englishWord={currentWord.english}
        frenchWord={currentWord.french}
        emoji={currentWord.image || currentWord.emoji}
        exampleSentence={currentWord.exampleSentence}
        exampleTranslation={currentWord.exampleTranslation}
        highlightWord={currentWord.english}
        color={vocabFamily.color || accentColor}
        backgroundColor={accentColor}
      />
    </ExerciseLayout>
  );
};

VocabularyExerciseScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default VocabularyExerciseScreen;