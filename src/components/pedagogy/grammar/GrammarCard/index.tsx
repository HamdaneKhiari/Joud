/**
 * ============================================
 * GRAMMAR CARD - Main Component (Premium No-Media Edition)
 * Design minimaliste et typographique inspiré Apple
 * 100% White Label via ThemeContainer + Identity
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import ThemeContainer from '@/themes/ThemeContainer';
import { getStyles } from './styles';
import { GrammarCardProps } from './types';

const GrammarCard: React.FC<GrammarCardProps> = ({
  lessonData,
  exerciseState,
  onAnswer,
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => getStyles(identity), [identity]);

  const { rule, examples, exercise } = lessonData;
  const { selectedOption, isValidated, isCorrect } = exerciseState;

  /**
   * Détermine le style d'une option selon son état
   */
  const getOptionStyle = (option: string) => {
    if (!isValidated) {
      return option === selectedOption
        ? styles.optionButtonSelected
        : styles.optionButtonDefault;
    }

    // Après validation
    if (option === exercise.correctAnswer) {
      return styles.optionButtonCorrect;
    }

    if (option === selectedOption && !isCorrect) {
      return styles.optionButtonIncorrect;
    }

    return styles.optionButtonDefault;
  };

  /**
   * Détermine le style du texte d'une option
   */
  const getOptionTextStyle = (option: string) => {
    if (!isValidated) {
      return option === selectedOption
        ? styles.optionTextSelected
        : styles.optionTextDefault;
    }

    // Après validation
    if (option === exercise.correctAnswer) {
      return styles.optionTextCorrect;
    }

    if (option === selectedOption && !isCorrect) {
      return styles.optionTextIncorrect;
    }

    return styles.optionTextDefault;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemeContainer
        identity={identity}
        style={styles.themeContainer}
        rounded
      >
        <View style={styles.cardContent}>
          {/* ============================================ */}
          {/* SECTION: RULE (Règle de grammaire) */}
          {/* ============================================ */}
          <View style={styles.ruleSection}>
            <Text style={styles.ruleSectionTitle}>
              RÈGLE
            </Text>
            <Text style={styles.ruleText}>
              {rule}
            </Text>
          </View>

          {/* ============================================ */}
          {/* SECTION: EXAMPLES */}
          {/* ============================================ */}
          {examples && examples.length > 0 && (
            <View style={styles.examplesSection}>
              <Text style={styles.examplesSectionTitle}>
                EXEMPLES
              </Text>
              {examples.map((example, index) => (
                <View key={index} style={styles.exampleItem}>
                  <Text style={styles.exampleText}>
                    {example}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ThemeContainer>

      {/* ============================================ */}
      {/* SECTION: EXERCISE (Question + Options) */}
      {/* Zone blanche séparée du ThemeContainer */}
      {/* ============================================ */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.exerciseSection}>
            <Text style={styles.questionText}>
              {exercise.question}
            </Text>

            <View style={styles.optionsContainer}>
              {exercise.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    getOptionStyle(option),
                    isValidated && styles.optionButtonDisabled,
                  ]}
                  onPress={() => !isValidated && onAnswer(option)}
                  disabled={isValidated}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, getOptionTextStyle(option)]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default GrammarCard;
