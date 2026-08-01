/**
 * ============================================
 * SENTENCE BLANKS CARD (Mode Primaire)
 * Composant pour compléter une phrase à trous
 * ✅ 100% White Label
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { getSentenceBlanksCardStyles } from './SentenceBlanksCard.styles';
import { SentenceData } from '@/hooks/exercises/useExerciseContent';

interface SentenceBlanksCardProps {
  data: SentenceData;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  isValidated: boolean;
  isCorrect: boolean;
  moduleColor: string;
}

const SentenceBlanksCard: React.FC<SentenceBlanksCardProps> = ({
  data,
  selectedOption,
  onSelectOption,
  isValidated,
  isCorrect,
  moduleColor,
}) => {
  const { identity } = useTheme();

  // Mémorisation des styles avec white label
  const styles = useMemo(
    () => getSentenceBlanksCardStyles(identity, moduleColor),
    [identity, moduleColor]
  );

  // Sépare la phrase au niveau du trou "_"
  const renderSentenceWithBlank = () => {
    const sentenceText = data.sentence_with_blank || data.sentence;
    if (!sentenceText) return null;

    const parts = sentenceText.split('___');
    const before = parts[0] || '';
    const after = parts[1] || '';

    return (
      <View style={styles.sentenceContainer}>
        <Text style={[styles.sentenceText, { color: identity.text.primary }]}>
          {before}
        </Text>
        <View style={[
          styles.blankBox,
          {
            backgroundColor: isValidated
              ? isCorrect
                ? identity.palette.accent + '20'
                : identity.aiDiagnostic.error + '20'
              : identity.text.tertiary + '15',
            borderColor: isValidated
              ? isCorrect
                ? identity.palette.accent
                : identity.aiDiagnostic.error
              : moduleColor,
          },
        ]}>
          <Text
            style={[
              styles.blankText,
              {
                color: isValidated
                  ? isCorrect
                    ? identity.palette.accent
                    : identity.aiDiagnostic.error
                  : identity.text.secondary,
              },
            ]}
          >
            {selectedOption || '___'}
          </Text>
        </View>
        <Text style={[styles.sentenceText, { color: identity.text.primary }]}>
          {after}
        </Text>
      </View>
    );
  };

  // Rendu des boutons d'options
  const renderOptions = () => {
    if (!data.options || isValidated) return null;

    return (
      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => {
          const isSelected = selectedOption === option;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected
                    ? moduleColor
                    : identity.palette.surface,
                  borderColor: isSelected ? moduleColor : identity.text.tertiary + '30',
                },
              ]}
              onPress={() => onSelectOption(option)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={option}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? identity.text.onPrimary : identity.text.primary,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Feedback après validation
  const renderFeedback = () => {
    if (!isValidated) return null;

    return (
      <View style={styles.feedbackContainer}>
        {/* Bloc de la bonne réponse — style conditionné sur isCorrect : le vrai signal
            correct/incorrect vient déjà du blankBox ci-dessus, mais ce bloc gardait toujours
            son style "bonne réponse" (coche verte) même après une réponse fausse, ce qui
            induisait en erreur si on le lisait isolément. */}
        <View
          style={[
            styles.correctAnswerBlock,
            {
              backgroundColor: (isCorrect ? identity.palette.accent : identity.aiDiagnostic.error) + '10',
              borderLeftColor: isCorrect ? identity.palette.accent : identity.aiDiagnostic.error,
            },
          ]}
        >
          <Text style={[styles.correctAnswerLabel, { color: isCorrect ? identity.palette.accent : identity.aiDiagnostic.error }]}>
            {isCorrect ? '✓ BONNE RÉPONSE :' : 'RÉPONSE CORRECTE :'}
          </Text>
          <Text style={[styles.correctAnswerText, { color: identity.text.primary }]}>
            {data.correctAnswer || data.correct_answer}
          </Text>
        </View>

        {/* Traduction (optionnelle) */}
        {data.translation && (
          <View
            style={[
              styles.translationBlock,
              { backgroundColor: identity.palette.surface },
            ]}
          >
            <Text style={[styles.translationLabel, { color: identity.text.secondary }]}>
              Traduction :
            </Text>
            <Text style={[styles.translationText, { color: identity.text.primary }]}>
              {data.translation}
            </Text>
          </View>
        )}

        {/* Explication pédagogique */}
        {data.explanation && (
          <View
            style={[
              styles.explanationBlock,
              {
                backgroundColor: moduleColor + '10',
                borderColor: moduleColor + '20',
              },
            ]}
          >
            <Text style={[styles.explanationTitle, { color: moduleColor }]}>
              💡 POURQUOI ?
            </Text>
            <Text style={[styles.explanationText, { color: identity.text.secondary }]}>
              {data.explanation}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. INSTRUCTION */}
      <View style={styles.instructionBox}>
        <Text style={[styles.instruction, { color: identity.text.secondary }]}>
          Complète la phrase :
        </Text>
      </View>

      {/* 2. PHRASE AVEC TROU */}
      {renderSentenceWithBlank()}

      {/* 3. BLOC ASTUCE (optionnel) */}
      {data.tip && (
        <View style={styles.tipBlock}>
          <Text style={styles.tipLabel}>💡 Tip</Text>
          <Text style={styles.tipText}>{data.tip}</Text>
        </View>
      )}

      {/* 4. OPTIONS DE RÉPONSE */}
      {renderOptions()}

      {/* 5. FEEDBACK APRÈS VALIDATION */}
      {renderFeedback()}
    </View>
  );
};

export default SentenceBlanksCard;
