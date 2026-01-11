import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { styles } from './styles/audioButtonStyle';

interface AudioButtonProps {
  text: string;
  language?: 'en' | 'fr';
  variant?: 'default' | 'onColor';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  idleText?: string;
  playingText?: string;
}

const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  language = 'en',
  variant = 'default',
  size = 'medium',
  icon = '🔊',
  idleText = 'Écouter',
  playingText = 'Lecture...',
}) => {
  const { identity, tokens } = useTheme();
  const { speakText, isPlayingAudio } = useAudioPlayer();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Configuration dynamique basée sur l'identité (Collège / Lycée)
  const isOnColor = variant === 'onColor';
  
  // Les couleurs sont tirées de l'identity, pas codées ici
  const dynamicColors = {
    bg: isOnColor ? 'rgba(255, 255, 255, 0.95)' : identity.branding.main,
    text: isOnColor ? identity.branding.main : '#FFFFFF',
  };

  const currentSize = {
    paddingVertical: size === 'small' ? tokens.spacing.sm : tokens.spacing.md,
    fontSize: size === 'small' ? tokens.fontSize.xs : tokens.fontSize.base,
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.audioButton, 
          styles.shadow,
          { 
            backgroundColor: dynamicColors.bg,
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: tokens.spacing.xl 
          }
        ]} 
        onPress={() => speakText(text, { language })}
        disabled={isPlayingAudio}
        activeOpacity={0.9}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.icon, { fontSize: currentSize.fontSize + 4 }]}>
            {icon}
          </Text>
          <Text style={[
            styles.text, 
            { color: dynamicColors.text, fontSize: currentSize.fontSize }
          ]}>
            {isPlayingAudio ? playingText : idleText}
          </Text>
        </View>
        {isPlayingAudio && <View style={styles.shineEffect} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AudioButton;