/**
 * ============================================
 * GRAMMAR CARD - Main Component
 * Design épuré avec accents colorés
 * 100% White Label via Identity
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { getStyles } from './styles';
import { GrammarCardProps } from './types';

const GrammarCard: React.FC<GrammarCardProps> = ({
  lessonData,
  exerciseState,
  onAnswer,
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => getStyles(identity), [identity]);

  const { title, rule, simplified, examples, exercise } = lessonData;
  const { selectedOption, isValidated, isCorrect } = exerciseState;

  const getOptionStyle = (option: string) => {
    if (!isValidated) {
      return option === selectedOption
        ? styles.optionButtonSelected
        : styles.optionButtonDefault;
    }
    if (option === exercise.correctAnswer) return styles.optionButtonCorrect;
    if (option === selectedOption && !isCorrect) return styles.optionButtonIncorrect;
    return styles.optionButtonDefault;
  };

  const getOptionTextStyle = (option: string) => {
    if (!isValidated) {
      return option === selectedOption
        ? styles.optionTextSelected
        : styles.optionTextDefault;
    }
    if (option === exercise.correctAnswer) return styles.optionTextCorrect;
    if (option === selectedOption && !isCorrect) return styles.optionTextIncorrect;
    return styles.optionTextDefault;
  };

  const primaryColor = identity.palette.primary;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* RULE CARD — fond teinté avec accent gauche */}
      <View style={[
        styles.ruleCard,
        {
          backgroundColor: primaryColor + '0A',
          borderColor: primaryColor + '20',
          borderLeftColor: primaryColor,
        }
      ]}>
        <View style={styles.cardContent}>
          {/* Titre de la règle */}
          {title ? (
            <View style={[styles.titleBadge, { backgroundColor: primaryColor + '18' }]}>
              <Text style={[styles.titleBadgeText, { color: primaryColor }]}>
                {title}
              </Text>
            </View>
          ) : null}

          {/* Explication principale */}
          <Text style={[styles.ruleText, { color: identity.text.primary }]}>
            {rule}
          </Text>
        </View>
      </View>

      {/* EXAMPLES — items avec puce colorée */}
      {examples && examples.length > 0 && (
        <View style={styles.examplesContainer}>
          <Text style={[styles.sectionLabel, { color: identity.text.secondary }]}>
            EXEMPLES
          </Text>
          {examples.map((example, index) => (
            <View key={index} style={styles.exampleRow}>
              <View style={[styles.exampleBullet, { backgroundColor: primaryColor }]} />
              <Text style={[styles.exampleText, { color: identity.text.primary }]}>
                {example}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* EN BREF — explication vulgarisée, après les exemples */}
      {simplified ? (
        <View style={[styles.simplifiedBox, { backgroundColor: primaryColor + '0A', borderLeftColor: primaryColor }]}>
          <Text style={[styles.simplifiedLabel, { color: primaryColor }]}>
            En bref
          </Text>
          <Text style={[styles.simplifiedText, { color: identity.text.secondary }]}>
            {simplified}
          </Text>
        </View>
      ) : null}

      {/* EXERCISE — Question + Options */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={[styles.sectionLabel, { color: identity.text.secondary }]}>
            EXERCICE
          </Text>
          <Text style={[styles.questionText, { color: identity.text.primary }]}>
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
    </ScrollView>
  );
};

export default GrammarCard;
