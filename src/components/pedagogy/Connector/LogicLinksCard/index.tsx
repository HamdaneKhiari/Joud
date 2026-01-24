import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '../../../common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/exercises/useExerciceValidationState';
import { generateFeedbackMessage } from '../../../../utils/feedback';
import { useTheme } from '@/themes/ThemeContext';
// ✅ Imports corrigés pour correspondre à tes fichiers
import { tokens, withOpacity } from '@/themes/tokens';
import { baseColors } from '@/themes/colors'; 
import { LogicLinksCardProps } from '../types';

const LogicLinksCard: React.FC<LogicLinksCardProps> = ({
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
  const { identity } = useTheme();

  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedOption
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[
        styles.card, 
        { 
          backgroundColor: identity.branding.surface || baseColors.white,
          borderTopColor: color,
          borderRadius: identity.ui.cardRadius || tokens.borderRadius.lg,
          ...tokens.shadows.md 
        }
      ]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>🔗</Text>
          <Text style={[styles.titleText, { color: identity.text.primary }]}>
            Choose the logical connector
          </Text>
        </View>

        <View style={[
          styles.sentenceBox, 
          { 
            borderColor: withOpacity(color, 0.3),
            backgroundColor: withOpacity(color, 0.05) 
          }
        ]}>
          <Text style={[styles.sentenceText, { color: identity.text.primary }]}>
            {question.sentence}
          </Text>
        </View>

        {question.translation && (
          <View style={styles.translationBox}>
            <Text style={[styles.translationText, { color: identity.text.secondary }]}>
              {question.translation}
            </Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;
            const showFeedback = isValidated && (isCorrect || canSkip);

            // ✅ CORRECTION DES COULEURS (baseColors au lieu de tokens.colors)
            const getButtonStyle = () => {
              if (showFeedback && isCorrectOption) 
                return { backgroundColor: baseColors.green500, borderColor: baseColors.green500 };
              
              if (showFeedback && isSelected && !isCorrect) 
                return { backgroundColor: identity.ai.error, borderColor: identity.ai.error };
              
              if (!showFeedback && isSelected) 
                return { backgroundColor: withOpacity(color, 0.1), borderColor: color };
              
              return { 
                backgroundColor: identity.branding.surface || baseColors.white, 
                borderColor: withOpacity(identity.text.tertiary, 0.2) 
              };
            };

            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, getButtonStyle()]}
                onPress={() => !isValidated && onAnswer(option)}
                disabled={isValidated}
              >
                <Text style={[
                  styles.optionText,
                  { 
                    color: (showFeedback && (isCorrectOption || isSelected)) 
                      ? baseColors.white 
                      : identity.text.primary 
                  }
                ]}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    padding: tokens.layout.screenPadding, 
    paddingBottom: 100 
  },
  card: { 
    padding: tokens.layout.cardPadding, 
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
  sentenceBox: { 
    padding: tokens.spacing.xl, 
    borderWidth: 2, 
    borderRadius: tokens.borderRadius.md, 
    marginBottom: tokens.layout.sectionGap, 
    alignItems: 'center', 
    borderStyle: 'dashed' 
  },
  sentenceText: { 
    fontSize: tokens.fontSize.xl, 
    fontWeight: tokens.fontWeight.medium, 
    textAlign: 'center' 
  },
  translationBox: { 
    marginTop: -tokens.spacing.md, 
    marginBottom: tokens.layout.sectionGap, 
    alignItems: 'center' 
  },
  translationText: { 
    fontSize: tokens.fontSize.sm, 
    fontStyle: 'italic', 
    opacity: tokens.opacity.subtle 
  },
  optionsContainer: { gap: tokens.spacing.md },
  optionButton: { 
    padding: tokens.spacing.lg, 
    borderWidth: 1, 
    borderRadius: tokens.borderRadius.md, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    ...tokens.shadows.sm 
  },
  optionText: { 
    fontSize: tokens.fontSize.md, 
    fontWeight: tokens.fontWeight.medium 
  },
});

export default LogicLinksCard;