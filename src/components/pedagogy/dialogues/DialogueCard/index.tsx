/**
 * DialogueCard - Composant de dialogue WHITE LABEL
 * Support : Mood (playful/clean), Deux phases (dialogue/questions)
 * Migration TypeScript depuis JS
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './style';
import QuestionCard from '../../shared/QuestionCard';

// ============================================
// TYPES
// ============================================

export interface Character {
  name: string;
  color: string;
}

export interface Message {
  speaker: string;
  text: string;
  textFr?: string;
  audio?: any;
}

export interface Dialogue {
  name?: string;
  title?: string;
  icon?: string;
  color?: string;
  characters?: Character[];
  messages?: Message[];
  questions?: Question[]; // Pour le mode question
}

export interface Question {
  question?: string;
  text?: string;
  options?: string[];
  correctAnswer: number; // Index de la réponse correcte
  hint?: string;
}

// Props du composant principal
interface DialogueCardProps {
  // Mode Dialogue
  dialogue?: Dialogue;
  currentMessageIndex?: number;
  onPreviousMessage?: () => void;
  onNextMessage?: () => void;
  isLastMessage?: boolean;
  totalMessages?: number;

  // Mode Questions
  question?: Question;
  selectedOption?: string;
  isValidated?: boolean;
  isCorrect?: boolean;
  onAnswer?: (option: string) => void;
  color?: string;
}

// Props DialoguePhase
interface DialoguePhaseProps {
  dialogue: Dialogue;
  currentMessageIndex: number;
  onPreviousMessage: () => void;
  onNextMessage: () => void;
  isLastMessage: boolean;
  totalMessages: number;
}

// Props QuestionPhase
interface QuestionPhaseProps {
  question: Question;
  selectedOption?: string;
  isValidated?: boolean;
  isCorrect?: boolean;
  onAnswer?: (option: string) => void;
  color?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const DialogueCard: React.FC<DialogueCardProps> = (props) => {
  const isDialogueMode = !!props.dialogue && props.currentMessageIndex !== undefined;
  const isQuestionMode = !!props.question && props.selectedOption !== undefined;

  if (isDialogueMode) {
    return (
      <DialoguePhase
        dialogue={props.dialogue!}
        currentMessageIndex={props.currentMessageIndex!}
        onPreviousMessage={props.onPreviousMessage!}
        onNextMessage={props.onNextMessage!}
        isLastMessage={props.isLastMessage!}
        totalMessages={props.totalMessages!}
      />
    );
  }

  if (isQuestionMode) {
    return (
      <QuestionPhase
        question={props.question!}
        selectedOption={props.selectedOption}
        isValidated={props.isValidated}
        isCorrect={props.isCorrect}
        onAnswer={props.onAnswer}
        color={props.color}
      />
    );
  }

  return null;
};

// =================== PHASE 1: DIALOGUE ===================

const DialoguePhase: React.FC<DialoguePhaseProps> = ({
  dialogue,
  currentMessageIndex,
  onPreviousMessage,
  onNextMessage,
  isLastMessage,
  totalMessages,
}) => {
  const { identity } = useTheme();
  const styles = createStyles(identity);

  const [playingBubble, setPlayingBubble] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const bubbleAnimations = useRef<Record<number, Animated.Value>>({});

  // Initialiser les animations
  useEffect(() => {
    dialogue.messages?.forEach((_, index) => {
      if (!bubbleAnimations.current[index]) {
        bubbleAnimations.current[index] = new Animated.Value(0);
      }
    });
  }, [dialogue]);

  // Animer l'apparition de la bulle courante
  useEffect(() => {
    if (bubbleAnimations.current[currentMessageIndex]) {
      Animated.spring(bubbleAnimations.current[currentMessageIndex], {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentMessageIndex]);

  // Cleanup son
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playBubbleAudio = useCallback(async (messageIndex: number) => {
    const message = dialogue.messages?.[messageIndex];
    if (!message?.audio || playingBubble === messageIndex) return;

    try {
      setPlayingBubble(messageIndex);
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        typeof message.audio === 'string' ? { uri: message.audio } : message.audio
      );

      setSound(newSound);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingBubble(null);
        }
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      setPlayingBubble(null);
    }
  }, [dialogue.messages, playingBubble, sound]);

  const renderBubble = (message: Message, index: number) => {
    const position = (dialogue.characters?.findIndex(c => c.name === message.speaker) ?? 0) % 2 === 0 ? 'left' : 'right';
    const isVisible = index <= currentMessageIndex;
    const isPlaying = playingBubble === index;
    const characterColor = dialogue.characters?.find(c => c.name === message.speaker)?.color || identity.palette.accent;

    if (!isVisible) return null;

    const animatedStyle = {
      opacity: bubbleAnimations.current[index],
      transform: [{
        translateY: bubbleAnimations.current[index]?.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }) || 0,
      }],
    };

    return (
      <Animated.View
        key={`msg-${index}-${message.speaker}`}
        style={[
          styles.messageBubble,
          position === 'left' ? styles.messageBubbleLeft : styles.messageBubbleRight,
          animatedStyle,
        ]}
      >
        <Text style={[styles.bubbleName, position === 'right' && styles.bubbleNameRight, { color: characterColor }]}>
          {message.speaker}
        </Text>
        <View style={styles.bubbleTextContainer}>
          <View style={[styles.bubbleText, position === 'left' ? styles.bubbleTextLeft : styles.bubbleTextRight]}>
            <Text style={[
              styles.bubbleTextContent,
              { color: position === 'right' ? '#FFFFFF' : identity.text.primary }
            ]}>
              {message.text}
            </Text>
          </View>
          {message.audio && (
            <TouchableOpacity
              style={[styles.bubbleAudioBtn, position === 'right' && styles.bubbleAudioBtnRight, isPlaying && styles.bubbleAudioBtnPlaying]}
              onPress={() => playBubbleAudio(index)}
              disabled={isPlaying}
            >
              <Ionicons name={isPlaying ? 'volume-high' : 'volume-medium'} size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
        {message.textFr && (
          <Text style={[styles.bubbleTranslation, position === 'right' && styles.bubbleTranslationRight]}>
            {message.textFr}
          </Text>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.dialogueContainer}>
      <View style={styles.charactersBar}>
        {dialogue.characters?.map((character) => (
          <View key={`char-${character.name}`} style={styles.characterTag}>
            <View style={[styles.characterDot, { backgroundColor: character.color }]} />
            <Text style={styles.characterName}>{character.name}</Text>
          </View>
        ))}
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {dialogue.messages?.map((message, index) => renderBubble(message, index))}
      </ScrollView>
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, currentMessageIndex === 0 && styles.navButtonDisabled]}
          onPress={onPreviousMessage}
          disabled={currentMessageIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navigationText}>
          {currentMessageIndex + 1} / {totalMessages}
        </Text>
        <TouchableOpacity
          style={[styles.navButton, isLastMessage ? styles.navButtonFinish : styles.navButtonNext]}
          onPress={onNextMessage}
        >
          <Ionicons name={isLastMessage ? 'checkmark' : 'chevron-forward'} size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// =================== PHASE 2: QUESTIONS ===================

const QuestionPhase: React.FC<QuestionPhaseProps> = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  onAnswer,
  color,
}) => {
  const { identity } = useTheme();
  const styles = createStyles(identity);

  const getLetterFromIndex = (index: number) => String.fromCharCode(65 + index);
  const handleAnswer = (letter: string) => onAnswer?.(letter);
  const questionOptions = question?.options || [];
  // correctAnswer est maintenant un index (number), pas une lettre
  const correctAnswerLetter = getLetterFromIndex(question?.correctAnswer ?? 0);

  const cardColor = color || identity.palette.primary;

  return (
    <View style={[styles.questionContainer, { borderTopColor: cardColor }]}>
      <View style={[styles.colorBar, { backgroundColor: cardColor, shadowColor: cardColor }]} />
      <View style={styles.questionHeader}>
        <Text style={[styles.questionHeaderLabel, { color: cardColor }]}>🎯 Compréhension</Text>
      </View>
      <View style={styles.questionContent}>
        <QuestionCard
          questionIndex={0}
          question={question.question || question.text || ''}
          options={questionOptions}
          correctAnswer={correctAnswerLetter}
          moduleType="dialogue"
          hint={question.hint}
          externalSelectedOption={selectedOption}
          externalIsAnswered={isValidated}
          externalShowFeedback={isValidated}
          externalIsCorrect={isCorrect}
          onAnswer={handleAnswer}
        />
      </View>
    </View>
  );
};

export default DialogueCard;
