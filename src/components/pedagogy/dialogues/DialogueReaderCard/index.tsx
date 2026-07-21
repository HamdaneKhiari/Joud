import { log } from '@/utils/logUtils';
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

export interface Character {
  name: string;
  color: string;
}

export interface Message {
  speaker: string;
  text: string;
  textFr?: string;
  audio?: string | null;
}

interface DialogueReaderCardProps {
  dialogue: { characters?: Character[]; messages?: Message[] };
  currentMessageIndex: number;
  onPreviousMessage: () => void;
  onNextMessage: () => void;
  isLastMessage: boolean;
  totalMessages: number;
}

const DialogueReaderCard: React.FC<DialogueReaderCardProps> = ({
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

  useEffect(() => {
    dialogue.messages?.forEach((_, index) => {
      if (!bubbleAnimations.current[index]) {
        bubbleAnimations.current[index] = new Animated.Value(0);
      }
    });
  }, [dialogue]);

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
      log.error('Audio playback error:', error);
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

export default DialogueReaderCard;
