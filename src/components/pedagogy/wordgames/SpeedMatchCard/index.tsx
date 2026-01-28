/**
 * ============================================
 * SPEED MATCH CARD (White Label)
 * Jeu : Associer rapidement des mots EN-FR contre la montre
 * ============================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Hooks & Utils
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';

// Styles
import { createWordGameStyles } from '../shared/commonWordGameStyles';

// Types
import type { SpeedMatchQuestion } from '@/screens/WordGames/schema';

// ============================================
// TYPES
// ============================================

interface Pair {
  english: string;
  french: string;
}

export interface SpeedMatchCardProps {
  game: SpeedMatchQuestion;
  onComplete: (score: number) => void;
}

// ============================================
// COMPOSANT
// ============================================

const SpeedMatchCard: React.FC<SpeedMatchCardProps> = ({ game, onComplete }) => {
  const { identity } = useTheme();
  const baseStyles = useMemo(() => createWordGameStyles(identity), [identity]);

  // =================== STATE ===================

  const [timeRemaining, setTimeRemaining] = useState(game.timeLimit);
  const [matched, setMatched] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [enWords] = useState<Pair[]>(game.pairs);
  const [frWords] = useState<Pair[]>(() => [...game.pairs].sort(() => Math.random() - 0.5));
  const [isGameFinished, setIsGameFinished] = useState(false);

  const isPlayful = identity.ui.mood === 'playful';

  // =================== TIMER ===================

  useEffect(() => {
    if (isGameFinished || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameFinished, timeRemaining]);

  // =================== HANDLERS ===================

  const handleEnWordPress = (index: number) => {
    if (matched.includes(index)) return;
    setSelected(selected === index ? null : index);
  };

  const handleFrWordPress = (frIndex: number) => {
    if (selected === null) return;

    const enPair = enWords[selected];
    const frPair = frWords[frIndex];

    if (enPair.english === frPair.english) {
      const newMatched = [...matched, selected, frIndex + game.pairs.length];
      const newScore = score + 10;

      setMatched(newMatched);
      setScore(newScore);
      setSelected(null);

      // Vérifier si toutes les paires sont trouvées
      if (newMatched.length === game.pairs.length * 2) {
        setIsGameFinished(true);
      }
    } else {
      // Mauvaise association - désélectionner
      setSelected(null);
    }
  };

  // =================== CALCULS ===================

  const totalPairs = game.pairs.length;
  const matchedCount = matched.length / 2;
  const isSuccess = matchedCount === totalPairs && timeRemaining > 0;
  const isTimeout = timeRemaining <= 0 && matchedCount < totalPairs;

  // =================== STYLES DYNAMIQUES ===================

  const styles = StyleSheet.create({
    headerSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.lg,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.md,
      backgroundColor: identity.palette.background,
    },

    timerBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
    },

    timerText: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.black,
      color: identity.palette.primary,
    },

    scoreText: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
    },

    progressSection: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
    },

    progressLabel: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      marginBottom: tokens.spacing.xs,
    },

    progressBar: {
      height: 8,
      backgroundColor: identity.palette.background,
      borderRadius: tokens.borderRadius.round,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      backgroundColor: identity.palette.primary,
      borderRadius: tokens.borderRadius.round,
    },

    instruction: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.primary,
      textAlign: 'center',
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
    },

    wordsSection: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
    },

    sectionLabel: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
      marginBottom: tokens.spacing.sm,
    },

    wordsList: {
      gap: tokens.spacing.sm,
    },

    wordButton: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.surface,
    },

    wordButtonSelected: {
      backgroundColor: identity.palette.accent,
      borderColor: identity.palette.accent,
    },

    wordButtonMatched: {
      backgroundColor: baseColors.green500,
      borderColor: baseColors.green600,
    },

    wordText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.primary,
      textAlign: 'center',
    },

    wordTextMatched: {
      color: baseColors.white,
    },

    // Résultats
    resultSection: {
      alignItems: 'center',
      paddingVertical: tokens.spacing.xxxl,
    },

    resultIcon: {
      fontSize: tokens.emojiSize.huge,
      marginBottom: tokens.spacing.lg,
    },

    resultTitle: {
      fontSize: tokens.fontSize.xxxl,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      marginBottom: tokens.spacing.md,
      textAlign: 'center',
    },

    resultScore: {
      fontSize: tokens.fontSize.xxl,
      fontWeight: tokens.fontWeight.bold,
      color: identity.palette.primary,
      marginBottom: tokens.spacing.sm,
    },

    resultMatched: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      marginBottom: tokens.spacing.xs,
    },

    resultSubtext: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.tertiary,
      marginBottom: tokens.spacing.xxxl,
      textAlign: 'center',
    },

    continueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: tokens.spacing.xxl,
      paddingVertical: tokens.spacing.lg,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
      backgroundColor: identity.palette.primary,
    },

    continueButtonText: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.onPrimary,
    },
  });

  // =================== RENDU RÉSULTATS ===================

  if (isGameFinished) {
    let resultMessage = '';
    let resultIcon = '';
    let resultSubtext = '';

    if (isSuccess) {
      resultMessage = 'Bravo! Tu as réussi!';
      resultIcon = '🎉';
      resultSubtext = `${timeRemaining}s restants!`;
    } else if (isTimeout) {
      resultMessage = 'Temps écoulé!';
      resultIcon = '⏰';
      resultSubtext = 'Réessaie pour faire mieux!';
    } else {
      resultMessage = 'Game Over!';
      resultIcon = '🏁';
      resultSubtext = 'Continue tes efforts!';
    }

    return (
      <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
        <View style={baseStyles.card}>
          <View style={baseStyles.colorBar} />

          <View style={styles.resultSection}>
            <Text style={styles.resultIcon}>{resultIcon}</Text>
            <Text style={styles.resultTitle}>{resultMessage}</Text>
            <Text style={styles.resultScore}>{score} points</Text>
            <Text style={styles.resultMatched}>
              {matchedCount}/{totalPairs} pairs matched
            </Text>
            <Text style={styles.resultSubtext}>{resultSubtext}</Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => onComplete(score)}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={identity.text.onPrimary}
                style={{ marginLeft: tokens.spacing.sm }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // =================== RENDU JEU ===================

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      <View style={baseStyles.card}>
        <View style={baseStyles.colorBar} />

        {/* Timer & Score */}
        <View style={styles.headerSection}>
          <View style={styles.timerBox}>
            <Ionicons name="timer" size={24} color={identity.palette.primary} />
            <Text style={styles.timerText}>{timeRemaining}s</Text>
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
                },
              ]}
            />
          </View>
        </View>

        {/* Instructions */}
        <Text style={styles.instruction}>Match EN ↔ FR quickly!</Text>

        {/* Mots EN */}
        <View style={styles.wordsSection}>
          <Text style={styles.sectionLabel}>🇬🇧 English</Text>
          <View style={styles.wordsList}>
            {enWords.map((pair, index) => {
              const isMatched = matched.includes(index);
              const isSelected = selected === index;

              return (
                <TouchableOpacity
                  key={pair.english}
                  style={[
                    styles.wordButton,
                    isMatched && styles.wordButtonMatched,
                    isSelected && styles.wordButtonSelected,
                  ]}
                  onPress={() => handleEnWordPress(index)}
                  disabled={isMatched}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.wordText, isMatched && styles.wordTextMatched]}>
                    {pair.english}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Mots FR */}
        <View style={styles.wordsSection}>
          <Text style={styles.sectionLabel}>🇫🇷 French</Text>
          <View style={styles.wordsList}>
            {frWords.map((pair, index) => {
              const actualIndex = index + game.pairs.length;
              const isMatched = matched.includes(actualIndex);

              return (
                <TouchableOpacity
                  key={pair.french}
                  style={[styles.wordButton, isMatched && styles.wordButtonMatched]}
                  onPress={() => handleFrWordPress(index)}
                  disabled={isMatched || selected === null}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.wordText, isMatched && styles.wordTextMatched]}>
                    {pair.french}
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

export default SpeedMatchCard;
