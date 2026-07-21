import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { createWordGameStyles } from '@/components/pedagogy/wordgames/shared/commonWordGameStyles';
import type { RevisionQuestion } from '@/hooks/revision/useRevisionQuestions';

interface RevisionQuestionCardProps {
  question: RevisionQuestion;
  selectedAnswer: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  onSelectAnswer: (answer: string) => void;
}

const RevisionQuestionCard: React.FC<RevisionQuestionCardProps> = ({
  question,
  selectedAnswer,
  isValidated,
  isCorrect,
  onSelectAnswer,
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createWordGameStyles(identity), [identity]);

  const showFeedback = isValidated;

  return (
    <View style={styles.card}>
      <View style={styles.colorBar} />

      <View style={styles.titleSection}>
        <Text style={styles.titleIcon}>{question.emoji || '❓'}</Text>
        <Text style={styles.titleText}>Révision</Text>
      </View>

      <View style={styles.contentBox}>
        <Text style={styles.contentText}>{question.questionText}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === question.correctAnswer;

          const buttonStyle = [
            styles.optionButton,
            showFeedback && isCorrectOption && styles.optionButtonCorrect,
            showFeedback && isSelected && !isCorrect && styles.optionButtonIncorrect,
            !showFeedback && isSelected && styles.optionButtonSelected,
          ];

          const textStyle = [
            styles.optionText,
            (showFeedback && (isCorrectOption || (isSelected && !isCorrect))) &&
              styles.optionTextWhite,
          ];

          return (
            <TouchableOpacity
              key={option}
              style={buttonStyle}
              onPress={() => !isValidated && onSelectAnswer(option)}
              disabled={isValidated}
              activeOpacity={0.7}
            >
              <Text style={textStyle}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default RevisionQuestionCard;
