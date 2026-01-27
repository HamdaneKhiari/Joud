import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { log } from '../../../../utils/logUtils';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './style';
import QuestionCard from '../../shared/QuestionCard';

const DialogueCard = (props) => {
  const { dialogue, currentMessageIndex, onPreviousMessage, onNextMessage, isLastMessage, totalMessages } =
    props;

  const isDialogueMode = !!dialogue && currentMessageIndex !== undefined;
  const isQuestionMode = !!props.question && props.selectedOption !== undefined;

  if (isDialogueMode) {
    return (
      <DialoguePhase
        dialogue={dialogue}
        currentMessageIndex={currentMessageIndex}
        onPreviousMessage={onPreviousMessage}
        onNextMessage={onNextMessage}
        isLastMessage={isLastMessage}
        totalMessages={totalMessages}
      />
    );
  }

  if (isQuestionMode) {
    return (
      <QuestionPhase
        question={props.question}
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

const DialoguePhase = ({
  dialogue,
  currentMessageIndex,
  onPreviousMessage,
  onNextMessage,
  isLastMessage,
  totalMessages,
}) => {
  const [playingBubble, setPlayingBubble] = useState(null);
  const [sound, setSound] = useState(null);
  const scrollViewRef = useRef(null);
  const bubbleAnimations = useRef({});

  React.useEffect(() => {
    dialogue.messages.forEach((_, index) => {
      if (!bubbleAnimations.current[index]) {
        bubbleAnimations.current[index] = new Animated.Value(0);
      }
    });
  }, [dialogue]);

  React.useEffect(() => {
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

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playBubbleAudio = async (messageIndex) => {
    const message = dialogue.messages[messageIndex];
    if (!message?.audio || playingBubble === messageIndex) return;

    try {
      setPlayingBubble(messageIndex);
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        typeof message.audio === 'string' ? { uri: message.audio } : message.audio
      );

      setSound(newSound);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) setPlayingBubble(null);
      });
    } catch (error) {
      log.error('Erreur audio:', error);
      setPlayingBubble(null);
    }
  };

  const renderBubble = (message, index) => {
    const position = dialogue.characters?.findIndex(c => c.name === message.speaker) % 2 === 0 ? 'left' : 'right';
    const isVisible = index <= currentMessageIndex;
    const isPlaying = playingBubble === index;
    const characterColor = dialogue.characters?.find(c => c.name === message.speaker)?.color || '#06B6D4';

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
              { color: position === 'right' ? '#FFFFFF' : '#2C3E50' } // Blanc pour bulle droite, gris foncé pour gauche
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
      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
        {dialogue.messages?.map((message, index) => renderBubble(message, index))}
      </ScrollView>
      <View style={styles.navigationBar}>
        <TouchableOpacity style={[styles.navButton, !currentMessageIndex && styles.navButtonDisabled]} onPress={onPreviousMessage} disabled={currentMessageIndex === 0}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navigationText}>{currentMessageIndex + 1} / {totalMessages}</Text>
        <TouchableOpacity style={[styles.navButton, isLastMessage ? styles.navButtonFinish : styles.navButtonNext]} onPress={onNextMessage}>
          <Ionicons name={isLastMessage ? 'checkmark' : 'chevron-forward'} size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// =================== PHASE 2: QUESTIONS ===================

const QuestionPhase = ({ question, selectedOption, isValidated, isCorrect, onAnswer, color }) => {
  const getLetterFromIndex = index => String.fromCodePoint(65 + index);
  const handleAnswer = (letter) => onAnswer?.(letter);
  const questionOptions = question.options || [];
  const correctAnswerLetter = getLetterFromIndex(questionOptions.indexOf(question.correctAnswer));

  return (
    <View style={[styles.questionContainer, { borderTopColor: color }]}>
      <View style={[styles.colorBar, { backgroundColor: color, shadowColor: color }]} />
      <View style={styles.questionHeader}>
        <Text style={[styles.questionHeaderLabel, { color: color }]}>🎯 Compréhension</Text>
      </View>
      <View style={styles.questionContent}>
        <QuestionCard
          questionIndex={0}
          question={question.question}
          options={questionOptions}
          correctAnswer={correctAnswerLetter}
          moduleType="dialogue"
          showStars={false}
          hint={question.hint}
          externalSelectedOption={selectedOption}
          externalIsAnswered={isValidated}
          externalShowFeedback={isValidated}
          externalIsCorrect={isCorrect}
          onAnswer={handleAnswer}
          theme="light"
        />
      </View>
    </View>
  );
};

// =================== PROPTYPES CORRIGÉS ===================

DialoguePhase.propTypes = {
  dialogue: PropTypes.shape({
    characters: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string
    })),
    messages: PropTypes.arrayOf(PropTypes.shape({
      speaker: PropTypes.string,
      text: PropTypes.string,
      textFr: PropTypes.string,
      audio: PropTypes.any
    })),
  }).isRequired,
  currentMessageIndex: PropTypes.number.isRequired,
  onPreviousMessage: PropTypes.func.isRequired,
  onNextMessage: PropTypes.func.isRequired,
  isLastMessage: PropTypes.bool.isRequired,
  totalMessages: PropTypes.number.isRequired,
};

QuestionPhase.propTypes = {
  question: PropTypes.shape({
    question: PropTypes.string,
    options: PropTypes.array,
    correctAnswer: PropTypes.string,
    hint: PropTypes.string,
  }).isRequired,
  selectedOption: PropTypes.string,
  isValidated: PropTypes.bool,
  isCorrect: PropTypes.bool,
  onAnswer: PropTypes.func,
  color: PropTypes.string,
};

DialogueCard.propTypes = {
  dialogue: PropTypes.object,
  currentMessageIndex: PropTypes.number,
  onPreviousMessage: PropTypes.func,
  onNextMessage: PropTypes.func,
  isLastMessage: PropTypes.bool,
  totalMessages: PropTypes.number,
  question: PropTypes.object,
  selectedOption: PropTypes.string,
  isValidated: PropTypes.bool,
  isCorrect: PropTypes.bool,
  onAnswer: PropTypes.func,
  color: PropTypes.string,
};

export default DialogueCard;