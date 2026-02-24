/**
 * ============================================
 * AUDIO MATCH CARD (White Label)
 * Jeu : Associer le son (TTS) à l'image/mot contre la montre
 * Variante du Speed Match — colonne gauche = bouton Play, droite = images mélangées
 * ============================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

// Hooks & Utils
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';

// Styles
import { createWordGameStyles } from '../shared/commonWordGameStyles';

// Types
import type { AudioMatchQuestion } from '@/screens/WordGames/schema';

// ============================================
// TYPES
// ============================================

export interface AudioMatchCardProps {
  game: AudioMatchQuestion;
  onComplete: () => void;
}

// ============================================
// COMPOSANT
// ============================================

const AudioMatchCard: React.FC<AudioMatchCardProps> = ({ game, onComplete }) => {
  const { identity } = useTheme();
  const baseStyles = useMemo(() => createWordGameStyles(identity), [identity]);

  // =================== STATE ===================

  const [timeRemaining, setTimeRemaining] = useState(game.timeLimit);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [selectedPlayIndex, setSelectedPlayIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // Mélanger les images une seule fois à l'initialisation
  const [shuffledImages] = useState(() =>
    game.pairs.map((p, i) => ({ ...p, originalIndex: i })).sort(() => Math.random() - 0.5)
  );

  const isPlayful = identity.ui.mood === 'playful';
  const totalPairs = game.pairs.length;
  const matchedCount = matchedIndices.length;
  const isSuccess = matchedCount === totalPairs && timeRemaining > 0;

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

  // Fin de partie quand toutes les paires sont trouvées
  useEffect(() => {
    if (matchedCount === totalPairs && totalPairs > 0) {
      setIsGameFinished(true);
    }
  }, [matchedCount, totalPairs]);

  // Nettoyage Speech au démontage
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // =================== HANDLERS ===================

  const handlePlayPress = (index: number) => {
    if (matchedIndices.includes(index)) return;

    setSelectedPlayIndex(index === selectedPlayIndex ? null : index);
    setSpeakingIndex(index);

    Speech.stop();
    Speech.speak(game.pairs[index].word, {
      language: 'en-US',
      rate: 0.9,
      onDone: () => setSpeakingIndex(null),
      onStopped: () => setSpeakingIndex(null),
    });
  };

  const handleImagePress = (shuffledIndex: number) => {
    if (selectedPlayIndex === null) return;

    const originalIndex = shuffledImages[shuffledIndex].originalIndex;

    if (originalIndex === selectedPlayIndex) {
      // Bonne association
      const newMatched = [...matchedIndices, selectedPlayIndex];
      setMatchedIndices(newMatched);
      setScore((prev) => prev + 10);
      setSelectedPlayIndex(null);
      Speech.stop();
    } else {
      // Mauvaise association — désélectionner
      setSelectedPlayIndex(null);
    }
  };

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
    progressBar: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
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
    columnsSection: {
      flexDirection: 'row',
      marginHorizontal: tokens.spacing.xl,
      gap: tokens.spacing.md,
    },
    column: {
      flex: 1,
      gap: tokens.spacing.sm,
    },
    columnLabel: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.secondary,
      marginBottom: tokens.spacing.xs,
      textAlign: 'center',
    },
    playButton: {
      paddingVertical: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.sm,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing.xs,
    },
    playButtonSelected: {
      backgroundColor: identity.palette.accent,
      borderColor: identity.palette.accent,
    },
    playButtonMatched: {
      backgroundColor: baseColors.green500,
      borderColor: baseColors.green600,
    },
    playButtonSpeaking: {
      backgroundColor: identity.palette.primary,
      borderColor: identity.palette.primary,
    },
    playIcon: {
      fontSize: tokens.fontSize.lg,
    },
    playLabel: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.primary,
      textAlign: 'center',
    },
    playLabelWhite: {
      color: baseColors.white,
    },
    imageButton: {
      paddingVertical: tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageButtonMatched: {
      backgroundColor: baseColors.green500,
      borderColor: baseColors.green600,
    },
    imageEmoji: {
      fontSize: tokens.emojiSize.md,
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
    resultSubtext: {
      fontSize: tokens.fontSize.base,
      color: identity.text.secondary,
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
      gap: tokens.spacing.sm,
    },
    continueButtonText: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.onPrimary,
    },
  });

  // =================== RENDU RÉSULTATS ===================

  if (isGameFinished) {
    const resultIcon = isSuccess ? '🎉' : '⏰';
    const resultTitle = isSuccess ? 'Perfect match!' : 'Time\'s up!';
    const resultSubtext = isSuccess
      ? `${timeRemaining}s remaining — great listening!`
      : `${matchedCount}/${totalPairs} matched`;

    return (
      <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
        <View style={baseStyles.card}>
          <View style={baseStyles.colorBar} />
          <View style={styles.resultSection}>
            <Text style={styles.resultIcon}>{resultIcon}</Text>
            <Text style={styles.resultTitle}>{resultTitle}</Text>
            <Text style={styles.resultScore}>{score} points</Text>
            <Text style={styles.resultSubtext}>{resultSubtext}</Text>
            <TouchableOpacity style={styles.continueButton} onPress={onComplete} activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={identity.text.onPrimary} />
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

        {/* Titre */}
        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>🎧</Text>
          <Text style={baseStyles.titleText}>Listen & Match</Text>
        </View>

        {/* Timer & Score */}
        <View style={styles.headerSection}>
          <View style={styles.timerBox}>
            <Ionicons name="timer" size={24} color={identity.palette.primary} />
            <Text style={styles.timerText}>{timeRemaining}s</Text>
          </View>
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>

        {/* Barre de progression */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(matchedCount / totalPairs) * 100}%` }]} />
        </View>

        {/* Instructions */}
        <Text style={styles.instruction}>
          {selectedPlayIndex === null
            ? 'Tap 🔊 to hear, then match the image'
            : 'Now tap the matching image →'}
        </Text>

        {/* Deux colonnes */}
        <View style={styles.columnsSection}>
          {/* Colonne gauche : boutons Play */}
          <View style={styles.column}>
            <Text style={styles.columnLabel}>🔊 Listen</Text>
            {game.pairs.map((pair, index) => {
              const isMatched = matchedIndices.includes(index);
              const isSelected = selectedPlayIndex === index;
              const isSpeaking = speakingIndex === index;

              return (
                <TouchableOpacity
                  key={`play-${pair.word}`}
                  style={[
                    styles.playButton,
                    isMatched && styles.playButtonMatched,
                    isSpeaking && !isMatched && styles.playButtonSpeaking,
                    isSelected && !isMatched && !isSpeaking && styles.playButtonSelected,
                  ]}
                  onPress={() => handlePlayPress(index)}
                  disabled={isMatched}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSpeaking ? 'volume-high' : 'play-circle'}
                    size={28}
                    color={isMatched || isSpeaking || isSelected ? baseColors.white : identity.palette.primary}
                  />
                  {isMatched && (
                    <Text style={[styles.playLabel, styles.playLabelWhite]}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Colonne droite : images mélangées */}
          <View style={styles.column}>
            <Text style={styles.columnLabel}>🖼 Match</Text>
            {shuffledImages.map((pair, shuffledIndex) => {
              const isMatched = matchedIndices.includes(pair.originalIndex);

              return (
                <TouchableOpacity
                  key={`img-${pair.originalIndex}`}
                  style={[styles.imageButton, isMatched && styles.imageButtonMatched]}
                  onPress={() => handleImagePress(shuffledIndex)}
                  disabled={isMatched || selectedPlayIndex === null}
                  activeOpacity={0.7}
                >
                  <Text style={styles.imageEmoji}>{pair.image}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AudioMatchCard;
