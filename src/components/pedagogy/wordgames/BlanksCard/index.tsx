/**
 * ============================================
 * BLANKS CARD (White Label)
 * Jeu : Compléter une phrase à trous
 * ============================================
 */

import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

// Composants
import ExerciseValidation from '@/components/common/ExerciseValidation';

// Hooks & Utils
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import { useFeedbackMessages, getFeedbackState } from '@/hooks/exercises/useFeedbackMessages';
import type { FeedbackData } from '@/hooks/exercises/useFeedbackMessages';

// Styles
import { createWordGameStyles } from '../shared/commonWordGameStyles';

// Types
import type { BlanksQuestion } from '@/screens/WordGames/schema';

// ============================================
// TYPES
// ============================================

export interface BlanksCardProps {
  question: BlanksQuestion;
  selectedOption: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  maxAttempts: number;
  onAnswer: (option: string) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

// ============================================
// COMPOSANT
// ============================================

const BlanksCard: React.FC<BlanksCardProps> = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  attemptCount,
  maxAttempts,
  onAnswer,
  onValidate,
  onRetry,
  onNext,
  isLastQuestion,
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createWordGameStyles(identity), [identity]);

  // Hook de validation
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedOption
  );

  // Hook White Label Feedback
  const { getFeedback } = useFeedbackMessages();
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackData | null>(null);

  // Charger le feedback depuis la DB selon l'état
  useEffect(() => {
    const loadFeedback = async () => {
      const feedbackState = getFeedbackState(isValidated, isCorrect, attemptCount, maxAttempts);
      if (feedbackState) {
        const feedback = await getFeedback('wordgames', feedbackState);
        setFeedbackMessage(feedback);
      } else {
        setFeedbackMessage(null);
      }
    };

    loadFeedback();
  }, [isValidated, isCorrect, attemptCount, maxAttempts, getFeedback]);

  // Afficher feedback SEULEMENT si correct OU dernière tentative
  const showFeedback = isValidated && (isCorrect || canSkip);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Card principale */}
      <View style={styles.card}>
        {/* Barre couleur (white label) */}
        <View style={styles.colorBar} />

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>✏️</Text>
          <Text style={styles.titleText}>Complete the sentence</Text>
        </View>

        {/* Phrase avec trou */}
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{question.sentence}</Text>
          {question.hint && (
            <Text style={[styles.contentText, { marginTop: 8, fontStyle: 'italic' }]}>
              💡 {question.hint}
            </Text>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;

            // Style dynamique selon l'état
            const buttonStyle = [
              styles.optionButton,
              showFeedback && isCorrectOption && styles.optionButtonCorrect,
              showFeedback && isSelected && !isCorrect && styles.optionButtonIncorrect,
              !showFeedback && isSelected && styles.optionButtonSelected,
            ];

            const textStyle = [
              styles.optionText,
              (showFeedback && (isCorrectOption || (isSelected && !isCorrect))) &&
                styles.optionTextWhite,
            ];

            return (
              <TouchableOpacity
                key={option}
                style={buttonStyle}
                onPress={() => !isValidated && onAnswer(option)}
                disabled={isValidated}
                activeOpacity={0.7}
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ExerciseValidation */}
      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        correctAnswer={question.correctAnswer}
        onValidate={onValidate}
        onNext={onNext}
        onRetry={onRetry}
        onSkip={onNext}
        disabled={buttonDisabled}
        isLastQuestion={isLastQuestion}
        feedbackMessage={feedbackMessage}
      />
    </ScrollView>
  );
};

export default BlanksCard;
