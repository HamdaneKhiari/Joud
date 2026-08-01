import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { getStyles } from './styles';
import type { QuestionCardProps } from './types';
import OptionButton from './OptionButton';
import FeedbackBanner from './feedbackBanner';
import HintToggle from '@/components/common/HintToggle';

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  moduleColor,
  externalSelectedOption,
  externalIsAnswered,
  externalIsCorrect,
  externalShowFeedback,
  onAnswer,
  hint,
  feedbackMessage,
}) => {
  const { identity } = useTheme();

  const brandColor = moduleColor || identity.palette.primary;
  const styles = useMemo(() => getStyles(identity), [identity]);

  const getLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <OptionButton
            key={index}
            letter={getLetter(index)}
            text={option}
            isSelected={externalSelectedOption === option}
            isAnswered={externalIsAnswered || false}
            isCorrect={externalIsCorrect || false}
            brandColor={brandColor}
            onPress={() => onAnswer(option)}
          />
        ))}
      </View>

      {externalShowFeedback && (
        <FeedbackBanner
          isCorrect={externalIsCorrect || false}
          message={feedbackMessage || (externalIsCorrect ? "Correct !" : "Essaie encore !")}
        />
      )}

      <HintToggle hint={hint} brandColor={brandColor} />
    </View>
  );
};

export default QuestionCard;