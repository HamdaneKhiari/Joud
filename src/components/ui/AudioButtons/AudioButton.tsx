import React, { useRef, useMemo } from 'react';
import { TouchableOpacity, Text, View, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { useAudioPlayer } from '../AudioButtons/hooks/useAudioPlayer';
import { createStyles } from './AudioButtonStyle';

interface AudioButtonProps {
  text: string;
  language?: 'en' | 'fr';
  variant?: 'default' | 'onColor';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  idleText?: string;
  playingText?: string;
  audioUrl?: string;
  style?: ViewStyle | ViewStyle[];
}

const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  language = 'en',
  variant = 'default',
  size = 'medium',
  icon = '🔊',
  idleText,
  playingText = '...',
  audioUrl,
  style,
}) => {
  const { identity, tokens } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);
  const { speakText, isPlayingAudio } = useAudioPlayer();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Mode "icône seule" si aucun texte n'est fourni
  const isIconOnly = !idleText;

  const dynamicColors = {
    bg: variant === 'onColor' ? 'rgba(255, 255, 255, 0.2)' : identity.palette.primary,
    text: variant === 'onColor' ? '#FFFFFF' : identity.text.onPrimary,
  };

  const currentSize = {
    paddingVertical: isIconOnly ? 0 : (size === 'small' ? tokens.spacing.sm : tokens.spacing.md),
    paddingHorizontal: isIconOnly ? 0 : tokens.spacing.xl,
    fontSize: size === 'small' ? tokens.fontSize.xs : tokens.fontSize.base,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity 
        style={[
          styles.audioButton, 
          !isIconOnly && styles.shadow, // Ombre uniquement si c'est un vrai bouton
          { 
            backgroundColor: isIconOnly ? 'transparent' : dynamicColors.bg,
            borderRadius: identity.ui.cardRadius,
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
          }
        ]} 
        onPress={() => speakText(text, { language, audioUrl })}
        disabled={isPlayingAudio}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.icon, { 
            fontSize: currentSize.fontSize + 4,
            marginRight: isIconOnly ? 0 : tokens.spacing.sm 
          }]}>
            {icon}
          </Text>
          {!isIconOnly && (
            <Text style={[
              styles.text, 
              { color: dynamicColors.text, fontSize: currentSize.fontSize }
            ]}>
              {isPlayingAudio ? playingText : idleText}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AudioButton;