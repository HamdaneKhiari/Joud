/**
 * ============================================
 * QUESTION CARD (TypeScript Premium Edition)
 * Composant universel pour questions à choix multiples
 * Version No-Media avec types stricts
 * ============================================
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { getStyles } from './styles';
import type { QuestionCardProps } from './types';
import OptionButton from '../OptionButton';
import FeedbackBanner from '../FeedbackBanner';

/**
 * QuestionCard - Composant universel pour questions à choix multiples
 *
 * ✅ ENTIÈREMENT CONTRÔLÉ PAR LE PARENT
 *
 * Le parent gère:
 * - Quand une option est sélectionnée
 * - Quand afficher le feedback
 * - Les états correct/incorrect
 * - Les tentatives et resets
 *
 * QuestionCard ne fait que:
 * - Afficher les options
 * - Appeler onAnswer(letter) au clic
 * - Afficher le feedback si demandé
 *
 * Utilisable dans: Grammar, Reading, Vocab, etc.
 */
const QuestionCard: React.FC<QuestionCardProps> = ({
  questionIndex,
  question,
  options,
  correctAnswer,
  moduleType = 'grammar',

  // Props de contrôle (du parent)
  externalSelectedOption = null,
  externalIsAnswered = false,
  externalShowFeedback = false,
  externalIsCorrect = false,
  onAnswer,

  // Props optionnels
  stars = 3,
  showStars = false,
  hint,
  hintUsed = false,
  onToggleHint,
  feedbackMessage,
  theme = 'light',
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => getStyles(identity), [identity]);

  const [showHint, setShowHint] = useState(false);
  const isDark = theme === 'dark';

  /**
   * ✅ Quand une option est cliquée:
   * On juste appelle le callback parent
   * C'est TOUT! Pas de logique de validation ici!
   */
  const handleAnswer = (letter: string) => {
    // Si la question est déjà répondue, on ignore
    if (externalIsAnswered) return;

    // Juste appeler le parent
    onAnswer(letter);
  };

  const handleToggleHint = () => {
    setShowHint(!showHint);
    if (!showHint && !hintUsed && onToggleHint) {
      onToggleHint();
    }
  };

  const renderStars = () => {
    if (!showStars) return null;

    return (
      <View style={styles.starsIndicator}>
        {[1, 2, 3].map((star) => (
          <Text key={star} style={[styles.star, star <= stars && styles.starActive]}>
            ⭐
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.questionCard,
        styles[`questionCard_${moduleType}` as keyof typeof styles],
        isDark && styles.questionCardDark,
      ]}
    >
      {/* Header avec étoiles */}
      <View style={styles.questionHeader}>
        <View style={styles.questionTextContainer}>
          <View style={[styles.questionNumber, styles[`questionNumber_${moduleType}` as keyof typeof styles]]}>
            <Text style={styles.questionNumberText}>{questionIndex + 1}</Text>
          </View>
          <Text style={[styles.questionText, isDark && styles.questionTextDark]}>
            {question}
          </Text>
        </View>
        {renderStars()}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = externalSelectedOption === letter;
          const isCorrectOption = letter === correctAnswer;

          return (
            <OptionButton
              key={option}
              letter={letter}
              text={option}
              isSelected={isSelected}
              isCorrect={isCorrectOption}
              isAnswered={externalIsAnswered}
              moduleType={moduleType}
              theme={theme}
              onPress={() => handleAnswer(letter)}
            />
          );
        })}
      </View>

      {/* Section Indice */}
      {hint && (
        <View style={styles.hintSection}>
          <TouchableOpacity
            style={[
              styles.hintToggleButton,
              styles[`hintToggleButton_${moduleType}` as keyof typeof styles],
              hintUsed && styles.hintToggleButtonUsed,
            ]}
            onPress={handleToggleHint}
          >
            <Text style={styles.hintToggleText}>
              {showHint ? 'Hide hint' : 'Show hint'}
            </Text>
          </TouchableOpacity>

          {showHint && (
            <View
              style={[
                styles.hintContent,
                styles[`hintContent_${moduleType}` as keyof typeof styles],
                isDark && styles.hintContentDark,
              ]}
            >
              <Text style={[styles.hintText, isDark && styles.hintTextDark]}>{hint}</Text>
            </View>
          )}
        </View>
      )}

      {/* ✅ NO-MEDIA: Feedback sans emoji */}
      {externalShowFeedback && (
        <FeedbackBanner
          isCorrect={externalIsCorrect}
          message={
            feedbackMessage ||
            (externalIsCorrect ? 'CORRECT' : 'ESSAIE ENCORE')
          }
        />
      )}
    </View>
  );
};

export default QuestionCard;
