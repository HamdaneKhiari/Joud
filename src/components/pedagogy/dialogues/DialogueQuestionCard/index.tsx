import React from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './style';
import QuestionCard from '../../shared/QuestionCard';

export interface Question {
  question?: string;
  text?: string;
  options?: string[];
  correctAnswer: number; // Index de la réponse correcte
  hint?: string;
}

interface DialogueQuestionCardProps {
  question: Question;
  selectedOption?: string;
  isValidated?: boolean;
  isCorrect?: boolean;
  onAnswer?: (option: string) => void;
  color?: string;
}

const DialogueQuestionCard: React.FC<DialogueQuestionCardProps> = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  onAnswer,
  color,
}) => {
  const { identity } = useTheme();
  const styles = createStyles(identity);

  const getLetterFromIndex = (index: number) => String.fromCodePoint(65 + index);
  const handleAnswer = (letter: string) => onAnswer?.(letter);
  const questionOptions = question?.options || [];
  const correctAnswerLetter = getLetterFromIndex(question?.correctAnswer ?? 0);

  const cardColor = color || identity.palette.primary;

  return (
    <View style={[styles.questionContainer, { borderTopColor: cardColor }]}>
      <View style={[styles.colorBar, { backgroundColor: cardColor, shadowColor: cardColor }]} />
      <View style={styles.questionHeader}>
        <Text style={[styles.questionHeaderLabel, { color: cardColor }]}>🎯 Compréhension</Text>
      </View>
      <View style={styles.questionContent}>
        <QuestionCard
          questionIndex={0}
          question={question.question || question.text || ''}
          options={questionOptions}
          correctAnswer={correctAnswerLetter}
          moduleType="dialogue"
          hint={question.hint}
          externalSelectedOption={selectedOption}
          externalIsAnswered={isValidated}
          externalShowFeedback={isValidated}
          externalIsCorrect={isCorrect}
          onAnswer={handleAnswer}
        />
      </View>
    </View>
  );
};

export default DialogueQuestionCard;
