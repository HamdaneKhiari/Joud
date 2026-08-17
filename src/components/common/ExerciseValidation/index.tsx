// No-media : icônes Ionicons sobres au lieu d'emoji, par choix produit

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, TouchableOpacity, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStyles } from './styles';
import { withOpacity } from '@/themes/tokens';
import { useTheme } from '@/themes/ThemeContext';
import useSafeAction from '../../../hooks/useSafeAction';
import useReducedMotion from '../../../hooks/useReducedMotion';
import { getButtonConfig, getDefaultFeedback } from './helpers';
import type { ExerciseValidationProps, FeedbackBannerProps } from './types';

const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ feedback, state }) => {
  const { identity } = useTheme();
  const styles = useMemo(() => getStyles(identity), [identity]);
  const reducedMotion = useReducedMotion();

  const slideAnim = useRef(new Animated.Value(-50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const isVisibleRef = useRef(false);
  const prevStateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!feedback) {
      isVisibleRef.current = false;
      prevStateRef.current = null;
      return;
    }

    const stateChanged = prevStateRef.current !== state;
    prevStateRef.current = state;

    if (isVisibleRef.current && !stateChanged) {
      return;
    }

    isVisibleRef.current = true;

    if (reducedMotion) {
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [feedback, state, slideAnim, fadeAnim, scaleAnim, reducedMotion]);

  if (!feedback) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.feedbackContainer,
        state === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.feedbackIconContainer}>
        <Ionicons
          name={state === 'correct' ? 'checkmark-circle' : 'alert-circle'}
          size={32}
          color={(state === 'correct' ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect).color}
        />
      </View>

      <View style={styles.feedbackTextContainer}>
        <Text
          style={[
            styles.feedbackTitle,
            state === 'correct' ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect,
          ]}
        >
          {feedback.title}
        </Text>
        <Text
          style={[
            styles.feedbackMessage,
            state === 'correct' ? styles.feedbackMessageCorrect : styles.feedbackMessageIncorrect,
          ]}
        >
          {feedback.message}
        </Text>
      </View>

      {state === 'correct' && identity.ui.mood === 'playful' && (
        <View style={styles.successBadge}>
          <Ionicons name="sparkles" size={20} color={styles.feedbackMessageCorrect.color} />
        </View>
      )}
    </Animated.View>
  );
};

const ExerciseValidation: React.FC<ExerciseValidationProps> = ({
  state = 'initial',
  onValidate,
  onNext,
  onRetry,
  onSkip,
  disabled = false,
  showFeedback = true,
  feedbackMessage = null,
  isLastQuestion = false,
  attemptCount = 0,
  maxAttempts = 2,
  correctAnswer = null,
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => getStyles(identity), [identity]);
  const isPlayful = identity.ui.mood === 'playful';
  const reducedMotion = useReducedMotion();

  // useNativeDriver: false pour rester cohérent avec glowAnim (animé sur shadowOpacity, non-natif)
  const [scaleAnim] = useState(new Animated.Value(1));
  const glowAnim = useRef(new Animated.Value(0)).current;

  const animate = (callback?: () => void) => {
    if (reducedMotion) {
      callback?.();
      return;
    }
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: false,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        speed: 50,
        bounciness: 8,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const safeValidate = useSafeAction(() => {
    if (onValidate) animate(onValidate);
  });

  const safeNext = useSafeAction(() => {
    if (onNext) animate(onNext);
  });

  const safeRetry = useSafeAction(() => {
    if (onRetry) animate(onRetry);
  });

  const safeSkip = useSafeAction(() => {
    if (onSkip) animate(onSkip);
  });

  const canSkip = attemptCount >= maxAttempts;
  const buttonConfig = getButtonConfig(state, isLastQuestion, canSkip, styles);
  const feedback = getDefaultFeedback(
    state,
    showFeedback,
    feedbackMessage,
    canSkip,
    correctAnswer,
    attemptCount
  );

  useEffect(() => {
    // Pulse de succès réservée aux identités playful — trop "gloss" pour clean (Lycée/Adulte)
    if (state === 'correct' && isPlayful && !reducedMotion) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      glowAnim.setValue(0);
    }
  }, [state, glowAnim, isPlayful, reducedMotion]);

  const handlePress = () => {
    if (disabled) return;

    if (state === 'initial') {
      safeValidate.execute();
    } else if (state === 'correct') {
      safeNext.execute();
    } else if (state === 'skip') {
      safeSkip.execute();
    } else if (state === 'incorrect') {
      safeRetry.execute();
    }
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [withOpacity(styles.feedbackMessageCorrect.color, 0.2), withOpacity(styles.feedbackMessageCorrect.color, 0.6)],
  });

  const remainingAttempts = maxAttempts - attemptCount;

  return (
    <View style={styles.container}>
      <FeedbackBanner feedback={feedback} state={state} />

      {/* Compteur de tentatives — visible uniquement sur état incorrect avec tentatives restantes */}
      {state === 'incorrect' && maxAttempts > 1 && remainingAttempts > 0 && (
        <View style={styles.attemptRow}>
          {Array.from({ length: maxAttempts }).map((_, i) => (
            <View
              key={i}
              style={i < attemptCount ? styles.attemptDotFilled : styles.attemptDotEmpty}
            />
          ))}
          <Text style={styles.attemptText}>
            {remainingAttempts === 1 ? 'Encore 1 essai' : `Encore ${remainingAttempts} essais`}
          </Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.buttonWrapper,
          state === 'correct' && isPlayful && {
            shadowColor: glowColor,
            shadowOpacity: glowAnim,
            shadowRadius: 20,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.button, buttonConfig.style, disabled && styles.buttonDisabled]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={1}
            accessibilityRole="button"
            accessibilityLabel={buttonConfig.label}
            accessibilityState={{ disabled }}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name={buttonConfig.icon as React.ComponentProps<typeof Ionicons>['name']} size={26} color={identity.text.onPrimary} />
            </View>

            <Text style={styles.buttonLabel}>{buttonConfig.label}</Text>

            {state === 'correct' && !isLastQuestion && (
              <View style={styles.buttonArrow}>
                <Ionicons name="chevron-forward" size={20} color={identity.text.onPrimary} />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default ExerciseValidation;
