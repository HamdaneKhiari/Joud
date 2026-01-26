import React, { useMemo } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '../../../common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/exercises/useExerciceValidationState';
import { generateFeedbackMessage } from '../../../../utils/feedback';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { baseColors } from '@/themes/colors'; 
import { RephrasingCardProps } from '../types';

/**
 * ============================================
 * RephrasingCard (Standardized Edition)
 * ✅ Zéro "Leaked Values" (Sonar S6439)
 * ✅ Thème 100% Dynamique
 * ============================================
 */

const RephrasingCard: React.FC<RephrasingCardProps> = ({
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
  color,
}) => {
  const { identity } = useTheme();

  // Détermination de la couleur de marque avec fallback safe
  const brandColor = color || identity.palette.primary || '#F59E0B';

  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!(userAnswer && userAnswer.trim().length > 0) // Cast boolean explicite
  );

  // Transformation du feedback pour correspondre au type attendu par ExerciseValidation
  const feedbackData = useMemo(() => {
    const feedback = generateFeedbackMessage(
      isValidated,
      isCorrect,
      canSkip,
      question.correctAnswer,
      attemptCount,
      maxAttempts
    );
    return feedback ? { title: feedback.title, message: feedback.message } : undefined;
  }, [isValidated, isCorrect, canSkip, question.correctAnswer, attemptCount, maxAttempts]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[
        styles.card,
        {
          backgroundColor: identity.palette.surface || baseColors.white,
          borderTopColor: brandColor,
          borderRadius: identity.ui.cardRadius || tokens.borderRadius.lg
        }
      ]}>
        <View style={[styles.colorBar, { backgroundColor: brandColor }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>♻️</Text>
          <Text style={[styles.titleText, { color: identity.text.primary }]}>
            Rephrase the sentence
          </Text>
        </View>

        {/* Phrase de base */}
        <View style={[
          styles.baseSentenceBox, 
          { 
            borderColor: withOpacity(brandColor, 0.3),
            backgroundColor: withOpacity(brandColor, 0.05)
          }
        ]}>
          <Text style={[styles.baseSentenceLabel, { color: identity.text.secondary }]}>
            Original sentence:
          </Text>
          <Text style={[styles.baseSentenceText, { color: identity.text.primary }]}>
            {question.baseSentence}
          </Text>
        </View>

        {/* Instruction : Correction S6439 (!! force le boolean) */}
        {!!question.instruction && (
          <View style={[
            styles.instructionBox, 
            { 
              backgroundColor: withOpacity(brandColor, 0.1), 
              borderColor: brandColor 
            }
          ]}>
            <Text style={styles.instructionIcon}>📌</Text>
            <Text style={[styles.instructionText, { color: brandColor }]}>
              {question.instruction}
            </Text>
          </View>
        )}

        {/* Section Réponse */}
        <View style={styles.answerSection}>
          <Text style={[styles.answerLabel, { color: identity.text.primary }]}>
            Your rephrased sentence:
          </Text>
          <TextInput
            style={[
              styles.answerInput,
              {
                borderColor: withOpacity(identity.text.tertiary, 0.2),
                color: identity.text.primary,
                backgroundColor: identity.palette.surface || baseColors.white,
                borderRadius: tokens.borderRadius.md
              },
              isValidated && isCorrect && styles.inputCorrect,
              isValidated && !isCorrect && canSkip && { 
                borderColor: identity.aiDiagnostic?.error || baseColors.red500, 
                backgroundColor: withOpacity(identity.aiDiagnostic?.error || baseColors.red500, 0.05) 
              },
            ]}
            value={userAnswer || ''}
            onChangeText={onAnswer}
            placeholder="Type your answer here..."
            placeholderTextColor={identity.text.tertiary}
            multiline
            editable={!isValidated}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Correction affichée si nécessaire */}
        {!!(isValidated && !isCorrect && canSkip) && (
          <View style={styles.correctAnswerBox}>
            <Text style={styles.correctAnswerLabel}>✅ Correct answer:</Text>
            <Text style={styles.correctAnswerText}>{question.correctAnswer}</Text>
          </View>
        )}

        {/* Traduction : Correction S6439 */}
        {!!question.translation && (
          <View style={[styles.translationBox, { borderTopColor: withOpacity(identity.text.tertiary, 0.1) }]}>
            <Text style={[styles.translationText, { color: identity.text.secondary }]}>
              {question.translation}
            </Text>
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
        feedbackMessage={feedbackData}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    padding: tokens.layout.screenPadding, 
    paddingBottom: 100 
  },
  card: { 
    padding: tokens.layout.cardPadding, 
    ...tokens.shadows.md, 
    borderTopWidth: tokens.borderWidth.thick, 
    marginBottom: tokens.layout.sectionGap 
  },
  colorBar: { 
    height: 4, 
    width: 40, 
    borderRadius: tokens.borderRadius.round, 
    marginBottom: tokens.spacing.lg 
  },
  titleSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: tokens.spacing.sm, 
    marginBottom: tokens.layout.sectionGap 
  },
  titleIcon: { fontSize: tokens.fontSize.xl },
  titleText: { 
    fontSize: tokens.fontSize.lg, 
    fontWeight: tokens.fontWeight.semibold, 
    flex: 1 
  },
  baseSentenceBox: { 
    padding: tokens.spacing.lg, 
    borderWidth: 1, 
    borderRadius: tokens.borderRadius.md, 
    marginBottom: tokens.spacing.md, 
    borderStyle: 'dashed' 
  },
  baseSentenceLabel: { 
    fontSize: tokens.fontSize.xs, 
    fontWeight: tokens.fontWeight.bold, 
    marginBottom: tokens.spacing.xs, 
    textTransform: 'uppercase' 
  },
  baseSentenceText: { 
    fontSize: tokens.fontSize.lg, 
    fontWeight: tokens.fontWeight.medium 
  },
  instructionBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: tokens.spacing.sm, 
    marginBottom: tokens.layout.sectionGap, 
    padding: tokens.spacing.md, 
    borderRadius: tokens.borderRadius.md, 
    borderWidth: 1 
  },
  instructionIcon: { fontSize: tokens.fontSize.md },
  instructionText: { 
    fontSize: tokens.fontSize.md, 
    fontWeight: tokens.fontWeight.bold 
  },
  answerSection: { marginBottom: tokens.layout.sectionGap },
  answerLabel: { 
    fontSize: tokens.fontSize.sm, 
    fontWeight: tokens.fontWeight.bold, 
    marginBottom: tokens.spacing.sm 
  },
  answerInput: { 
    borderWidth: 2, 
    padding: tokens.spacing.md, 
    fontSize: tokens.fontSize.md, 
    minHeight: 80, 
    textAlignVertical: 'top' 
  },
  inputCorrect: {
    borderColor: baseColors.green500,
    backgroundColor: baseColors.green50
  },
  correctAnswerBox: { 
    marginTop: -tokens.spacing.md, 
    marginBottom: tokens.layout.sectionGap, 
    padding: tokens.spacing.md, 
    borderRadius: tokens.borderRadius.md, 
    borderWidth: 1,
    backgroundColor: baseColors.green50, 
    borderColor: baseColors.green500
  },
  correctAnswerLabel: { 
    fontSize: tokens.fontSize.xs, 
    fontWeight: tokens.fontWeight.bold, 
    marginBottom: tokens.spacing.xs,
    color: baseColors.green700
  },
  correctAnswerText: { 
    fontSize: tokens.fontSize.md, 
    fontWeight: tokens.fontWeight.bold,
    color: baseColors.green700
  },
  translationBox: { 
    alignItems: 'center', 
    paddingTop: tokens.spacing.sm, 
    borderTopWidth: 1 
  },
  translationText: { 
    fontSize: tokens.fontSize.sm, 
    fontStyle: 'italic' 
  },
});

export default RephrasingCard;