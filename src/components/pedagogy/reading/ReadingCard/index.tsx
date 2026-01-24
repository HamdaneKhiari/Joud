import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import ExerciseValidation from '../../../common/ExerciseValidation';
import { generateFeedbackMessage } from '../../../../utils/feedback';
import QuestionCard from '../../shared/QuestionCard';

interface ReadingQuestionData {
  passage: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  audio_url?: string;
  hint?: string;
}

interface ReadingCardProps {
  question: ReadingQuestionData;
  selectedOption?: string;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  maxAttempts: number;
  isPlaying: boolean;
  onPlayAudio: (source: string) => void;
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
  isPlaying,
  onPlayAudio,
  onAnswer,
  onValidate,
  onNext,
  onRetry,
  isLastQuestion,
  color,
}) => {
  const { identity } = useTheme();

  const brandColor = color || identity.branding.main;
  const surfaceColor = identity.branding.surface;
  const cardRadius = identity.ui.cardRadius || tokens.borderRadius.lg;

  const validationState = useMemo(() => {
    if (!isValidated) return 'idle';
    if (isCorrect) return 'success';
    if (attemptCount >= maxAttempts) return 'error';
    return 'retry';
  }, [isValidated, isCorrect, attemptCount, maxAttempts]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* SECTION 1 : PASSAGE */}
      <View style={[
        styles.passageCard,
        {
          backgroundColor: surfaceColor,
          borderTopColor: brandColor,
          borderRadius: cardRadius,
        }
      ]}>
        <View style={styles.headerRow}>
          <View style={[styles.iconBadge, { backgroundColor: withOpacity(brandColor, 0.1) }]}>
            <Ionicons name="book-outline" size={20} color={brandColor} />
          </View>
          <Text style={[styles.cardTitle, { color: identity.text.primary, fontFamily: identity.typography?.families?.primary }]}>
            {identity.i18n?.readingPassageLabel || "Reading Passage"}
          </Text>
        </View>

        <View style={[styles.passageBox, { backgroundColor: withOpacity(brandColor, 0.04) }]}>
          <View style={[styles.accentLine, { backgroundColor: brandColor }]} />
          <Text style={[
            styles.passageText, 
            { 
              color: identity.text.primary,
              fontSize: tokens.fontSize.base,
              lineHeight: tokens.fontSize.base * 1.6 // ✅ Ratio dynamique
            }
          ]}>
            {question.passage}
          </Text>
        </View>

        {question.audio_url && (
          <TouchableOpacity
            onPress={() => onPlayAudio(question.audio_url!)}
            style={[styles.audioButton, { borderColor: brandColor }]}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play-circle"}
              size={22}
              color={brandColor}
            />
            <Text style={[styles.audioText, { color: brandColor }]}>
              {isPlaying ? (identity.i18n?.playingLabel || "En cours...") : (identity.i18n?.listenLabel || "Écouter le texte")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SECTION 2 : QUESTION */}
      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: identity.text.secondary }]}>
          {identity.i18n?.questionHeader || "QUESTION"}
        </Text>

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
        feedbackMessage={generateFeedbackMessage(
          isValidated,
          isCorrect,
          attemptCount >= maxAttempts,
          question.correct_answer,
          attemptCount,
          maxAttempts
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: tokens.layout.screenPadding,
    paddingBottom: 140, 
  },
  passageCard: {
    padding: tokens.spacing.lg,
    borderTopWidth: 4,
    marginBottom: tokens.spacing.xl,
    ...tokens.shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  iconBadge: {
    padding: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.sm,
  },
  cardTitle: {
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.md,
  },
  passageBox: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.md,
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  accentLine: {
    width: 3,
    borderRadius: tokens.borderRadius.round,
  },
  passageText: { flex: 1 },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.round,
    borderWidth: 1,
    marginTop: tokens.spacing.lg,
    alignSelf: 'flex-start',
  },
  audioText: {
    fontWeight: tokens.fontWeight.semibold,
    fontSize: tokens.fontSize.sm,
  },
  questionSection: { marginBottom: tokens.spacing.xl },
  questionLabel: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.extrabold,
    letterSpacing: 1,
    marginBottom: tokens.spacing.md,
  },
});

export default ReadingCard;