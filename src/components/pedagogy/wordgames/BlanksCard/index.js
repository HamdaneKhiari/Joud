// ============================================
// FICHIER: src/components/pedagogy/word_games/BlanksCard/index.js
// Blanks - Compléter phrase
// ============================================

import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './style';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/exerciseFeedback';

const BlanksCard = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  attemptCount = 0,
  maxAttempts = 3,
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
      <View style={[styles.card, { borderTopColor: color }]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>✏️</Text>
          <Text style={styles.titleText}>Complete the sentence</Text>
        </View>

        <View style={[styles.sentenceBox, { borderColor: color }]}>
          <Text style={styles.sentenceText}>{question.sentence}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
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

BlanksCard.propTypes = {
  question: PropTypes.shape({
    sentence: PropTypes.string,
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

export default BlanksCard;