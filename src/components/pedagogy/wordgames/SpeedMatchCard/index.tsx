import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import { createWordGameStyles } from '../shared/commonWordGameStyles';
import type { SpeedMatchQuestion } from '@/screens/WordGames/schema';

interface Pair {
  english: string;
  french: string;
}

export interface SpeedMatchCardProps {
  game: SpeedMatchQuestion;
  onComplete: (score: number) => void;
}

const SpeedMatchCard: React.FC<SpeedMatchCardProps> = ({ game, onComplete }) => {
  const { identity } = useTheme();
  const baseStyles = useMemo(() => createWordGameStyles(identity), [identity]);

  const [timeRemaining, setTimeRemaining] = useState(game.timeLimit);
  const [matched, setMatched] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [enWords] = useState<Pair[]>(game.pairs);
  const [frWords] = useState<Pair[]>(() => [...game.pairs].sort(() => Math.random() - 0.5));
  // Fixé une seule fois, à l'endroit précis où l'issue survient (dernière paire trouvée OU
  // chrono à 0) — remplace les anciens isSuccess/isTimeout dérivés à chaque render de
  // timeRemaining/matchedCount, qui pouvaient tous les deux être faux si le joueur finissait
  // pile au moment où le chrono passait à 0 (bug réel : message d'échec au lieu de victoire).
  const [outcome, setOutcome] = useState<'success' | 'timeout' | null>(null);
  const [isAppActive, setIsAppActive] = useState(true);
  // Seule carte à donner un feedback visible sur mauvaise association (flash rouge + vibration
  // ~400ms) — avant ce correctif, la sélection se réinitialisait silencieusement sans aucun
  // signal, seule carte de l'app dans ce cas (point relevé par l'audit UX).
  const [wrongFlash, setWrongFlash] = useState<{ en: number; fr: number } | null>(null);
  const wrongFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (wrongFlashTimeoutRef.current) clearTimeout(wrongFlashTimeoutRef.current);
    };
  }, []);

  const isPlayful = identity.ui.mood === 'playful';
  const totalPairs = game.pairs.length;
  const matchedCount = matched.length / 2;

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

      // Atteindre ce code = toutes les paires sont trouvées = succès, peu importe le temps
      // restant à cet instant précis (même si le chrono atteint 0 au même moment).
      if (newMatched.length === game.pairs.length * 2) {
        setOutcome('success');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (wrongFlashTimeoutRef.current) clearTimeout(wrongFlashTimeoutRef.current);
      setWrongFlash({ en: selected, fr: frIndex });
      wrongFlashTimeoutRef.current = setTimeout(() => setWrongFlash(null), 400);
      setSelected(null);
    }
  };

  const isGameFinished = outcome !== null;
  const isSuccess = outcome === 'success';
  const isTimeout = outcome === 'timeout';
  // Signal d'urgence (couleur + annonce lecteur d'écran) sur les 5 dernières secondes —
  // avant ce correctif, aucun indice progressif que le temps venait à manquer.
  const isTimeCritical = timeRemaining > 0 && timeRemaining <= 5;

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

    wordButtonWrong: {
      backgroundColor: identity.aiDiagnostic.error,
      borderColor: identity.aiDiagnostic.error,
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
              accessibilityRole="button"
              accessibilityLabel="Continuer"
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

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      <View style={baseStyles.card}>
        <View style={baseStyles.colorBar} />

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

        <Text style={styles.instruction}>Match EN ↔ FR quickly!</Text>

        <View style={styles.wordsSection}>
          <Text style={styles.sectionLabel}>🇬🇧 English</Text>
          <View style={styles.wordsList}>
            {enWords.map((pair, index) => {
              const isMatched = matched.includes(index);
              const isSelected = selected === index;
              const isWrong = wrongFlash?.en === index;

              return (
                <TouchableOpacity
                  key={pair.english}
                  style={[
                    styles.wordButton,
                    isMatched && styles.wordButtonMatched,
                    isSelected && styles.wordButtonSelected,
                    isWrong && styles.wordButtonWrong,
                  ]}
                  onPress={() => handleEnWordPress(index)}
                  disabled={isMatched}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isWrong ? `${pair.english}, mauvaise association` : pair.english}
                  accessibilityState={{ selected: isSelected, disabled: isMatched }}
                >
                  <Text style={[styles.wordText, (isMatched || isWrong) && styles.wordTextMatched]}>
                    {pair.english}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.wordsSection}>
          <Text style={styles.sectionLabel}>🇫🇷 French</Text>
          <View style={styles.wordsList}>
            {frWords.map((pair, index) => {
              const actualIndex = index + game.pairs.length;
              const isMatched = matched.includes(actualIndex);
              const isWrong = wrongFlash?.fr === index;

              return (
                <TouchableOpacity
                  key={pair.french}
                  style={[styles.wordButton, isMatched && styles.wordButtonMatched, isWrong && styles.wordButtonWrong]}
                  onPress={() => handleFrWordPress(index)}
                  disabled={isMatched || selected === null}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isWrong ? `${pair.french}, mauvaise association` : pair.french}
                  accessibilityState={{ disabled: isMatched || selected === null }}
                >
                  <Text style={[styles.wordText, (isMatched || isWrong) && styles.wordTextMatched]}>
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
