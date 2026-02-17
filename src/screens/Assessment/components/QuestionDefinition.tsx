/**
 * ============================================
 * QUESTION DEFINITION (TypeScript + White Label)
 * Question à choix multiples
 * ============================================
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import { QuestionHeader, QuestionExplanation } from './QuestionParts';
import { useQuestionLogic } from '../hooks/useQuestionLogic';
import type { AssessmentDefinitionQuestion } from '../schema';

// ============================================
// TYPES
// ============================================

export interface QuestionDefinitionProps {
  question: AssessmentDefinitionQuestion;
  onAnswer: (answer: string) => void;
  userAnswer: string | null;
  isValidated: boolean;
  isCorrect: boolean;
}

// ============================================
// COMPOSANT
// ============================================

const QuestionDefinition: React.FC<QuestionDefinitionProps> = ({
  question,
  onAnswer,
  userAnswer,
  isValidated,
  isCorrect,
}) => {
  const { identity } = useTheme();
  const { handleSelectOption, getOptionState } = useQuestionLogic({
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
    optionsContainer: {
      gap: tokens.spacing.sm,
    },
    optionButton: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionSelected: {
      backgroundColor: identity.palette.primary + '15',
      borderColor: identity.palette.primary,
    },
    optionCorrect: {
      backgroundColor: baseColors.green500,
      borderColor: baseColors.green600,
    },
    optionIncorrect: {
      backgroundColor: baseColors.red500,
      borderColor: baseColors.red600,
    },
    optionText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.primary,
      flex: 1,
    },
    optionTextSelected: {
      color: identity.palette.primary,
      fontWeight: tokens.fontWeight.bold,
    },
    optionTextCorrect: {
      color: baseColors.white,
    },
    optionTextIncorrect: {
      color: baseColors.white,
    },
    optionIcon: {
      fontSize: tokens.fontSize.xl,
      color: baseColors.white,
      marginLeft: tokens.spacing.sm,
    },
    optionIconIncorrect: {
      fontSize: tokens.fontSize.xl,
      color: baseColors.white,
      marginLeft: tokens.spacing.sm,
    },
  });

  return (
    <View style={styles.card}>
      <QuestionHeader question={question} />

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option) => {
          const optionState = getOptionState(option);

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                optionState.isSelected && !isValidated && styles.optionSelected,
                optionState.showCorrect && styles.optionCorrect,
                optionState.showIncorrect && styles.optionIncorrect,
              ]}
              onPress={() => handleSelectOption(option)}
              disabled={isValidated}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  optionState.isSelected && !isValidated && styles.optionTextSelected,
                  optionState.showCorrect && styles.optionTextCorrect,
                  optionState.showIncorrect && styles.optionTextIncorrect,
                ]}
              >
                {option}
              </Text>
              {optionState.showCorrect && <Text style={styles.optionIcon}>✓</Text>}
              {optionState.showIncorrect && <Text style={styles.optionIconIncorrect}>✗</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <QuestionExplanation explanation={question.explanation} isValidated={isValidated} />
    </View>
  );
};

export default QuestionDefinition;
