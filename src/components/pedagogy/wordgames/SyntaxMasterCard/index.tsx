/**
 * ============================================
 * SYNTAX MASTER CARD (White Label)
 * Jeu : Remettre des mots dans le bon ordre pour former une phrase
 * ============================================
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

// Composants
import ExerciseValidation from '@/components/common/ExerciseValidation';

// Hooks & Utils
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import { useFeedbackMessages, getFeedbackState } from '@/hooks/exercises/useFeedbackMessages';
import type { FeedbackData } from '@/hooks/exercises/useFeedbackMessages';
import { tokens } from '@/themes/tokens';

// Styles
import { createWordGameStyles } from '../shared/commonWordGameStyles';

// Types
import type { SentenceQuestion } from '@/screens/WordGames/schema';

// ============================================
// TYPES
// ============================================

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

// ============================================
// COMPOSANT
// ============================================

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

  // États locaux pour gérer le drag & drop des mots
  const [words, setWords] = useState<WordItem[]>(() =>
    question.words.map((w, i) => ({ id: `w-${i}`, text: w }))
  );
  const [ordered, setOrdered] = useState<WordItem[]>(() =>
    (selectedOrder || []).map((w, i) => ({ id: `o-${i}`, text: w }))
  );

  // Hook de validation
  const { canSkip: _canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    ordered.length > 0
  );

  // Hook White Label Feedback
  const { getFeedback } = useFeedbackMessages();
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackData | null>(null);

  // Charger le feedback depuis la DB selon l'état
  useEffect(() => {
    const loadFeedback = async () => {
      const feedbackState = getFeedbackState(isValidated, isCorrect, attemptCount, maxAttempts);
      if (feedbackState) {
        const feedback = await getFeedback('wordgames', feedbackState);
        setFeedbackMessage(feedback);
      } else {
        setFeedbackMessage(null);
      }
    };

    loadFeedback();
  }, [isValidated, isCorrect, attemptCount, maxAttempts, getFeedback]);

  // =================== HANDLERS ===================

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

  // =================== STYLES DYNAMIQUES ===================

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
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md,
      backgroundColor: identity.palette.primary, // ✅ White label
    },

    orderedWordText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.onPrimary, // ✅ White label
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
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary, // ✅ White label
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
      borderColor: identity.palette.accent, // ✅ White label
      backgroundColor: 'transparent',
      alignItems: 'center',
    },

    resetButtonText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.palette.accent, // ✅ White label
    },
  });

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      {/* Card principale */}
      <View style={baseStyles.card}>
        {/* Barre couleur (white label) */}
        <View style={baseStyles.colorBar} />

        {/* Titre */}
        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>🔤</Text>
          <Text style={baseStyles.titleText}>Arrange the words</Text>
        </View>

        {/* Phrase ordonnée */}
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
                >
                  <Text style={styles.orderedWordText}>{item.text}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Mots disponibles */}
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
              >
                <Text style={styles.availableWordText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bouton Reset */}
        {ordered.length > 0 && !isValidated && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetButtonText}>↻ Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ExerciseValidation */}
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
