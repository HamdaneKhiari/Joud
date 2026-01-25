import { useState, useEffect, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

// On définit les types pour les options du TTS
interface SpeakOptions {
  language?: 'en' | 'fr';
  rate?: number;
  pitch?: number;
  audioUrl?: string;
}

// On définit ce que le Hook retourne exactement
interface AudioPlayerReturn {
  playAudio: () => Promise<void>;
  speakText: (text: string, options?: SpeakOptions) => Promise<void>;
  isPlayingAudio: boolean;
  stopSpeech: () => void;
}

/**
 * Custom Hook TypeScript pour gérer la lecture audio et TTS
 */
export const useAudioPlayer = (
  audioSource?: any, 
  onAudioPlayCallback?: () => void
): AudioPlayerReturn => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // ========== LECTURE FICHIER AUDIO ==========
  const playAudio = async () => {
    if (!audioSource || isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { sound: newSound } = await Audio.Sound.createAsync(audioSource);
      setSound(newSound);

      onAudioPlayCallback?.();
      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
          newSound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Erreur lecture audio:', error);
      setIsPlayingAudio(false);
    }
  };

  // ========== TEXT-TO-SPEECH ==========
  const speakText = useCallback(
    async (text: string, options: SpeakOptions = {}) => {
      if (!text || isPlayingAudio) return;

      const {
        language = 'en',
        rate = 0.9,
        pitch = 1,
      } = options;

      try {
        setIsPlayingAudio(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        onAudioPlayCallback?.();

        const speechOptions: Speech.SpeechOptions = {
          language: language === 'fr' ? 'fr-FR' : 'en-US',
          rate,
          pitch,
          onDone: () => setIsPlayingAudio(false),
          onError: (error) => {
            console.error('Erreur TTS:', error);
            setIsPlayingAudio(false);
          },
        };

        Speech.speak(text, speechOptions);
      } catch (error) {
        console.error('Erreur Text-to-Speech:', error);
        setIsPlayingAudio(false);
      }
    },
    [isPlayingAudio, onAudioPlayCallback]
  );

  // ========== STOP TTS ==========
  const stopSpeech = useCallback(() => {
    Speech.stop();
    setIsPlayingAudio(false);
  }, []);

  // ========== CLEANUP ==========
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      Speech.stop();
    };
  }, [sound]);

  return {
    playAudio,
    speakText,
    isPlayingAudio,
    stopSpeech,
  };
};