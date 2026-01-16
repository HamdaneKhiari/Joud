// ============================================
// FICHIER: src/components/pedagogy/shared/QuestionCard/index.jsx
// VERSION FIXÉE - Composant stupide et contrôlé par parent
// ============================================

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './style';
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
 *
 * @param {number} questionIndex - Index de la question (pour affichage)
 * @param {string} question - Texte de la question
 * @param {Array<string>} options - Options (ex: ['Six years old', 'Eight years old', ...])
 * @param {string} correctAnswer - Lettre de la bonne réponse ('A', 'B', 'C')
 * @param {string} moduleType - Type de module ('grammar' | 'reading' | 'vocab')
 * 
 * PROPS DE CONTRÔLE (du parent):
 * @param {string} externalSelectedOption - Option sélectionnée ('A', 'B', 'C')
 * @param {boolean} externalIsAnswered - La question est répondue?
 * @param {boolean} externalShowFeedback - Afficher le feedback?
 * @param {boolean} externalIsCorrect - La réponse était correcte?
 * @param {Function} onAnswer - Callback: (letter) => void
 * 
 * PROPS OPTIONNELS:
 * @param {number} stars - Nombre d'étoiles (pour reading)
 * @param {boolean} showStars - Afficher les étoiles?
 * @param {string} hint - Texte de l'indice
 * @param {boolean} hintUsed - L'indice a-t-il été utilisé?
 * @param {Function} onToggleHint - Callback toggle indice
 * @param {string} feedbackMessage - Message personnalisé du feedback
 * @param {string} theme - 'light' | 'dark'
 */
const QuestionCard = ({
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
  const [showHint, setShowHint] = useState(false);
  const isDark = theme === 'dark';

  /**
   * ✅ Quand une option est cliquée:
   * On juste appelle le callback parent
   * C'est TOUT! Pas de logique de validation ici!
   */
  const handleAnswer = letter => {
    // Si la question est déjà répondue, on ignore
    if (externalIsAnswered) return;
    
    // Juste appeler le parent
    if (onAnswer) {
      onAnswer(letter);
    }
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
        {[1, 2, 3].map(star => (
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
        styles[`questionCard_${moduleType}`],
        isDark && styles.questionCardDark,
      ]}
    >
      {/* Header avec étoiles */}
      <View style={styles.questionHeader}>
        <View style={styles.questionTextContainer}>
          <View style={[styles.questionNumber, styles[`questionNumber_${moduleType}`]]}>
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

      {/* Section Indice - Version College sobre */}
      {hint && (
        <View style={styles.hintSection}>
          <TouchableOpacity
            style={[
              styles.hintToggleButton,
              styles[`hintToggleButton_${moduleType}`],
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
                styles[`hintContent_${moduleType}`],
                isDark && styles.hintContentDark,
              ]}
            >
              <Text style={[styles.hintText, isDark && styles.hintTextDark]}>{hint}</Text>
            </View>
          )}
        </View>
      )}

      {/* ✅ FEEDBACK - Affiché SEULEMENT si parent dit oui */}
      {externalShowFeedback && (
        <FeedbackBanner
          isCorrect={externalIsCorrect}
          message={
            feedbackMessage ||
            (externalIsCorrect ? '✅ Correct !' : '❌ Essaie encore !')
          }
        />
      )}
    </View>
  );
};

QuestionCard.propTypes = {
  // Props de base
  questionIndex: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  correctAnswer: PropTypes.string.isRequired,
  moduleType: PropTypes.oneOf(['grammar', 'reading', 'vocab']),
  
  // Props de contrôle (du parent)
  externalSelectedOption: PropTypes.string,
  externalIsAnswered: PropTypes.bool,
  externalShowFeedback: PropTypes.bool,
  externalIsCorrect: PropTypes.bool,
  onAnswer: PropTypes.func.isRequired,
  
  // Props optionnels
  stars: PropTypes.number,
  showStars: PropTypes.bool,
  hint: PropTypes.string,
  hintUsed: PropTypes.bool,
  onToggleHint: PropTypes.func,
  feedbackMessage: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark']),
};

export default QuestionCard;