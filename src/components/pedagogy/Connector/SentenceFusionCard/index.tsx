import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '../../../common/ExerciseValidation';
import useConnectorFeedback from '../hooks/useConnectorFeedback';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import HintToggle from '@/components/common/HintToggle';
import { SentenceFusionCardProps } from '../types';

const SentenceFusionCard: React.FC<SentenceFusionCardProps & { hideValidation?: boolean; scrollEnabled?: boolean }> = ({
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
  hideValidation = false,
  scrollEnabled = true,
}) => {
  const { identity } = useTheme();

  const { canSkip, validationState, buttonDisabled, feedbackData } = useConnectorFeedback(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!userAnswer && userAnswer.trim().length > 0,
    question.correctAnswer
  );

  const brandColor = color || identity.palette.primary;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} scrollEnabled={scrollEnabled}>
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
          <Text style={styles.titleIcon}>🔀</Text>
          <Text style={[styles.titleText, { color: identity.text.primary }]}>Combine two sentences into one</Text>
        </View>

        <View style={[
          styles.phraseBox, 
          { 
            backgroundColor: withOpacity(brandColor, 0.08), 
            borderLeftColor: brandColor 
          }
        ]}>
          <Text style={[styles.phraseLabel, { color: identity.text.secondary }]}>Phrase 1:</Text>
          <Text style={[styles.phraseText, { color: identity.text.primary }]}>{question.phrase1}</Text>
        </View>

        <View style={[
          styles.phraseBox, 
          { 
            backgroundColor: withOpacity(brandColor, 0.04), 
            borderLeftColor: brandColor 
          }
        ]}>
          <Text style={[styles.phraseLabel, { color: identity.text.secondary }]}>Phrase 2:</Text>
          <Text style={[styles.phraseText, { color: identity.text.primary }]}>{question.phrase2}</Text>
        </View>

        <HintToggle hint={question.hint} brandColor={brandColor} />

        <View style={styles.answerSection}>
          <Text style={[styles.answerLabel, { color: identity.text.primary }]}>Your answer:</Text>
          <TextInput
            style={[
              styles.answerInput,
              {
                borderColor: withOpacity(identity.text.tertiary, 0.2),
                color: identity.text.primary,
                backgroundColor: identity.palette.surface || baseColors.white
              },
              isValidated && isCorrect && { borderColor: baseColors.green500, backgroundColor: baseColors.green50 },
              isValidated && !isCorrect && canSkip && { borderColor: identity.aiDiagnostic.error, backgroundColor: withOpacity(identity.aiDiagnostic.error, 0.05) },
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

        {isValidated && !isCorrect && canSkip && (
          <View style={[
            styles.correctAnswerBox, 
            { backgroundColor: baseColors.green50, borderColor: baseColors.green500 }
          ]}>
            <Text style={[styles.correctAnswerLabel, { color: baseColors.green700 }]}>✅ Correct answer:</Text>
            <Text style={[styles.correctAnswerText, { color: baseColors.green700 }]}>{question.correctAnswer}</Text>
          </View>
        )}

        {question.translation && (
          <View style={[styles.translationBox, { borderTopColor: withOpacity(identity.text.tertiary, 0.1) }]}>
            <Text style={[styles.translationText, { color: identity.text.secondary }]}>{question.translation}</Text>
          </View>
        )}
      </View>

      {!hideValidation && (
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
      )}
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
  phraseBox: { 
    padding: tokens.spacing.md, 
    borderLeftWidth: 4, 
    borderRadius: tokens.borderRadius.sm, 
    marginBottom: tokens.spacing.md 
  },
  phraseLabel: { 
    fontSize: tokens.fontSize.xs, 
    fontWeight: tokens.fontWeight.bold, 
    marginBottom: tokens.spacing.xs, 
    textTransform: 'uppercase' 
  },
  phraseText: { 
    fontSize: tokens.fontSize.md, 
    fontWeight: tokens.fontWeight.medium 
  },
  hintBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: tokens.spacing.sm, 
    marginBottom: tokens.layout.sectionGap, 
    padding: tokens.spacing.sm, 
    borderRadius: tokens.borderRadius.md 
  },
  hintIcon: { fontSize: tokens.fontSize.md },
  hintText: { 
    fontSize: tokens.fontSize.sm, 
    fontStyle: 'italic', 
    flex: 1 
  },
  answerSection: { marginBottom: tokens.layout.sectionGap },
  answerLabel: { 
    fontSize: tokens.fontSize.sm, 
    fontWeight: tokens.fontWeight.bold, 
    marginBottom: tokens.spacing.sm 
  },
  answerInput: { 
    borderWidth: 2, 
    borderRadius: tokens.borderRadius.md, 
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

export default SentenceFusionCard;