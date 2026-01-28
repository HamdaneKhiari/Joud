// ============================================
// FICHIER: src/screens/exercises/Assessment/components/QuestionBlanks.js
// ✅ REFACTORISÉ - Utilise les composants partagés
// ============================================

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TextInput } from 'react-native';
import { questionStyles } from '../styles/questionStyles';
import { QuestionHeader, QuestionExplanation, CorrectAnswerDisplay } from './QuestionParts';
import { useQuestionLogic } from '../hooks/useQuestionLogic';
import { baseColors } from '@themes/colors';

/**
 * QuestionBlanks - Question avec input (remplir le trou)
 * ✅ Version refactorisée sans duplication
 */
const QuestionBlanks = ({ question, onAnswer, userAnswer, isValidated, isCorrect, color }) => {
  const { handleInputChange } = useQuestionLogic({
    question,
    onAnswer,
    userAnswer,
    isValidated,
    isCorrect,
  });

  return (
    <View style={questionStyles.card}>
      <QuestionHeader question={question} />

      {/* Input pour remplir */}
      <View style={questionStyles.inputContainer}>
        <TextInput
          style={[
            questionStyles.input,
            isValidated && isCorrect && questionStyles.inputCorrect,
            isValidated && !isCorrect && questionStyles.inputIncorrect,
            !isValidated && userAnswer && { borderColor: color },
          ]}
          placeholder="Ta réponse..."
          placeholderTextColor={baseColors.gray400}
          value={userAnswer || ''}
          onChangeText={handleInputChange}
          editable={!isValidated}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isValidated && isCorrect && <Text style={questionStyles.inputIcon}>✓</Text>}
        {isValidated && !isCorrect && <Text style={questionStyles.inputIconIncorrect}>✗</Text>}
      </View>

      <CorrectAnswerDisplay 
        correctAnswer={question.correctAnswer} 
        isValidated={isValidated} 
        isCorrect={isCorrect} 
      />

      <QuestionExplanation explanation={question.explanation} isValidated={isValidated} />
    </View>
  );
};

QuestionBlanks.propTypes = {
  question: PropTypes.object.isRequired,
  onAnswer: PropTypes.func.isRequired,
  userAnswer: PropTypes.string,
  isValidated: PropTypes.bool,
  isCorrect: PropTypes.bool,
  color: PropTypes.string,
};

export default QuestionBlanks;