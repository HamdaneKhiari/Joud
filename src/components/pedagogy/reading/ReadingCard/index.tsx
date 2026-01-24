import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { ReadingQuestionData } from '../types';
import ExerciseValidation from '../../../common/ExerciseValidation';
import { generateFeedbackMessage } from '../../../../utils/feedback';
import QuestionCard from '../../shared/QuestionCard';

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

  // 1. CALCULS MÉMORISÉS (Performance & Clean Code)
  const canSkip = attemptCount >= maxAttempts && !isCorrect;
  
  // Utilise fromCodePoint pour SonarLint et centralise la lettre correcte
  const correctLetter = useMemo(() => 
    String.fromCodePoint(65 + question.correctAnswer), 
  [question.correctAnswer]);

  const validationState = useMemo(() => {
    if (!isValidated) return 'initial';
    if (isCorrect) return 'correct';
    if (canSkip) return 'skip';
    return 'incorrect';
  }, [isValidated, isCorrect, canSkip]);

  // 2. THEMING DYNAMIQUE (White Label)
  const primaryColor = color || identity.branding.main; 
  const surfaceColor = identity.branding.surface;
  const cardRadius = identity.ui.cardRadius || tokens.borderRadius.lg;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* --- SECTION TEXTE (PASSAGE) --- */}
      <View style={[
        styles.card, 
        { backgroundColor: surfaceColor, borderRadius: cardRadius }
      ]}>
        <View style={[styles.header, { borderBottomColor: withOpacity(identity.text.tertiary, 0.2) }]}>
          <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
            <Ionicons name="book-outline" size={tokens.fontSize.lg} color={identity.text.onMain} />
          </View>
          <Text style={[styles.headerTitle, { color: identity.text.primary }]}>Reading Passage</Text>
        </View>

        <View style={styles.passageContainer}>
          <View style={[styles.decorativeBorder, { backgroundColor: primaryColor }]} />
          
          <View style={[styles.textContainer, { backgroundColor: withOpacity(primaryColor, 0.05) }]}>
            <Text style={[styles.passageText, { color: identity.text.primary }]}>
              {question.text}
            </Text>
          </View>
        </View>

        {/* Bouton Audio */}
        {question.audio && (
          <View style={styles.audioContainer}>
            <TouchableOpacity
              style={[
                styles.audioButton,
                { borderColor: primaryColor },
                isPlaying && { backgroundColor: primaryColor }
              ]}
              onPress={() => onPlayAudio(question.audio!)}
            >
              <Ionicons
                name={isPlaying ? "pause" : "volume-high"}
                size={tokens.fontSize.lg}
                color={isPlaying ? identity.text.onMain : primaryColor}
              />
              <Text style={[
                styles.audioText,
                { color: isPlaying ? identity.text.onMain : primaryColor }
              ]}>
                {isPlaying ? 'Playing...' : 'Listen to passage'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* --- SECTION QUESTION --- */}
      <View style={[
        styles.card, 
        { 
          backgroundColor: surfaceColor, 
          borderRadius: cardRadius, 
          marginTop: tokens.layout.sectionGap 
        }
      ]}>
        <View style={styles.questionHeader}>
          <Text style={[styles.questionTitle, { color: identity.text.primary }]}>
            {question.question}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <QuestionCard
            questionIndex={0}
            question={question.question}
            options={question.options}
            correctAnswer={correctLetter}
            moduleType="reading"
            showStars={false}
            hint={question.hint}
            externalSelectedOption={selectedOption}
            externalIsAnswered={isValidated}
            externalShowFeedback={isValidated && (isCorrect || canSkip)}
            externalIsCorrect={isCorrect}
            onAnswer={onAnswer}
          />
        </View>
      </View>

      {/* --- VALIDATION & FEEDBACK --- */}
      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        correctAnswer={correctLetter}
        onValidate={onValidate}
        onNext={onNext}
        onRetry={onRetry}
        onSkip={onNext}
        disabled={!selectedOption && !isValidated}
        isLastQuestion={isLastQuestion}
        // Correction de l'erreur TS: cast en any ou transformation du null en undefined
        feedbackMessage={generateFeedbackMessage(
          isValidated,
          isCorrect,
          canSkip,
          correctLetter,
          attemptCount,
          maxAttempts
        ) as any} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    padding: tokens.layout.screenPadding, 
    paddingBottom: 120 // Espace pour ne pas être caché par le footer
  },
  card: {
    padding: tokens.layout.cardPadding,
    ...tokens.shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    paddingBottom: tokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: tokens.spacing.md,
  },
  iconContainer: {
    padding: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.sm,
  },
  headerTitle: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
  },
  passageContainer: { flexDirection: 'row', marginBottom: tokens.spacing.lg },
  decorativeBorder: { 
    width: 4, 
    borderRadius: tokens.borderRadius.round, 
    marginRight: tokens.spacing.md 
  },
  textContainer: { 
    flex: 1, 
    padding: tokens.spacing.md, 
    borderRadius: tokens.borderRadius.md 
  },
  passageText: { 
    fontSize: tokens.fontSize.md, 
    lineHeight: 24 
  },
  audioContainer: { alignItems: 'flex-start' },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.round,
    borderWidth: 1,
  },
  audioText: { 
    fontWeight: tokens.fontWeight.bold, 
    fontSize: tokens.fontSize.sm 
  },
  questionHeader: { marginBottom: tokens.spacing.md },
  questionTitle: { 
    fontSize: tokens.fontSize.lg, 
    fontWeight: tokens.fontWeight.semibold 
  },
  optionsContainer: { gap: tokens.spacing.sm },
});

export default ReadingCard;