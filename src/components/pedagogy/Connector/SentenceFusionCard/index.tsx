import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/feedback';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { SentenceFusionCardProps } from '../types';

const SentenceFusionCard: React.FC<SentenceFusionCardProps> = ({
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
  const { identity } = useTheme();

  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!userAnswer && userAnswer.trim().length > 0
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[
        styles.card, 
        { 
          borderTopColor: color,
          borderRadius: identity.ui.cardRadius || tokens.borderRadius.lg
        }
      ]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>🔀</Text>
          <Text style={[styles.titleText, { color: identity.text.primary }]}>Combine two sentences into one</Text>
        </View>

        {/* Phrase 1 */}
        <View style={[styles.phraseBox, { backgroundColor: '#F1F5F9', borderLeftColor: color }]}>
          <Text style={[styles.phraseLabel, { color: identity.text.secondary }]}>Phrase 1:</Text>
          <Text style={[styles.phraseText, { color: identity.text.primary }]}>{question.phrase1}</Text>
        </View>

        {/* Phrase 2 */}
        <View style={[styles.phraseBox, { backgroundColor: '#F8FAFC', borderLeftColor: color }]}>
          <Text style={[styles.phraseLabel, { color: identity.text.secondary }]}>Phrase 2:</Text>
          <Text style={[styles.phraseText, { color: identity.text.primary }]}>{question.phrase2}</Text>
        </View>

        {/* Hint */}
        {question.hint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintIcon}>💡</Text>
            <Text style={[styles.hintText, { color: identity.text.secondary }]}>{question.hint}</Text>
          </View>
        )}

        {/* Input pour la réponse */}
        <View style={[styles.answerSection, { borderColor: color }]}>
          <Text style={[styles.answerLabel, { color: identity.text.primary }]}>Your answer:</Text>
          <TextInput
            style={[
              styles.answerInput,
              { borderColor: color, color: identity.text.primary },
              isValidated && isCorrect && styles.answerInputCorrect,
              isValidated && !isCorrect && canSkip && styles.answerInputIncorrect,
            ]}
            value={userAnswer || ''}
            onChangeText={onAnswer}
            placeholder="Type your combined sentence here..."
            placeholderTextColor={identity.text.tertiary}
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
            <Text style={[styles.translationText, { color: identity.text.secondary }]}>{question.translation}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: tokens.layout.screenPadding,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: tokens.layout.cardPadding,
    ...tokens.shadows.md,
    borderTopWidth: tokens.borderWidth.thick,
    marginBottom: tokens.layout.sectionGap,
  },
  colorBar: {
    height: 4,
    width: 40,
    borderRadius: tokens.borderRadius.round,
    marginBottom: tokens.spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.layout.sectionGap,
  },
  titleIcon: {
    fontSize: tokens.fontSize.xl,
  },
  titleText: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.semibold,
    flex: 1,
  },
  phraseBox: {
    padding: tokens.spacing.md,
    borderLeftWidth: 4,
    borderRadius: tokens.borderRadius.sm,
    marginBottom: tokens.spacing.md,
  },
  phraseLabel: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.spacing.xs,
    textTransform: 'uppercase',
  },
  phraseText: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.medium,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.layout.sectionGap,
    padding: tokens.spacing.sm,
    backgroundColor: '#FFFBEB',
    borderRadius: tokens.borderRadius.md,
  },
  hintIcon: {
    fontSize: tokens.fontSize.md,
  },
  hintText: {
    fontSize: tokens.fontSize.sm,
    fontStyle: 'italic',
    flex: 1,
  },
  answerSection: {
    marginBottom: tokens.layout.sectionGap,
  },
  answerLabel: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.spacing.sm,
  },
  answerInput: {
    borderWidth: 2,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    fontSize: tokens.fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  answerInputCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  answerInputIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  correctAnswerBox: {
    marginTop: -tokens.spacing.md,
    marginBottom: tokens.layout.sectionGap,
    padding: tokens.spacing.md,
    backgroundColor: '#F0FDF4',
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  correctAnswerLabel: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold,
    color: '#15803D',
    marginBottom: tokens.spacing.xs,
  },
  correctAnswerText: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    color: '#15803D',
  },
  translationBox: {
    alignItems: 'center',
    paddingTop: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  translationText: {
    fontSize: tokens.fontSize.sm,
    fontStyle: 'italic',
  },
});

export default SentenceFusionCard;
