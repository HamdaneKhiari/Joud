import React, { useRef, useEffect } from 'react';
import { Modal, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export interface CompletionModalProps {
  visible: boolean;
  /** Titre affiché — défaut: "Series complete!" */
  title?: string;
  /** Sous-titre / encouragement */
  subtitle?: string;
  /** Emoji de célébration */
  emoji?: string;
  /** Callback quand l'utilisateur appuie sur "Done" */
  onDone: () => void;
  /** Libellé du bouton — défaut: "Continue" */
  doneLabel?: string;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  visible,
  title = 'Series complete!',
  subtitle = 'Great work! Keep it up.',
  emoji = '🎉',
  onDone,
  doneLabel = 'Continue',
}) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  // Animations
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.75)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const emojiScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      overlayAnim.setValue(0);
      cardScaleAnim.setValue(0.75);
      cardFadeAnim.setValue(0);
      emojiScaleAnim.setValue(0);

      // Séquence : overlay fade → card spring → emoji bounce (décalé de 100ms)
      Animated.sequence([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(cardScaleAnim, {
            toValue: 1,
            tension: 90,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(cardFadeAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(100),
            Animated.spring(emojiScaleAnim, {
              toValue: 1,
              tension: 200,
              friction: 5,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }
  }, [visible, overlayAnim, cardScaleAnim, cardFadeAnim, emojiScaleAnim]);

  const overlayBgColor = overlayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDone}
    >
      <Animated.View style={[styles.overlay, { backgroundColor: overlayBgColor }]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: identity.palette.surface,
              borderColor: identity.palette.primary,
              borderRadius: isPlayful ? tokens.borderRadius.xxl : tokens.borderRadius.xl,
              opacity: cardFadeAnim,
              transform: [{ scale: cardScaleAnim }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.emoji,
              isPlayful && styles.emojiLarge,
              { transform: [{ scale: emojiScaleAnim }] },
            ]}
          >
            {emoji}
          </Animated.Text>

          <Text style={[styles.title, { color: identity.text.primary }]}>
            {title}
          </Text>

          <Text style={[styles.subtitle, { color: identity.text.secondary }]}>
            {subtitle}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: identity.palette.primary,
                borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
              },
            ]}
            onPress={onDone}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: identity.text.onPrimary }]}>
              {doneLabel}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.layout.screenPadding,
  },
  card: {
    width: '100%',
    borderWidth: 2,
    padding: tokens.spacing.xxl,
    alignItems: 'center',
    ...tokens.shadows.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: tokens.spacing.lg,
  },
  emojiLarge: {
    fontSize: 80,
  },
  title: {
    fontSize: tokens.fontSize.xxl,
    fontWeight: tokens.fontWeight.black,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
    lineHeight: 22,
  },
  button: {
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xxl,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
  },
});

export default CompletionModal;
