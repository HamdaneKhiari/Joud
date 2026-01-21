// ============================================
// FICHIER: src/components/pedagogy/connector/RephrasingCard/index.js
// Rephrasing - Reformulation avec contrainte grammaticale
// ============================================

import PropTypes from 'prop-types';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { styles } from './style';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/exerciseFeedback';

const RephrasingCard = ({
  question,
  userAnswer,
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
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!userAnswer && userAnswer.trim().length > 0
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, { borderTopColor: color }]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>♻️</Text>
          <Text style={styles.titleText}>Rephrase the sentence</Text>
        </View>

        {/* Phrase de base */}
        <View style={[styles.baseSentenceBox, { borderColor: color }]}>
          <Text style={styles.baseSentenceLabel}>Original sentence:</Text>
          <Text style={styles.baseSentenceText}>{question.baseSentence}</Text>
        </View>

        {/* Instruction avec le mot à utiliser */}
        {question.instruction && (
          <View style={[styles.instructionBox, { backgroundColor: color + '15', borderColor: color }]}>
            <Text style={styles.instructionIcon}>📌</Text>
            <Text style={[styles.instructionText, { color: color }]}>{question.instruction}</Text>
          </View>
        )}

        {/* Input pour la réponse */}
        <View style={[styles.answerSection, { borderColor: color }]}>
          <Text style={styles.answerLabel}>Your rephrased sentence:</Text>
          <TextInput
            style={[
              styles.answerInput,
              { borderColor: color },
              isValidated && isCorrect && styles.answerInputCorrect,
              isValidated && !isCorrect && canSkip && styles.answerInputIncorrect,
            ]}
            value={userAnswer || ''}
            onChangeText={onAnswer}
            placeholder="Type your answer here..."
            placeholderTextColor="#9CA3AF"
            multiline
            editable={!isValidated}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Afficher la correction si validé et faux */}
        {isValidated && !isCorrect && canSkip && (
          <View style={styles.correctAnswerBox}>
            <Text style={styles.correctAnswerLabel}>✅ Correct answer:</Text>
            <Text style={styles.correctAnswerText}>{question.correctAnswer}</Text>
          </View>
        )}

        {/* Traduction */}
        {question.translation && (
          <View style={styles.translationBox}>
            <Text style={styles.translationText}>{question.translation}</Text>
          </View>
        )}
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

RephrasingCard.propTypes = {
  question: PropTypes.shape({
    baseSentence: PropTypes.string.isRequired,
    instruction: PropTypes.string.isRequired,
    correctAnswer: PropTypes.string.isRequired,
    translation: PropTypes.string,
  }).isRequired,
  userAnswer: PropTypes.string,
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

export default RephrasingCard;
