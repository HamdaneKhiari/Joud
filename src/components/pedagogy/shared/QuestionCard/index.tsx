// ============================================
// index.tsx - QuestionCard 100% White Label
// ============================================

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { getStyles } from './styles';
import type { QuestionCardProps } from './types';
import OptionButton from '../OptionButton';

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  moduleColor,
  externalSelectedOption,
  externalIsAnswered,
  externalIsCorrect,
  onAnswer,
  hint,
  // 🆕 Props i18n optionnelles (avec fallback)
  i18n,
}) => {
  const { identity } = useTheme();
  const [showHint, setShowHint] = useState(false);
  
  const brandColor = moduleColor || identity.branding.main;
  const styles = useMemo(() => getStyles(identity, brandColor), [identity, brandColor]);

  // 🆕 Textes i18n avec fallback vers identity ou français par défaut
  const texts = {
    hintShow: i18n?.hintShow || identity.i18n?.hintShow || "Besoin d'aide ?",
    hintHide: i18n?.hintHide || identity.i18n?.hintHide || "Masquer l'indice",
  };

  // 🆕 Icônes avec fallback vers identity ou icônes par défaut
  const icons = {
    hint: identity.icons?.hint || "bulb-outline",
    hideHint: identity.icons?.hideHint || "eye-off-outline",
  };

  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <OptionButton
            key={index}
            label={option}
            isSelected={externalSelectedOption === option}
            isAnswered={externalIsAnswered}
            isCorrect={externalIsCorrect}
            brandColor={brandColor}
            onPress={() => onAnswer(option)}
          />
        ))}
      </View>

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

