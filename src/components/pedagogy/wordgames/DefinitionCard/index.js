// ============================================
// FICHIER: src/components/pedagogy/word_games/DefinitionCard/index.js
// Definition Match - Lire définition et trouver mot
// ============================================

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './style';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/exerciseFeedback';

const DefinitionCard = ({
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
  color = '#8B5CF6',
}) => {
  // Utilisation du hook pour la validation
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedOption
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Card principale */}
      <View style={[styles.card, { borderTopColor: color }]}>
        {/* Barre couleur */}
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>📖</Text>
          <Text style={styles.titleText}>What is this?</Text>
        </View>

        {/* Définition */}
        <View style={[styles.definitionBox, { borderColor: color }]}>
          <Text style={styles.definitionText}>{question.definition}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;
            
            // ✅ CORRECTION : Afficher feedback SEULEMENT si correct OU dernière tentative
            const showFeedback = isValidated && (isCorrect || canSkip);

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  { borderColor: color },
                  showFeedback && isCorrectOption && styles.optionButtonCorrect,
                  showFeedback && isSelected && !isCorrect && styles.optionButtonIncorrect,
                  !showFeedback && isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => !isValidated && onAnswer(option)}
                disabled={isValidated}
              >
                <Text
                  style={[
                    styles.optionText,
                    (showFeedback && (isCorrectOption || (isSelected && !isCorrect))) &&
                      styles.optionTextWhite,
                  ]}
                >
                  {option}
                </Text>
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
        feedbackMessage={generateFeedbackMessage(
          isValidated,
          isCorrect,
          canSkip,
          question.correctAnswer,
          attemptCount,
          maxAttempts
        )}
      />
    </ScrollView>
  );
};

DefinitionCard.propTypes = {
  question: PropTypes.shape({
    definition: PropTypes.string,
    options: PropTypes.array,
    correctAnswer: PropTypes.string,
  }).isRequired,
  selectedOption: PropTypes.string,
  isValidated: PropTypes.bool,
  isCorrect: PropTypes.bool,
  attemptCount: PropTypes.number,
  maxAttempts: PropTypes.number,
  onAnswer: PropTypes.func,
  onValidate: PropTypes.func,
  onRetry: PropTypes.func,
  onNext: PropTypes.func,
  isLastQuestion: PropTypes.bool,
  color: PropTypes.string,
};

export default DefinitionCard;