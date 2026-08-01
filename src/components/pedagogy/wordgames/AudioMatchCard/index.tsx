import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import { createWordGameStyles } from '../shared/commonWordGameStyles';
import type { AudioMatchQuestion } from '@/screens/WordGames/schema';

export interface AudioMatchCardProps {
  game: AudioMatchQuestion;
  onComplete: () => void;
}

const AudioMatchCard: React.FC<AudioMatchCardProps> = ({ game, onComplete }) => {
  const { identity } = useTheme();
  const baseStyles = useMemo(() => createWordGameStyles(identity), [identity]);

  const [timeRemaining, setTimeRemaining] = useState(game.timeLimit);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [selectedPlayIndex, setSelectedPlayIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  // Fixé une seule fois, à l'endroit précis où l'issue survient — remplace l'ancien isSuccess
  // dérivé à chaque render de timeRemaining/matchedCount (bug réel : pile au moment où le
  // chrono passe à 0, les deux pouvaient être faux en même temps → message d'échec injustifié).
  const [outcome, setOutcome] = useState<'success' | 'timeout' | null>(null);
  const [isAppActive, setIsAppActive] = useState(true);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  // Un tap sur un 2e mot avant la fin du 1er ne doit pas laisser le callback du 1er
  // remettre speakingIndex à null par-dessus le 2e — seul le TTS "actif" a le droit de le faire.
  const activeSpeakIndexRef = useRef<number | null>(null);
  // Seule carte (avec SpeedMatchCard) à donner un feedback visible sur mauvaise association
  // (flash rouge + vibration ~400ms) — avant ce correctif, la sélection se réinitialisait
  // silencieusement sans aucun signal (point relevé par l'audit UX).
  const [wrongImageIndex, setWrongImageIndex] = useState<number | null>(null);
  const wrongFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (wrongFlashTimeoutRef.current) clearTimeout(wrongFlashTimeoutRef.current);
    };
  }, []);

  // Mélanger les images une seule fois à l'initialisation
  const [shuffledImages] = useState(() =>
    game.pairs.map((p, i) => ({ ...p, originalIndex: i })).sort(() => Math.random() - 0.5)
  );

  const isPlayful = identity.ui.mood === 'playful';
  const totalPairs = game.pairs.length;
  const matchedCount = matchedIndices.length;
  const isGameFinished = outcome !== null;
  const isSuccess = outcome === 'success';
  // Signal d'urgence (couleur + annonce lecteur d'écran) sur les 5 dernières secondes —
  // avant ce correctif, aucun indice progressif que le temps venait à manquer.
  const isTimeCritical = timeRemaining > 0 && timeRemaining <= 5;

  // Aucun usage d'AppState ailleurs dans le projet — premier pattern du genre. Le minuteur ne
  // tourne que quand l'app est réellement au premier plan : ni gel silencieux, ni rattrapage
  // brutal au retour (les deux comportements observés sans ce garde selon la façon dont RN
  // gère les timers JS en arrière-plan).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setIsAppActive(nextState === 'active');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isAppActive || outcome || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // current ?? ... : si un succès a déjà été posé (même juste avant, même tick),
          // ce tick de minuteur ne doit jamais l'écraser avec un verdict "timeout" obsolète.
          setOutcome((current) => current ?? (matchedCount === totalPairs ? 'success' : 'timeout'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAppActive, outcome, timeRemaining, matchedCount, totalPairs]);

  // Fin de partie quand toutes les paires sont trouvées : atteindre ce code = succès, peu
  // importe le temps restant à cet instant précis (même si le chrono atteint 0 au même moment).
  useEffect(() => {
    if (matchedCount === totalPairs && totalPairs > 0) {
      setOutcome((current) => current ?? 'success');
    }
  }, [matchedCount, totalPairs]);

  // Nettoyage Speech au démontage
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handlePlayPress = (index: number) => {
    if (matchedIndices.includes(index)) return;

    setSelectedPlayIndex(index === selectedPlayIndex ? null : index);
    setSpeakingIndex(index);
    activeSpeakIndexRef.current = index;

    Speech.stop();
    Speech.speak(game.pairs[index].word, {
      language: 'en-US',
      rate: 0.9,
      onDone: () => { if (activeSpeakIndexRef.current === index) setSpeakingIndex(null); },
      onStopped: () => { if (activeSpeakIndexRef.current === index) setSpeakingIndex(null); },
      onError: () => { if (activeSpeakIndexRef.current === index) setSpeakingIndex(null); },
    });
  };

  const handleImagePress = (shuffledIndex: number) => {
    if (selectedPlayIndex === null) return;

    const originalIndex = shuffledImages[shuffledIndex].originalIndex;

    if (originalIndex === selectedPlayIndex) {
      const newMatched = [...matchedIndices, selectedPlayIndex];
      setMatchedIndices(newMatched);
      setScore((prev) => prev + 10);
      setSelectedPlayIndex(null);
      Speech.stop();
      if (speakingIndex === selectedPlayIndex) setSpeakingIndex(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (wrongFlashTimeoutRef.current) clearTimeout(wrongFlashTimeoutRef.current);
      setWrongImageIndex(shuffledIndex);
      wrongFlashTimeoutRef.current = setTimeout(() => setWrongImageIndex(null), 400);
      setSelectedPlayIndex(null);
    }
  };

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
    imageButtonWrong: {
      backgroundColor: identity.aiDiagnostic.error,
      borderColor: identity.aiDiagnostic.error,
    },
    imageEmoji: {
      fontSize: tokens.emojiSize.md,
    },
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
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onComplete}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Continuer"
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={20} color={identity.text.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      <View style={baseStyles.card}>
        <View style={baseStyles.colorBar} />

        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>🎧</Text>
          <Text style={baseStyles.titleText}>Listen & Match</Text>
        </View>

        <View style={styles.headerSection}>
          <View style={styles.timerBox}>
            <Ionicons
              name="timer"
              size={24}
              color={isTimeCritical ? identity.aiDiagnostic.error : identity.palette.primary}
            />
            <Text
              style={[styles.timerText, isTimeCritical && { color: identity.aiDiagnostic.error }]}
              accessibilityLiveRegion={isTimeCritical ? 'polite' : 'none'}
              accessibilityLabel={`${timeRemaining} secondes restantes`}
            >
              {timeRemaining}s
            </Text>
          </View>
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(matchedCount / totalPairs) * 100}%` }]} />
        </View>

        <Text style={styles.instruction}>
          {selectedPlayIndex === null
            ? 'Tap 🔊 to hear, then match the image'
            : 'Now tap the matching image →'}
        </Text>

        <View style={styles.columnsSection}>
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
                  accessibilityRole="button"
                  accessibilityLabel={isSpeaking ? 'Lecture en cours' : `Écouter "${pair.word}"`}
                  accessibilityState={{ disabled: isMatched, selected: isSelected }}
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

          <View style={styles.column}>
            <Text style={styles.columnLabel}>🖼 Match</Text>
            {shuffledImages.map((pair, shuffledIndex) => {
              const isMatched = matchedIndices.includes(pair.originalIndex);
              const isWrong = wrongImageIndex === shuffledIndex;

              return (
                <TouchableOpacity
                  key={`img-${pair.originalIndex}`}
                  style={[styles.imageButton, isMatched && styles.imageButtonMatched, isWrong && styles.imageButtonWrong]}
                  onPress={() => handleImagePress(shuffledIndex)}
                  disabled={isMatched || selectedPlayIndex === null}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isWrong ? `Image ${shuffledIndex + 1}, mauvaise association` : `Image ${shuffledIndex + 1}`}
                  accessibilityState={{ disabled: isMatched || selectedPlayIndex === null }}
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
