import { useState, useEffect, useCallback, useRef } from 'react';
import { createAudioPlayer, AudioPlayer, AudioStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { log } from '@/utils/logUtils';
import { usePreferences } from '@/hooks/usePreferences';

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

export const useAudioPlayer = (
  audioSource?: string | null,
  onAudioPlayCallback?: () => void
): AudioPlayerReturn => {
  const { prefs } = usePreferences();
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const playerRef = useRef<AudioPlayer | null>(null);
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

  const playAudioFile = useCallback(async (url: string) => {
    try {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }

      setPlaying(true);
      if (prefs.hapticsEnabled) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAudioPlayCallback?.();

      const newPlayer = createAudioPlayer({ uri: url });
      playerRef.current = newPlayer;

      newPlayer.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
          newPlayer.remove();
          playerRef.current = null;
        }
      });

      newPlayer.play();
    } catch (e) {
      log.error('[useAudioPlayer] playAudioFile error:', e);
      setPlaying(false);
    }
  }, [onAudioPlayCallback, prefs.hapticsEnabled]);

  const playAudio = useCallback(async () => {
    if (!audioSource || isPlayingRef.current) return;
    try {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
      setPlaying(true);
      if (prefs.hapticsEnabled) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newPlayer = createAudioPlayer({ uri: audioSource });
      playerRef.current = newPlayer;
      onAudioPlayCallback?.();
      newPlayer.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
          newPlayer.remove();
          playerRef.current = null;
        }
      });
      newPlayer.play();
    } catch (e) {
      log.error('[useAudioPlayer] playAudio error:', e);
      setPlaying(false);
    }
  }, [audioSource, onAudioPlayCallback, prefs.hapticsEnabled]);

  // Fallback TTS si pas d'URL audio
  const speakText = useCallback(
    async (text: string, options: SpeakOptions = {}) => {
      if (!text || isPlayingRef.current) return;

      const { language = 'en', rate = 0.9, pitch = 1, audioUrl } = options;

      // Priorité 1 : fichier audio fourni → expo-audio
      if (audioUrl) {
        await playAudioFile(audioUrl);
        return;
      }

      // Priorité 2 : TTS expo-speech
      try {
        setPlaying(true);
        if (prefs.hapticsEnabled) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      } catch (e) {
        log.error('[useAudioPlayer] speakText error:', e);
        clearSafetyTimer();
        setPlaying(false);
      }
    },
    [playAudioFile, onAudioPlayCallback, prefs.hapticsEnabled]
  );

  const stopSpeech = useCallback(() => {
    clearSafetyTimer();
    Speech.stop();
    if (playerRef.current) {
      const player = playerRef.current;
      playerRef.current = null;
      try {
        player.pause();
      } catch {
        // Le player peut déjà être libéré (playback terminé entre-temps)
      }
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      clearSafetyTimer();
      Speech.stop();
      if (playerRef.current) {
        playerRef.current.remove();
      }
    };
  }, []);

  return { playAudio, speakText, isPlayingAudio, stopSpeech };
};