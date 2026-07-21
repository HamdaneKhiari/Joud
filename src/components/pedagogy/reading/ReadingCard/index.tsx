import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import QuestionCard from '../../shared/QuestionCard';

interface ReadingCardProps {
  question: {
    passage: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    hint?: string;
  };
  selectedOption?: string;
  isValidated: boolean;
  isCorrect: boolean;
  onAnswer: (option: string) => void;
  color?: string;
}

const ReadingCard: React.FC<ReadingCardProps> = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  onAnswer,
  color,
}) => {
  const { identity } = useTheme();
  const brandColor = color || identity.palette.primary;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[
        styles.passageCard,
        {
          backgroundColor: identity.palette.surface,
          borderTopColor: brandColor,
          borderRadius: identity.ui?.cardRadius || tokens.borderRadius.lg
        }
      ]}>
        <Text style={[styles.cardTitle, { color: identity.text.secondary }]}>
          READING
        </Text>

        <ScrollView
          style={styles.passageScroll}
          contentContainerStyle={styles.passageBox}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled
        >
          <View style={[styles.accentLine, { backgroundColor: brandColor }]} />
          <Text style={[
            styles.passageText,
            {
              color: identity.text.primary,
              fontSize: tokens.fontSize.base,
              lineHeight: tokens.fontSize.base * 1.6
            }
          ]}>
            {question.passage}
          </Text>
        </ScrollView>
      </View>

      <View style={styles.questionSection}>
        <QuestionCard
          question={question.question_text}
          options={question.options}
          correctAnswer={question.correct_answer}
          moduleColor={brandColor}
          externalSelectedOption={selectedOption}
          externalIsAnswered={isValidated}
          externalIsCorrect={isCorrect}
          onAnswer={onAnswer}
          hint={question.hint}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: tokens.layout.screenPadding, paddingBottom: 140 },
  passageCard: {
    padding: tokens.spacing.lg,
    borderTopWidth: 4,
    marginBottom: tokens.spacing.xl,
    ...tokens.shadows.sm,
  },
  cardTitle: {
    fontWeight: tokens.fontWeight.extrabold,
    fontSize: tokens.fontSize.xs,
    letterSpacing: 1.2,
    marginBottom: tokens.spacing.md,
    textTransform: 'uppercase',
  },
  passageScroll: { maxHeight: 200 },
  passageBox: { flexDirection: 'row', gap: tokens.spacing.md },
  accentLine: { width: 3, borderRadius: 2, opacity: 0.6 },
  passageText: { flex: 1, fontWeight: '400' },
  questionSection: { marginBottom: tokens.spacing.xl },
});

export default ReadingCard;
