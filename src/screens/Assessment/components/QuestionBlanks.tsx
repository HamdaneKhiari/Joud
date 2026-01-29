/**
 * ============================================
 * QUESTION BLANKS (TypeScript + White Label)
 * Question avec input texte (remplir le trou)
 * ============================================
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import { QuestionHeader, QuestionExplanation, CorrectAnswerDisplay } from './QuestionParts';
import { useQuestionLogic } from '../hooks/useQuestionLogic';
import type { AssessmentBlanksQuestion } from '../schema';

// ============================================
// TYPES
// ============================================

export interface QuestionBlanksProps {
  question: AssessmentBlanksQuestion;
  onAnswer: (answer: string) => void;
  userAnswer: string | null;
  isValidated: boolean;
  isCorrect: boolean;
}

// ============================================
// COMPOSANT
// ============================================

const QuestionBlanks: React.FC<QuestionBlanksProps> = ({
  question,
  onAnswer,
  userAnswer,
  isValidated,
  isCorrect,
}) => {
  const { identity } = useTheme();
  const { handleInputChange } = useQuestionLogic({
    question,
    onAnswer,
    userAnswer,
    isValidated,
    isCorrect,
  });

  const styles = StyleSheet.create({
    card: {
      margin: tokens.spacing.lg,
      padding: tokens.spacing.lg,
      borderRadius: tokens.borderRadius.lg,
      backgroundColor: identity.palette.surface,
    },
    inputContainer: {
      position: 'relative',
      marginBottom: tokens.spacing.md,
    },
    input: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.background,
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.primary,
    },
    inputCorrect: {
      backgroundColor: baseColors.green50,
      borderColor: baseColors.green500,
    },
    inputIncorrect: {
      backgroundColor: baseColors.red50,
      borderColor: baseColors.red500,
    },
    inputIcon: {
      position: 'absolute',
      right: tokens.spacing.lg,
      top: '50%',
      transform: [{ translateY: -12 }],
      fontSize: tokens.fontSize.xl,
      color: baseColors.green600,
    },
    inputIconIncorrect: {
      position: 'absolute',
      right: tokens.spacing.lg,
      top: '50%',
      transform: [{ translateY: -12 }],
      fontSize: tokens.fontSize.xl,
      color: baseColors.red600,
    },
  });

  return (
    <View style={styles.card}>
      <QuestionHeader question={question} />

      {/* Input pour remplir */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isValidated && isCorrect && styles.inputCorrect,
            isValidated && !isCorrect && styles.inputIncorrect,
          ]}
          placeholder="Your answer..."
          placeholderTextColor={baseColors.gray400}
          value={userAnswer || ''}
          onChangeText={handleInputChange}
          editable={!isValidated}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isValidated && isCorrect && <Text style={styles.inputIcon}>✓</Text>}
        {isValidated && !isCorrect && <Text style={styles.inputIconIncorrect}>✗</Text>}
      </View>

      <CorrectAnswerDisplay
        correctAnswer={question.correctAnswer}
        isValidated={isValidated}
        isCorrect={isCorrect}
      />

      <QuestionExplanation explanation={question.explanation} isValidated={isValidated} />
    </View>
  );
};

export default QuestionBlanks;
