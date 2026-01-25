import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens'; // ✅ Nettoyage : withOpacity supprimé (SonarLint)
import ExerciseValidation from '../../../common/ExerciseValidation';
import { generateFeedbackMessage } from '../../../../utils/feedback';
import QuestionCard from '../../shared/QuestionCard';

// ✅ On importe le type exact pour garantir la compatibilité
import { ValidationState } from '../../../common/ExerciseValidation/types';

interface ReadingCardProps {
  question: {
    passage: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    hint?: string;
  };
  selectedOption?: string;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  maxAttempts: number;
  onAnswer: (option: string) => void;
  onValidate: () => void;
  onNext: () => void;
  onRetry: () => void;
  isLastQuestion: boolean;
  color?: string;
}

const ReadingCard: React.FC<ReadingCardProps> = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  attemptCount,
  maxAttempts,
  onAnswer,
  onValidate,
  onNext,
  onRetry,
  isLastQuestion,
  color,
}) => {
  const { identity } = useTheme();

  const brandColor = color || identity.palette.primary;
  const surfaceColor = identity.palette.surface;

  // ✅ Correction TypeScript : Utilisation explicite du type importé pour lever l'ambiguïté
  const validationState = useMemo<ValidationState | undefined>(() => {
    if (!isValidated) return undefined;
    if (isCorrect) return 'success' as ValidationState;
    if (attemptCount >= maxAttempts) return 'error' as ValidationState;
    return 'retry' as ValidationState;
  }, [isValidated, isCorrect, attemptCount, maxAttempts]);

  const feedback = useMemo(() => {
    const msg = generateFeedbackMessage(
      isValidated,
      isCorrect,
      attemptCount >= maxAttempts,
      question.correct_answer,
      attemptCount,
      maxAttempts
    );
    return msg || undefined;
  }, [isValidated, isCorrect, attemptCount, maxAttempts, question.correct_answer]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >
      {/* SECTION PASSAGE */}
      <View style={[
        styles.passageCard, 
        { 
          backgroundColor: surfaceColor, 
          borderTopColor: brandColor,
          borderRadius: identity.ui?.cardRadius || tokens.borderRadius.lg 
        }
      ]}>
        <Text style={[styles.cardTitle, { color: identity.text.secondary }]}>
          {("readingPassageLabel" in identity.i18n ? (identity.i18n as any).readingPassageLabel : "ANALYSE DE TEXTE")}
        </Text>

        <View style={styles.passageBox}>
          <View style={[styles.accentLine, { backgroundColor: brandColor }]} />
          <Text style={[
            styles.passageText, 
            { 
              color: identity.text.primary,
              fontSize: tokens.fontSize.base,
              lineHeight: tokens.fontSize.base * 1.6 
            }
          ]}>
            {question.passage}
          </Text>
        </View>
      </View>

      {/* SECTION QUESTION */}
      <View style={styles.questionSection}>
        <QuestionCard
          question={question.question_text}
          options={question.options}
          correctAnswer={question.correct_answer}
          moduleColor={brandColor}
          externalSelectedOption={selectedOption}
          externalIsAnswered={isValidated}
          externalIsCorrect={isCorrect}
          onAnswer={onAnswer}
          hint={question.hint}
        />
      </View>

      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        onValidate={onValidate}
        onNext={onNext}
        onRetry={onRetry}
        disabled={!selectedOption}
        isLastQuestion={isLastQuestion}
        feedbackMessage={feedback}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: tokens.layout.screenPadding, paddingBottom: 140 },
  passageCard: {
    padding: tokens.spacing.lg,
    borderTopWidth: 4,
    marginBottom: tokens.spacing.xl,
    ...tokens.shadows.sm,
  },
  cardTitle: {
    fontWeight: tokens.fontWeight.extrabold,
    fontSize: tokens.fontSize.xs,
    letterSpacing: 1.2,
    marginBottom: tokens.spacing.md,
    textTransform: 'uppercase',
  },
  passageBox: { flexDirection: 'row', gap: tokens.spacing.md },
  accentLine: { width: 3, borderRadius: 2, opacity: 0.6 },
  passageText: { flex: 1, fontWeight: '400' },
  questionSection: { marginBottom: tokens.spacing.xl },
});

export default ReadingCard;