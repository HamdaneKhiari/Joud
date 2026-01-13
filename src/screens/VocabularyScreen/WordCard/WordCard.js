// ============================================
// FICHIER: src/components/pedagogy/vocabulary/WordCard/index.js
// VERSION 3 - Micro-interactions + Gamification + Couleur
// ============================================
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Animated, Pressable } from 'react-native';
import { styles } from './style';
import { spacing} from '@themes/tokens';
import { useRevealAnimation } from '../../../../hooks/useRevealAnimation';
import AudioButton from '../../../ui/buttons/AudioButton';
import RevealButton from '../../../ui/buttons/RevealButton';

/**
 * WordCard v3 - Design vibrant avec micro-interactions
 * 
 * ✅ AMÉLIORATIONS:
 * - Couleur de famille utilisée (dégradé subtle)
 * - Typographie vibrante (DOG énorme + couleur)
 * - Animations smooth sur reveal
 * - Micro-interactions (pulse, glow)
 * - Gamification subtle (streak indicator)
 */
const WordCard = ({
  englishWord,
  frenchWord,
  audio = null,
  exampleSentence,
  exampleTranslation,
  color = '#FBBF24',
  onReveal,
  onAudioPlay,
}) => {
  const { isRevealed, translateAnim, toggleReveal } = useRevealAnimation(onReveal);

  // Animation pour le bouton audio (pulse on hover)
  const audioScaleAnim = new Animated.Value(1);
  const handleAudioPressIn = () => {
    Animated.spring(audioScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  const handleAudioPressOut = () => {
    Animated.spring(audioScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Animation pour le titre DOG (scale on mount)
  const titleScaleAnim = new Animated.Value(0.8);
  React.useEffect(() => {
    Animated.spring(titleScaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [englishWord]);

  return (
    <View testID="word-card" style={[styles.card, { borderTopColor: color }]}>
      {/* =================== BARRE COULEUR DÉGRADÉE ================== */}
      <View
        style={[
          styles.colorBar,
          {
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.3,
          },
        ]}
      />

      {/* =================== ESPACE VIDE ================== */}
      <View style={styles.spacerTop} />

      {/* =================== MOT ANGLAIS - TITRE VIBRANT ================== */}
      <Animated.View
        style={[
          {
            transform: [{ scale: titleScaleAnim }],
          },
        ]}
      >
        <Text style={styles.englishWordTitle}>
          {englishWord.toUpperCase()}
        </Text>
      </Animated.View>

      {/* =================== ZONE TRADUCTION (ANIMÉE + SATURÉE) ================== */}
      <View style={styles.translationContainer}>
        <Animated.View
          style={[
            styles.translationBox,
            {
              opacity: isRevealed ? 1 : 0,
              transform: [
                {
                  translateY: isRevealed ? 0 : 15,
                },
                {
                  scale: isRevealed ? 1 : 0.95,
                },
              ],
              shadowOpacity: isRevealed ? 0.15 : 0,
            },
          ]}
        >
          <Text style={styles.frenchWordText}>{frenchWord}</Text>
        </Animated.View>
      </View>

      {/* =================== BOUTON AUDIO (AVEC MICRO-INTERACTION + TTS) ================== */}
      <Animated.View
        style={[
          {
            marginBottom: spacing.xxl,
            alignItems: 'center', // Centre le bouton
            alignSelf: 'center', // Centre le container
            maxWidth: 200, // Largeur max pour le bouton
          },
          {
            transform: [{ scale: audioScaleAnim }],
          },
        ]}
      >
        <Pressable
          onPressIn={handleAudioPressIn}
          onPressOut={handleAudioPressOut}
        >
          <AudioButton
            text={englishWord}
            language="en"
            ttsRate={0.85}
            onAudioPlayCallback={onAudioPlay}
            variant="default"
            size="medium"
            showIcon
            showText
            idleText="Écouter"
            playingText="Lecture..."
          />
        </Pressable>
      </Animated.View>

      {/* =================== ESPACE MASSIF ================== */}
      <View style={{ height: spacing.xl }} />

      {/* =================== BOUTON REVEAL (AVEC COULEUR DYNAMIQUE) ================== */}
      <View style={{
        marginBottom: spacing.xxl,
        alignItems: 'center', // Centre le bouton
        alignSelf: 'center', // Centre le container
        maxWidth: 200, // Largeur max pour le bouton
      }}>
        <RevealButton
          isRevealed={isRevealed}
          toggleReveal={toggleReveal}
          variant="vocab"
          size="medium"
          hiddenText="Voir la traduction"
          revealedText="Masquer"
        />
      </View>

      {/* =================== PHRASE EXEMPLE (ANIMATION + DÉGRADÉ SUBTIL) ================== */}
      {isRevealed && exampleSentence && (
        <Animated.View
          style={[
            styles.exampleSection,
            {
              backgroundColor: `${color}08`,
              borderTopColor: `${color}30`,
              opacity: translateAnim,
              transform: [
                {
                  translateY: translateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.exampleDivider,
              {
                backgroundColor: `${color}40`,
              },
            ]}
          />

          <Text style={styles.exampleLabel}>
            Example
          </Text>

          <View style={[styles.exampleContent, { borderColor: `${color}30` }]}>
            <Text style={styles.exampleEnglish}>{exampleSentence}</Text>
            {exampleTranslation && (
              <Text style={styles.exampleFrench}>{exampleTranslation}</Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* =================== ESPACE EN BAS ================== */}
      <View style={styles.spacerBottom} />

      {/* =================== INDICATOR DE GAMIFICATION (SUBTLE) ================== */}
      <View style={styles.gamificationIndicator}>
        <View
          style={[
            styles.streakDot,
            {
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

WordCard.propTypes = {
  englishWord: PropTypes.string.isRequired,
  frenchWord: PropTypes.string.isRequired,
  audio: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  exampleSentence: PropTypes.string,
  exampleTranslation: PropTypes.string,
  color: PropTypes.string,
  onReveal: PropTypes.func,
  onAudioPlay: PropTypes.func,
};

WordCard.defaultProps = {
  audio: null,
  exampleSentence: undefined,
  exampleTranslation: undefined,
  color: '#FBBF24',
  onReveal: () => {},
  onAudioPlay: () => {},
};

export default WordCard;