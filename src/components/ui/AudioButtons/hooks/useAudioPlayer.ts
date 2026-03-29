import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface SpeakOptions {
  language?: 'en' | 'fr';
  rate?: number;
  pitch?: number;
  audioUrl?: string;
}

interface AudioPlayerReturn {
  playAudio: () => Promise<void>;
  speakText: (text: string, options?: SpeakOptions) => Promise<void>;
  isPlayingAudio: boolean;
  stopSpeech: () => void;
}

// Timeout de sécurité : remet isPlayingAudio à false si onDone ne se déclenche pas
const TTS_SAFETY_TIMEOUT_MS = 10000;

/**
 * Prétraite un mot anglais avant envoi au TTS natif.
 * Problème : les mots courts (it, is, a, I...) sont lus comme des acronymes.
 * Solutions :
 *  - Mettre en minuscules (évite "I.T." pour "IT")
 *  - Ajouter un point final (force la lecture comme mot, pas acronyme)
 *  - Entourer de virgules pour les monosyllabes (force une pause/articulation)
 */
const preprocessTextForTTS = (text: string): string => {
  const trimmed = text.trim();

  // Déjà une phrase longue → pas de traitement
  if (trimmed.split(' ').length > 2) return trimmed;

  // Mettre en minuscules les mots courts tout en majuscules (IT → it, IS → is, AI → ai)
  const lowered = trimmed.length <= 5 && trimmed === trimmed.toUpperCase()
    ? trimmed.toLowerCase()
    : trimmed;

  // Monosyllabe ou très court (≤ 3 chars) → ajouter un point pour forcer la lecture comme mot
  if (lowered.replaceAll(/[^a-zA-Z]/g, '').length <= 3) {
    return `${lowered}.`;
  }

  return lowered;
};

/**
 * Custom Hook TypeScript pour gérer la lecture audio et TTS
 */
export const useAudioPlayer = (
  audioSource?: any,
  onAudioPlayCallback?: () => void
): AudioPlayerReturn => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);

  const setPlaying = (val: boolean) => {
    isPlayingRef.current = val;
    setIsPlayingAudio(val);
  };

  const clearSafetyTimer = () => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  };

  // ========== LECTURE FICHIER AUDIO (expo-av) ==========
  const playAudioFile = useCallback(async (url: string) => {
    try {
      // Décharger le son précédent si besoin
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setPlaying(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAudioPlayCallback?.();

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = newSound;

      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
          newSound.unloadAsync();
          soundRef.current = null;
        }
      });

      await newSound.playAsync();
    } catch (_) {
      setPlaying(false);
    }
  }, [onAudioPlayCallback]);

  // ========== LECTURE SOURCE LOCALE (require) ==========
  const playAudio = useCallback(async () => {
    if (!audioSource || isPlayingRef.current) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setPlaying(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { sound: newSound } = await Audio.Sound.createAsync(audioSource);
      soundRef.current = newSound;
      onAudioPlayCallback?.();
      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
          newSound.unloadAsync();
          soundRef.current = null;
        }
      });
      await newSound.playAsync();
    } catch (_) {
      setPlaying(false);
    }
  }, [audioSource, onAudioPlayCallback]);

  // ========== TEXT-TO-SPEECH (fallback si pas d'URL audio) ==========
  const speakText = useCallback(
    async (text: string, options: SpeakOptions = {}) => {
      if (!text || isPlayingRef.current) return;

      const { language = 'en', rate = 0.9, pitch = 1, audioUrl } = options;

      // Priorité 1 : fichier audio fourni → expo-av
      if (audioUrl) {
        await playAudioFile(audioUrl);
        return;
      }

      // Priorité 2 : TTS expo-speech
      try {
        setPlaying(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onAudioPlayCallback?.();

        // Timeout de sécurité — onDone ne se déclenche pas toujours sur Android
        clearSafetyTimer();
        safetyTimerRef.current = setTimeout(() => {
          setPlaying(false);
        }, TTS_SAFETY_TIMEOUT_MS);

        Speech.speak(preprocessTextForTTS(text), {
          language: language === 'fr' ? 'fr-FR' : 'en-US',
          rate,
          pitch,
          onDone: () => {
            clearSafetyTimer();
            setPlaying(false);
          },
          onError: () => {
            clearSafetyTimer();
            setPlaying(false);
          },
        });
      } catch (_) {
        clearSafetyTimer();
        setPlaying(false);
      }
    },
    [playAudioFile, onAudioPlayCallback]
  );

  // ========== STOP ==========
  const stopSpeech = useCallback(() => {
    clearSafetyTimer();
    Speech.stop();
    if (soundRef.current) {
      soundRef.current.stopAsync();
    }
    setPlaying(false);
  }, []);

  // ========== CLEANUP ==========
  useEffect(() => {
    return () => {
      clearSafetyTimer();
      Speech.stop();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return { playAudio, speakText, isPlayingAudio, stopSpeech };
};