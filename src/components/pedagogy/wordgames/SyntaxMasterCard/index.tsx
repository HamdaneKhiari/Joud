import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import useWordGameFeedback from '@/screens/WordGames/hooks/useWordGameFeedback';
import { tokens } from '@/themes/tokens';
import { createWordGameStyles } from '../shared/commonWordGameStyles';
import HintToggle from '@/components/common/HintToggle';
import type { SentenceQuestion } from '@/screens/WordGames/schema';

interface WordItem {
  id: string;
  text: string;
}

export interface SyntaxMasterCardProps {
  question: SentenceQuestion;
  selectedOrder: string[];
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  maxAttempts: number;
  onOrder: (orderedWords: string[]) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

const SyntaxMasterCard: React.FC<SyntaxMasterCardProps> = ({
  question,
  selectedOrder,
  isValidated,
  isCorrect,
  attemptCount,
  maxAttempts,
  onOrder,
  onValidate,
  onRetry,
  onNext,
  isLastQuestion,
}) => {
  const { identity } = useTheme();
  const baseStyles = useMemo(() => createWordGameStyles(identity), [identity]);

  // Tap-to-place : les mots passent du pool "words" à la liste ordonnée "ordered"
  const [words, setWords] = useState<WordItem[]>(() =>
    question.words.map((w, i) => ({ id: `w-${i}`, text: w }))
  );
  const [ordered, setOrdered] = useState<WordItem[]>(() =>
    (selectedOrder || []).map((w, i) => ({ id: `o-${i}`, text: w }))
  );

  const { canSkip: _canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    ordered.length > 0
  );

  const feedbackMessage = useWordGameFeedback(isValidated, isCorrect, attemptCount, maxAttempts);

  const handleWordPress = (index: number) => {
    if (!isValidated) {
      const item = words[index];
      const newOrdered = [...ordered, item];
      setOrdered(newOrdered);
      setWords(words.filter((_, i) => i !== index));
      onOrder(newOrdered.map((i) => i.text));
    }
  };

  const handleRemoveWord = (index: number) => {
    if (!isValidated) {
      const item = ordered[index];
      const newOrdered = ordered.filter((_, i) => i !== index);
      setOrdered(newOrdered);
      setWords([...words, item]);
      onOrder(newOrdered.map((i) => i.text));
    }
  };

  const handleReset = () => {
    setOrdered([]);
    setWords(question.words.map((w, i) => ({ id: `w-${i}`, text: w })));
    onOrder([]);
  };

  const isPlayful = identity.ui.mood === 'playful';

  const styles = StyleSheet.create({
    orderedWords: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.spacing.sm,
      minHeight: 60,
      alignItems: 'center',
      justifyContent: isPlayful ? 'center' : 'flex-start',
    },

    emptyText: {
      fontSize: tokens.fontSize.base,
      color: identity.text.tertiary,
      fontStyle: 'italic',
    },

    orderedWord: {
      minHeight: 44,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md,
      backgroundColor: identity.palette.primary,
    },

    orderedWordText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.onPrimary,
    },

    availableWordsContainer: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
    },

    availableLabel: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      marginBottom: tokens.spacing.sm,
    },

    availableWords: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.spacing.sm,
      justifyContent: isPlayful ? 'center' : 'flex-start',
    },

    availableWord: {
      minHeight: 44,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.surface,
    },

    availableWordText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.primary,
    },

    resetButton: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.accent,
      backgroundColor: 'transparent',
      alignItems: 'center',
    },

    resetButtonText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.palette.accent,
    },
  });

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      <View style={baseStyles.card}>
        <View style={baseStyles.colorBar} />

        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>🔤</Text>
          <Text style={baseStyles.titleText}>Arrange the words</Text>
        </View>

        <View style={baseStyles.contentBox}>
          <View style={styles.orderedWords}>
            {ordered.length === 0 ? (
              <Text style={styles.emptyText}>Tap words to arrange...</Text>
            ) : (
              ordered.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.orderedWord}
                  onPress={() => handleRemoveWord(index)}
                  disabled={isValidated}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Retirer "${item.text}"`}
                >
                  <Text style={styles.orderedWordText}>{item.text}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <HintToggle hint={question.hint} />

        <View style={styles.availableWordsContainer}>
          <Text style={styles.availableLabel}>Available words:</Text>
          <View style={styles.availableWords}>
            {words.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.availableWord}
                onPress={() => handleWordPress(index)}
                disabled={isValidated}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Ajouter "${item.text}"`}
              >
                <Text style={styles.availableWordText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {ordered.length > 0 && !isValidated && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Recommencer"
          >
            <Text style={styles.resetButtonText}>↻ Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        correctAnswer={question.correctOrder.join(' ')}
        onValidate={onValidate}
        onNext={onNext}
        onRetry={onRetry}
        onSkip={onNext}
        disabled={buttonDisabled}
        isLastQuestion={isLastQuestion}
        feedbackMessage={feedbackMessage}
      />
    </ScrollView>
  );
};

export default SyntaxMasterCard;
