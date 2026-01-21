// ============================================
// FICHIER: src/components/pedagogy/connector/LogicLinksCard/index.js
// Logic Links - Connecteurs logiques
// ============================================

import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './style';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/exerciseFeedback';

const LogicLinksCard = ({
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
  color = '#3B82F6',
}) => {
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
          <Text style={styles.titleIcon}>🔗</Text>
          <Text style={styles.titleText}>Choose the logical connector</Text>
        </View>

        <View style={[styles.sentenceBox, { borderColor: color }]}>
          <Text style={styles.sentenceText}>{question.sentence}</Text>
        </View>

        {question.translation && (
          <View style={styles.translationBox}>
            <Text style={styles.translationText}>{question.translation}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;
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

LogicLinksCard.propTypes = {
  question: PropTypes.shape({
    sentence: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    correctAnswer: PropTypes.string.isRequired,
    translation: PropTypes.string,
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

export default LogicLinksCard;
