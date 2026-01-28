// ============================================
// FICHIER: src/components/pedagogy/wordgames/IdiomsCard/index.js
// Idioms Master - Comprendre expressions idiomatiques
// ✅ REFACTORISÉ : Utilise ExerciseValidation pour UX cohérente
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './style';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/exerciseFeedback';

const IdiomsCard = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  attemptCount = 0,
  maxAttempts = 2,
  onAnswer,
  onValidate,
  onRetry,
  onNext,
  isLastQuestion,
  color = '#A855F7',
}) => {
  // Utilisation du hook pour la validation
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedOption
  );

  const getOptionStyle = (option) => {
    const baseStyle = [styles.optionButton, { borderColor: color }];
    const isSelected = selectedOption === option;
    const isCorrectOption = option === question.correctMeaning;

    // ✅ Afficher feedback SEULEMENT si correct OU dernière tentative
    const showFeedback = isValidated && (isCorrect || canSkip);

    if (!showFeedback) {
      // Avant validation ou pendant les tentatives
      if (isSelected) {
        return [...baseStyle, styles.optionButtonSelected];
      }
      return baseStyle;
    }

    // Après validation finale : montrer correct/incorrect
    if (isCorrectOption) {
      return [...baseStyle, styles.optionButtonCorrect];
    }
    if (isSelected && !isCorrect) {
      return [...baseStyle, styles.optionButtonIncorrect];
    }
    return baseStyle;
  };

  const getOptionTextStyle = (option) => {
    const isSelected = selectedOption === option;
    const isCorrectOption = option === question.correctMeaning;
    const showFeedback = isValidated && (isCorrect || canSkip);

    if (!showFeedback) {
      return styles.optionText;
    }

    if (isCorrectOption || (isSelected && !isCorrect)) {
      return [styles.optionText, styles.optionTextWhite];
    }
    return styles.optionText;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, { borderTopColor: color }]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>💬</Text>
          <Text style={styles.titleText}>Idiom Master</Text>
        </View>

        <View style={[styles.idiomBox, { borderColor: color }]}>
          <Text style={styles.idiomText}>"{question.idiom}"</Text>
          <Text style={styles.contextText}>{question.context}</Text>
        </View>

        <View style={[styles.instructionBox, { borderColor: color }]}>
          <Text style={styles.instructionText}>What does it mean?</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={`option-${index}`}
              style={getOptionStyle(option)}
              onPress={() => !isValidated && onAnswer(option)}
              disabled={isValidated}
            >
              <Text style={getOptionTextStyle(option)}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ✅ ExerciseValidation intégré */}
      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        correctAnswer={question.correctMeaning}
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
          question.correctMeaning,
          attemptCount,
          maxAttempts
        )}
      />
    </ScrollView>
  );
};

IdiomsCard.propTypes = {
  question: PropTypes.shape({
    idiom: PropTypes.string.isRequired,
    context: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctMeaning: PropTypes.string.isRequired,
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

export default IdiomsCard;
