// ============================================
// FICHIER: src/components/pedagogy/wordgames/DetectiveCard/index.js
// Grammar Detective / Register Switcher - Trouver l'erreur/mot informel
// ✅ REFACTORISÉ : Utilise ExerciseValidation pour UX cohérente
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './style';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/exerciseFeedback';

const DetectiveCard = ({
  question,
  selectedWord,
  isValidated,
  isCorrect,
  attemptCount = 0,
  maxAttempts = 2,
  onAnswer,
  onValidate,
  onRetry,
  onNext,
  isLastQuestion,
  color = '#F59E0B',
}) => {
  // Utilisation du hook pour la validation
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    selectedWord !== null && selectedWord !== undefined
  );

  const words = question.sentence.split(' ');
  const errorIndex = words.indexOf(question.errorWord);

  const handleWordPress = (wordIndex) => {
    if (isValidated) return;
    onAnswer(wordIndex);
  };

  const getWordStyle = (index) => {
    const baseStyle = [styles.wordButton, { borderColor: color }];

    if (!isValidated) {
      // Avant validation: montrer clairement le mot sélectionné
      if (selectedWord === index) {
        return [...baseStyle, styles.wordButtonSelected];
      }
      return baseStyle;
    }

    // ✅ Afficher feedback SEULEMENT si correct OU dernière tentative
    const showFeedback = isCorrect || canSkip;

    if (!showFeedback) {
      // Encore en phase de tentative
      if (selectedWord === index) {
        return [...baseStyle, styles.wordButtonSelected];
      }
      return baseStyle;
    }

    // Après validation finale: montrer l'erreur et la sélection
    if (index === errorIndex) {
      return [...baseStyle, styles.wordButtonCorrect];
    }
    if (index === selectedWord && selectedWord !== errorIndex) {
      return [...baseStyle, styles.wordButtonIncorrect];
    }
    return baseStyle;
  };

  const getWordTextStyle = (index) => {
    if (!isValidated) {
      return styles.wordText;
    }

    const showFeedback = isCorrect || canSkip;
    if (!showFeedback) {
      return styles.wordText;
    }

    if (index === errorIndex || (index === selectedWord && selectedWord !== errorIndex)) {
      return [styles.wordText, styles.wordTextWhite];
    }
    return styles.wordText;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, { borderTopColor: color }]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>🔍</Text>
          <Text style={styles.titleText}>Register Switcher</Text>
        </View>

        <View style={[styles.instructionBox, { borderColor: color }]}>
          <Text style={styles.instructionText}>
            Tap the word that is too informal:
          </Text>
        </View>

        <View style={styles.wordsContainer}>
          {words.map((word, index) => (
            <TouchableOpacity
              key={`${word}-${index}`}
              onPress={() => handleWordPress(index)}
              style={getWordStyle(index)}
              disabled={isValidated}
            >
              <Text style={getWordTextStyle(index)}>{word}</Text>
              {isValidated && (isCorrect || canSkip) && index === errorIndex && question.correction && (
                <Text style={styles.correctionText}>→ {question.correction}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Afficher l'explication uniquement après validation finale */}
        {isValidated && (isCorrect || canSkip) && (
          <View style={[styles.instructionBox, {
            borderColor: isCorrect ? '#10B981' : '#F59E0B',
            backgroundColor: isCorrect ? '#D1FAE5' : '#FEF3C7',
            marginTop: 16,
          }]}>
            <Text style={[styles.wordText, {
              textAlign: 'center',
              color: isCorrect ? '#065F46' : '#92400E',
            }]}>
              💡 {question.explanation}
            </Text>
          </View>
        )}
      </View>

      {/* ✅ ExerciseValidation intégré */}
      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        correctAnswer={question.errorWord}
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
          question.errorWord,
          attemptCount,
          maxAttempts
        )}
      />
    </ScrollView>
  );
};

DetectiveCard.propTypes = {
  question: PropTypes.shape({
    sentence: PropTypes.string.isRequired,
    errorWord: PropTypes.string.isRequired,
    correction: PropTypes.string,
    explanation: PropTypes.string.isRequired,
  }).isRequired,
  selectedWord: PropTypes.number,
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

export default DetectiveCard;
