import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { getStyles } from './styles';
import type { QuestionCardProps } from './types';
import OptionButton from './OptionButton';
import FeedbackBanner from './feedbackBanner'; // ✅ Ajouté

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  moduleColor,
  externalSelectedOption,
  externalIsAnswered,
  externalIsCorrect,
  externalShowFeedback, // ✅ Récupéré des props
  onAnswer,
  hint,
  feedbackMessage,
  i18n,
}) => {
  const { identity } = useTheme();
  const [showHint, setShowHint] = useState(false);
  
  const brandColor = moduleColor || identity.branding.main;
  const styles = useMemo(() => getStyles(identity, brandColor), [identity, brandColor]);

  const texts = {
    hintShow: i18n?.hintShow || identity.i18n?.hintShow || "Besoin d'aide ?",
    hintHide: i18n?.hintHide || identity.i18n?.hintHide || "Masquer l'indice",
  };

  const icons = {
    hint: identity.icons?.hint || "bulb-outline",
    hideHint: identity.icons?.hideHint || "eye-off-outline",
  };

  // ✅ Transforme l'index en lettre (0 -> A, 1 -> B, etc.)
  const getLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <OptionButton
            key={index}
            letter={getLetter(index)} // ✅ Passé au nouveau OptionButton
            text={option}
            isSelected={externalSelectedOption === option}
            isAnswered={externalIsAnswered || false}
            isCorrect={externalIsCorrect || false}
            brandColor={brandColor}
            onPress={() => onAnswer(option)}
          />
        ))}
      </View>

      {/* ✅ Intégration du Feedback Banner comme dans l'ancienne version JS */}
      {externalShowFeedback && (
        <FeedbackBanner
          isCorrect={externalIsCorrect || false}
          message={feedbackMessage || (externalIsCorrect ? "Correct !" : "Essaie encore !")}
        />
      )}

      {hint && (
        <View style={styles.hintSection}>
          <TouchableOpacity 
            style={styles.hintToggleButton}
            onPress={() => setShowHint(!showHint)}
          >
            <Ionicons 
              name={showHint ? icons.hideHint : icons.hint} 
              size={identity.ui?.iconSize || 18}
              color={brandColor} 
            />
            <Text style={styles.hintToggleText}>
              {showHint ? texts.hintHide : texts.hintShow}
            </Text>
          </TouchableOpacity>

          {showHint && (
            <View style={styles.hintContent}>
              <Text style={styles.hintText}>{hint}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default QuestionCard;