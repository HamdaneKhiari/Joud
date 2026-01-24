import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/feedback';
import { useTheme } from '@/themes/ThemeContext';
// ✅ Imports mis en conformité avec tes fichiers
import { tokens, withOpacity } from '@/themes/tokens';
import { baseColors } from '@/themes/colors'; 
import { RephrasingCardProps } from '../types';

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
  color = '#F59E0B',
}) => {
  const { identity } = useTheme();

  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!userAnswer && userAnswer.trim().length > 0
  );

  // Définition de la couleur de marque (soit celle du module, soit le main de l'identity)
  const brandColor = color || identity.branding.main;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[
        styles.card, 
        { 
          backgroundColor: identity.branding.surface || baseColors.white,
          borderTopColor: brandColor,
          borderRadius: identity.ui.cardRadius || tokens.borderRadius.lg
        }
      ]}>
        <View style={[styles.colorBar, { backgroundColor: brandColor }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>♻️</Text>
          <Text style={[styles.titleText, { color: identity.text.primary }]}>Rephrase the sentence</Text>
        </View>

        {/* Phrase de base : Fond dynamique basé sur le thème */}
        <View style={[
          styles.baseSentenceBox, 
          { 
            borderColor: withOpacity(brandColor, 0.3),
            backgroundColor: withOpacity(brandColor, 0.05)
          }
        ]}>
          <Text style={[styles.baseSentenceLabel, { color: identity.text.secondary }]}>Original sentence:</Text>
          <Text style={[styles.baseSentenceText, { color: identity.text.primary }]}>{question.baseSentence}</Text>
        </View>

        {/* Instruction avec le mot à utiliser */}
        {question.instruction && (
          <View style={[
            styles.instructionBox, 
            { 
              backgroundColor: withOpacity(brandColor, 0.1), 
              borderColor: brandColor 
            }
          ]}>
            <Text style={styles.instructionIcon}>📌</Text>
            <Text style={[styles.instructionText, { color: brandColor }]}>{question.instruction}</Text>
          </View>
        )}

        {/* Input pour la réponse */}
        <View style={styles.answerSection}>
          <Text style={[styles.answerLabel, { color: identity.text.primary }]}>Your rephrased sentence:</Text>
          <TextInput
            style={[
              styles.answerInput,
              { 
                borderColor: withOpacity(identity.text.tertiary, 0.2), 
                color: identity.text.primary,
                backgroundColor: identity.branding.surface || baseColors.white,
                borderRadius: tokens.borderRadius.md
              },
              isValidated && isCorrect && { borderColor: baseColors.green500, backgroundColor: baseColors.green50 },
              isValidated && !isCorrect && canSkip && { borderColor: identity.ai.error, backgroundColor: withOpacity(identity.ai.error, 0.05) },
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

        {/* Correction si validé et faux */}
        {isValidated && !isCorrect && canSkip && (
          <View style={[
            styles.correctAnswerBox, 
            { backgroundColor: baseColors.green50, borderColor: baseColors.green500 }
          ]}>
            <Text style={[styles.correctAnswerLabel, { color: baseColors.green700 }]}>✅ Correct answer:</Text>
            <Text style={[styles.correctAnswerText, { color: baseColors.green700 }]}>{question.correctAnswer}</Text>
          </View>
        )}

        {/* Traduction */}
        {question.translation && (
          <View style={[styles.translationBox, { borderTopColor: withOpacity(identity.text.tertiary, 0.1) }]}>
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
  correctAnswerBox: { 
    marginTop: -tokens.spacing.md, 
    marginBottom: tokens.layout.sectionGap, 
    padding: tokens.spacing.md, 
    borderRadius: tokens.borderRadius.md, 
    borderWidth: 1 
  },
  correctAnswerLabel: { 
    fontSize: tokens.fontSize.xs, 
    fontWeight: tokens.fontWeight.bold, 
    marginBottom: tokens.spacing.xs 
  },
  correctAnswerText: { 
    fontSize: tokens.fontSize.md, 
    fontWeight: tokens.fontWeight.bold 
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