// ============================================
// FICHIER: src/screens/exercises/Assessment/components/QuestionSentence.js
// ✅ REFACTORISÉ - Utilise les composants partagés
// ============================================

import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text } from 'react-native';
import { questionStyles } from '../styles/questionStyles';
import { QuestionHeader, QuestionPassage, QuestionExplanation } from './QuestionParts';
import { useQuestionLogic } from '../hooks/useQuestionLogic';

/**
 * QuestionSentence - Question avec phrases complètes (choix multiples)
 * ✅ Version refactorisée sans duplication
 */
const QuestionSentence = ({ question, onAnswer, userAnswer, isValidated, isCorrect, color }) => {
  const { handleSelectOption, getOptionState } = useQuestionLogic({
    question,
    onAnswer,
    userAnswer,
    isValidated,
    isCorrect,
  });

  return (
    <View style={questionStyles.card}>
      <QuestionHeader question={question} />
      <QuestionPassage passage={question.passage} />

      {/* Options */}
      <View style={questionStyles.optionsContainer}>
        {question.options.map((option, index) => {
          const optionState = getOptionState(option);

          return (
            <TouchableOpacity
              key={option}
              style={[
                questionStyles.optionButton,
                optionState.isSelected && !isValidated && questionStyles.optionSelected,
                optionState.isSelected && !isValidated && { borderColor: color },
                optionState.showCorrect && questionStyles.optionCorrect,
                optionState.showIncorrect && questionStyles.optionIncorrect,
              ]}
              onPress={() => handleSelectOption(option)}
              disabled={isValidated}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  questionStyles.optionText,
                  optionState.isSelected && !isValidated && questionStyles.optionTextSelected,
                  optionState.isSelected && !isValidated && { color },
                  optionState.showCorrect && questionStyles.optionTextCorrect,
                  optionState.showIncorrect && questionStyles.optionTextIncorrect,
                ]}
              >
                {option}
              </Text>
              {optionState.showCorrect && <Text style={questionStyles.optionIcon}>✓</Text>}
              {optionState.showIncorrect && <Text style={questionStyles.optionIconIncorrect}>✗</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <QuestionExplanation explanation={question.explanation} isValidated={isValidated} />
    </View>
  );
};

QuestionSentence.propTypes = {
  question: PropTypes.object.isRequired,
  onAnswer: PropTypes.func.isRequired,
  userAnswer: PropTypes.string,
  isValidated: PropTypes.bool,
  isCorrect: PropTypes.bool,
  color: PropTypes.string,
};

export default QuestionSentence;