/**
 * ============================================
 * QUESTION PARTS (TypeScript + White Label)
 * Composants réutilisables pour les parties communes des questions
 * ============================================
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';

// ============================================
// TYPES
// ============================================

interface QuestionHeaderProps {
  question: {
    question: string;
    questionFr: string;
  };
}

interface QuestionPassageProps {
  passage?: string;
}

interface QuestionExplanationProps {
  explanation?: string;
  isValidated: boolean;
}

interface CorrectAnswerDisplayProps {
  correctAnswer: string;
  isValidated: boolean;
  isCorrect: boolean;
}

// ============================================
// COMPOSANTS
// ============================================

/**
 * En-tête de question (utilisé par tous les types)
 */
export const QuestionHeader: React.FC<QuestionHeaderProps> = ({ question }) => {
  const { identity } = useTheme();

  const styles = StyleSheet.create({
    questionContainer: {
      marginBottom: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.lg,
    },
    questionText: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
      marginBottom: tokens.spacing.sm,
    },
    questionTextFr: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.question}</Text>
      <Text style={styles.questionTextFr}>{question.questionFr}</Text>
    </View>
  );
};

/**
 * Passage de texte (pour les questions de lecture)
 */
export const QuestionPassage: React.FC<QuestionPassageProps> = ({ passage }) => {
  const { identity } = useTheme();

  if (!passage) return null;

  const styles = StyleSheet.create({
    passageContainer: {
      marginHorizontal: tokens.spacing.lg,
      marginBottom: tokens.spacing.lg,
      padding: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: identity.palette.background,
      borderWidth: 2,
      borderColor: identity.palette.accent,
    },
    passageText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.primary,
      lineHeight: tokens.fontSize.base * 1.5,
    },
  });

  return (
    <View style={styles.passageContainer}>
      <Text style={styles.passageText}>{passage}</Text>
    </View>
  );
};

/**
 * Explication après validation
 */
export const QuestionExplanation: React.FC<QuestionExplanationProps> = ({
  explanation,
  isValidated,
}) => {
  const { identity } = useTheme();

  if (!isValidated || !explanation) return null;

  const styles = StyleSheet.create({
    explanationContainer: {
      marginHorizontal: tokens.spacing.lg,
      marginTop: tokens.spacing.md,
      padding: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: baseColors.blue50,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: tokens.spacing.sm,
    },
    explanationIcon: {
      fontSize: tokens.fontSize.xl,
    },
    explanationText: {
      flex: 1,
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: baseColors.blue800,
      lineHeight: tokens.fontSize.base * 1.5,
    },
  });

  return (
    <View style={styles.explanationContainer}>
      <Text style={styles.explanationIcon}>💡</Text>
      <Text style={styles.explanationText}>{explanation}</Text>
    </View>
  );
};

/**
 * Affichage de la bonne réponse (pour les inputs)
 */
export const CorrectAnswerDisplay: React.FC<CorrectAnswerDisplayProps> = ({
  correctAnswer,
  isValidated,
  isCorrect,
}) => {
  const { identity } = useTheme();

  if (!isValidated || isCorrect) return null;

  const styles = StyleSheet.create({
    correctAnswerContainer: {
      marginHorizontal: tokens.spacing.lg,
      marginTop: tokens.spacing.sm,
      padding: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.sm,
      backgroundColor: baseColors.green50,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
    },
    correctAnswerLabel: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.semibold,
      color: baseColors.green800,
    },
    correctAnswerText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color: baseColors.green900,
    },
  });

  return (
    <View style={styles.correctAnswerContainer}>
      <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
      <Text style={styles.correctAnswerText}>{correctAnswer}</Text>
    </View>
  );
};
