// ============================================
// FICHIER: src/components/pedagogy/word_games/SpeedMatchCard/index.js
// Speed Match - Matcher traductions avec timer
// ✅ BUGFIX: Vérifier matched avec la bonne valeur
// ✅ AVEC BOUTON CONTINUER
// ============================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './style';
import { Ionicons } from '@expo/vector-icons';

const SpeedMatchCard = ({ game, color = '#8B5CF6', onComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(game.timeLimit);
  const [matched, setMatched] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [enWords] = useState(game.pairs);
  // Non-cryptographic randomness - Safe for educational game shuffling
  // NOSONAR: Math.random() is intentionally used for non-security purposes
  const [frWords] = useState([...game.pairs].sort(() => Math.random() - 0.5));
  const [isGameFinished, setIsGameFinished] = useState(false);

  // Timer
  useEffect(() => {
    if (isGameFinished || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsGameFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameFinished, timeRemaining]);

  const handleEnWordPress = (index) => {
    if (matched.includes(index)) return;
    setSelected(selected === index ? null : index);
  };

  const handleFrWordPress = (frIndex) => {
    if (!selected && selected !== 0) return;

    const enPair = enWords[selected];
    const frPair = frWords[frIndex];

    if (enPair.en === frPair.en) {
      // ✅ BUGFIX: Calculer newMatched AVANT setState
      const newMatched = [...matched, selected, frIndex + game.pairs.length];
      const newScore = score + 10;

      setMatched(newMatched);
      setScore(newScore);
      setSelected(null);

      // ✅ Vérifier avec la NOUVELLE valeur
      if (newMatched.length === game.pairs.length * 2) {
        setIsGameFinished(true);
      }
    } else {
      // Wrong match - deselect
      setSelected(null);
    }
  };

  // =================== LOGIQUE DE FIN ===================
  
  const totalPairs = game.pairs.length;
  const matchedCount = matched.length / 2;
  const isSuccess = matchedCount === totalPairs && timeRemaining > 0;
  const isTimeout = timeRemaining <= 0 && matchedCount < totalPairs;

  // =================== SI JEU TERMINÉ ===================

  if (isGameFinished) {
    let resultMessage = '';
    let resultIcon = '';
    let resultSubtext = '';

    if (isSuccess) {
      // ✅ SUCCÈS - Toutes les paires matched ET du temps restant
      resultMessage = 'Bravo! Tu as réussi!';
      resultIcon = '🎉';
      resultSubtext = `${timeRemaining}s restants!`;
    } else if (isTimeout) {
      // ❌ TIMEOUT - Le temps s'est écoulé
      resultMessage = 'Temps écoulé!';
      resultIcon = '⏰';
      resultSubtext = 'Réessaie pour faire mieux!';
    } else {
      // ⚠️ GAME OVER standard
      resultMessage = 'Game Over!';
      resultIcon = '🏁';
      resultSubtext = 'Continue tes efforts!';
    }

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.card, { borderTopColor: color }]}>
          <View style={[styles.colorBar, { backgroundColor: color }]} />

          <View style={styles.resultSection}>
            <Text style={styles.resultIcon}>{resultIcon}</Text>
            <Text style={styles.resultTitle}>{resultMessage}</Text>
            <Text style={styles.resultScore}>{score} points</Text>
            <Text style={styles.resultMatched}>
              {matchedCount}/{totalPairs} pairs matched
            </Text>
            <Text style={styles.resultSubtext}>{resultSubtext}</Text>

            {/* ✅ BOUTON CONTINUER */}
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: color }]}
              onPress={() => onComplete(score)}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // =================== PENDANT LE JEU ===================

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, { borderTopColor: color }]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        {/* Timer & Score */}
        <View style={styles.headerSection}>
          <View style={styles.timerBox}>
            <Ionicons name="timer" size={24} color={color} />
            <Text style={[styles.timerText, { color }]}>{timeRemaining}s</Text>
          </View>
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            {matchedCount}/{totalPairs} matched
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(matchedCount / totalPairs) * 100}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        </View>

        {/* Instructions */}
        <Text style={styles.instruction}>Match EN ↔ FR quickly!</Text>

        {/* Mots EN (À gauche) */}
        <View style={styles.wordsSection}>
          <Text style={styles.sectionLabel}>🇬🇧 English</Text>
          <View style={styles.wordsList}>
            {enWords.map((pair, index) => {
              const isMatched = matched.includes(index);
              const isSelected = selected === index;

              return (
                <TouchableOpacity
                  key={pair.en}
                  style={[
                    styles.wordButton,
                    { borderColor: color },
                    isMatched && styles.wordButtonMatched,
                    isSelected && styles.wordButtonSelected,
                  ]}
                  onPress={() => handleEnWordPress(index)}
                  disabled={isMatched}
                >
                  <Text
                    style={[
                      styles.wordText,
                      isMatched && styles.wordTextMatched,
                    ]}
                  >
                    {pair.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Mots FR (À droite) */}
        <View style={styles.wordsSection}>
          <Text style={styles.sectionLabel}>🇫🇷 French</Text>
          <View style={styles.wordsList}>
            {frWords.map((pair, index) => {
              const actualIndex = index + game.pairs.length;
              const isMatched = matched.includes(actualIndex);

              return (
                <TouchableOpacity
                  key={pair.fr}
                  style={[
                    styles.wordButton,
                    { borderColor: color },
                    isMatched && styles.wordButtonMatched,
                  ]}
                  onPress={() => handleFrWordPress(index)}
                  disabled={isMatched || !selected && selected !== 0}
                >
                  <Text
                    style={[
                      styles.wordText,
                      isMatched && styles.wordTextMatched,
                    ]}
                  >
                    {pair.fr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

SpeedMatchCard.propTypes = {
  game: PropTypes.shape({
    timeLimit: PropTypes.number,
    pairs: PropTypes.array,
  }).isRequired,
  color: PropTypes.string,
  onComplete: PropTypes.func,
};

export default SpeedMatchCard;