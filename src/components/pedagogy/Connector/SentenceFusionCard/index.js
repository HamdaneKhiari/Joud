// ============================================
// FICHIER: src/components/pedagogy/connector/SentenceFusionCard/index.js
// Sentence Fusion - Fusion de phrases
// ============================================

import PropTypes from 'prop-types';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { styles } from './style';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/exerciseFeedback';

const SentenceFusionCard = ({
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
  color = '#10B981',
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
          <Text style={styles.titleIcon}>🔀</Text>
          <Text style={styles.titleText}>Combine two sentences into one</Text>
        </View>

        {/* Phrase 1 */}
        <View style={[styles.phraseBox, { backgroundColor: '#DBEAFE', borderColor: color }]}>
          <Text style={styles.phraseLabel}>Phrase 1:</Text>
          <Text style={styles.phraseText}>{question.phrase1}</Text>
        </View>

        {/* Phrase 2 */}
        <View style={[styles.phraseBox, { backgroundColor: '#E0F2FE', borderColor: color }]}>
          <Text style={styles.phraseLabel}>Phrase 2:</Text>
          <Text style={styles.phraseText}>{question.phrase2}</Text>
        </View>

        {/* Hint */}
        {question.hint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintIcon}>💡</Text>
            <Text style={styles.hintText}>{question.hint}</Text>
          </View>
        )}

        {/* Input pour la réponse */}
        <View style={[styles.answerSection, { borderColor: color }]}>
          <Text style={styles.answerLabel}>Your answer:</Text>
          <TextInput
            style={[
              styles.answerInput,
              { borderColor: color },
              isValidated && isCorrect && styles.answerInputCorrect,
              isValidated && !isCorrect && canSkip && styles.answerInputIncorrect,
            ]}
            value={userAnswer || ''}
            onChangeText={onAnswer}
            placeholder="Type your combined sentence here..."
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

SentenceFusionCard.propTypes = {
  question: PropTypes.shape({
    phrase1: PropTypes.string.isRequired,
    phrase2: PropTypes.string.isRequired,
    correctAnswer: PropTypes.string.isRequired,
    hint: PropTypes.string,
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

export default SentenceFusionCard;
