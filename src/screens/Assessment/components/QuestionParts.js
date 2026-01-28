// ============================================
// FICHIER: src/screens/exercises/Assessment/components/QuestionParts.js
// 🧩 Composants réutilisables pour les parties communes des questions
// ============================================

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import { questionStyles } from '../styles/questionStyles';

/**
 * En-tête de question (utilisé par tous les types)
 */
export const QuestionHeader = ({ question }) => (
  <View style={questionStyles.questionContainer}>
    <Text style={questionStyles.questionText}>{question.question}</Text>
    <Text style={questionStyles.questionTextFr}>{question.questionFr}</Text>
  </View>
);

QuestionHeader.propTypes = {
  question: PropTypes.shape({
    question: PropTypes.string.isRequired,
    questionFr: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Passage de texte (pour les questions de lecture)
 */
export const QuestionPassage = ({ passage }) => {
  if (!passage) return null;
  
  return (
    <View style={questionStyles.passageContainer}>
      <Text style={questionStyles.passageText}>{passage}</Text>
    </View>
  );
};

QuestionPassage.propTypes = {
  passage: PropTypes.string,
};

/**
 * Explication après validation
 */
export const QuestionExplanation = ({ explanation, isValidated }) => {
  if (!isValidated || !explanation) return null;

  return (
    <View style={questionStyles.explanationContainer}>
      <Text style={questionStyles.explanationIcon}>💡</Text>
      <Text style={questionStyles.explanationText}>{explanation}</Text>
    </View>
  );
};

QuestionExplanation.propTypes = {
  explanation: PropTypes.string,
  isValidated: PropTypes.bool,
};

/**
 * Affichage de la bonne réponse (pour les inputs)
 */
export const CorrectAnswerDisplay = ({ correctAnswer, isValidated, isCorrect }) => {
  if (!isValidated || isCorrect) return null;

  return (
    <View style={questionStyles.correctAnswerContainer}>
      <Text style={questionStyles.correctAnswerLabel}>Bonne réponse :</Text>
      <Text style={questionStyles.correctAnswerText}>{correctAnswer}</Text>
    </View>
  );
};

CorrectAnswerDisplay.propTypes = {
  correctAnswer: PropTypes.string.isRequired,
  isValidated: PropTypes.bool,
  isCorrect: PropTypes.bool,
};