// ============================================
// FICHIER: src/components/pedagogy/word_games/SentenceCard/index.js
// Sentence Builder - Réarranger mots pour phrase
// ============================================

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './style';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/exerciseFeedback';

const SentenceCard = ({
  question,
  selectedOrder,
  isValidated,
  isCorrect,
  attemptCount,
  maxAttempts,
  onOrder,
  onValidate,
  onRetry,
  onNext,
  isLastQuestion,
  color = '#8B5CF6',
}) => {
  const [words, setWords] = useState(() => 
    question.words.map((w, i) => ({ id: `w-${i}`, text: w }))
  );
  const [ordered, setOrdered] = useState(() => 
    (selectedOrder || []).map((w, i) => ({ id: `o-${i}`, text: w }))
  );

  // Utilisation du hook pour la validation
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    ordered.length > 0
  );

  const handleWordPress = (index) => {
    if (!isValidated) {
      const item = words[index];
      const newOrdered = [...ordered, item];
      setOrdered(newOrdered);
      setWords(words.filter((_, i) => i !== index));
      onOrder(newOrdered.map(i => i.text));
    }
  };

  const handleRemoveWord = (index) => {
    if (!isValidated) {
      const item = ordered[index];
      const newOrdered = ordered.filter((_, i) => i !== index);
      setOrdered(newOrdered);
      setWords([...words, item]);
      onOrder(newOrdered.map(i => i.text));
    }
  };

  const handleReset = () => {
    setOrdered([]);
    setWords(question.words.map((w, i) => ({ id: `w-${i}`, text: w })));
    onOrder([]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, { borderTopColor: color }]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>🔤</Text>
          <Text style={styles.titleText}>Arrange the words</Text>
        </View>

        {/* Phrase ordonnée */}
        <View style={[styles.sentenceBox, { borderColor: color }]}>
          <View style={styles.orderedWords}>
            {ordered.length === 0 ? (
              <Text style={styles.emptyText}>Tap words to arrange...</Text>
            ) : (
              ordered.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.orderedWord, { backgroundColor: color }]}
                  onPress={() => handleRemoveWord(index)}
                  disabled={isValidated}
                >
                  <Text style={styles.orderedWordText}>{item.text}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Mots disponibles */}
        <View style={styles.availableWordsContainer}>
          <Text style={styles.availableLabel}>Available words:</Text>
          <View style={styles.availableWords}>
            {words.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.availableWord, { borderColor: color }]}
                onPress={() => handleWordPress(index)}
                disabled={isValidated}
              >
                <Text style={styles.availableWordText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {ordered.length > 0 && !isValidated && (
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: color }]}
            onPress={handleReset}
          >
            <Text style={[styles.resetButtonText, { color: color }]}>↻ Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        correctAnswer={question.correct.join(' ')}
        onValidate={onValidate}
        onNext={onNext}
        onRetry={onRetry}
        onSkip={onNext}
        disabled={buttonDisabled}
        isLastQuestion={isLastQuestion}
        feedbackMessage={generateFeedbackMessage(
          isValidated,
          isCorrect,
          canSkip,
          question.correct,
          attemptCount,
          maxAttempts
        )}
      />
    </ScrollView>
  );
};

SentenceCard.propTypes = {
  question: PropTypes.shape({
    words: PropTypes.array,
    correct: PropTypes.array,
  }).isRequired,
  selectedOrder: PropTypes.array,
  isValidated: PropTypes.bool,
  isCorrect: PropTypes.bool,
  attemptCount: PropTypes.number,
  maxAttempts: PropTypes.number,
  onOrder: PropTypes.func,
  onValidate: PropTypes.func,
  onRetry: PropTypes.func,
  onNext: PropTypes.func,
  isLastQuestion: PropTypes.bool,
  color: PropTypes.string,
};

export default SentenceCard;