/**
 * Tests: useAudioPlayer
 * Couvre : playAudio, speakText (audioUrl + TTS), stopSpeech, preprocessTextForTTS (via speakText)
 */

import { renderHook, act } from '@testing-library/react-native';

jest.useFakeTimers();

const mockSound = {
  playAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  setOnPlaybackStatusUpdate: jest.fn(),
};

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({ sound: mockSound }),
    },
  },
}));
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light' },
}));

import { useAudioPlayer } from '@/components/ui/AudioButtons/hooks/useAudioPlayer';

beforeEach(() => {
  jest.clearAllMocks();
  // Réinjecter le mock sound après clearAllMocks
  const { Audio } = require('expo-av');
  Audio.Sound.createAsync.mockResolvedValue({ sound: mockSound });
});

afterEach(() => {
  jest.clearAllTimers();
});

// ──────────────────────────────────────────────
// Etat initial
// ──────────────────────────────────────────────

describe('useAudioPlayer — état initial', () => {
  it('isPlayingAudio=false au départ', () => {
    const { result } = renderHook(() => useAudioPlayer());
    expect(result.current.isPlayingAudio).toBe(false);
  });
});

// ──────────────────────────────────────────────
// playAudio
// ──────────────────────────────────────────────

describe('playAudio', () => {
  it('ne fait rien si audioSource est null', async () => {
    const { result } = renderHook(() => useAudioPlayer(null));
    await act(async () => { await result.current.playAudio(); });
    const { Audio } = require('expo-av');
    expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
  });

  it('crée et joue le son quand audioSource est fourni', async () => {
    const { result } = renderHook(() => useAudioPlayer('file://test.mp3'));
    await act(async () => { await result.current.playAudio(); });
    const { Audio } = require('expo-av');
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
    expect(mockSound.playAsync).toHaveBeenCalled();
  });

  it('appelle le callback onAudioPlayCallback', async () => {
    const onPlay = jest.fn();
    const { result } = renderHook(() => useAudioPlayer('file://test.mp3', onPlay));
    await act(async () => {
      await result.current.playAudio();
      await Promise.resolve();
    });
    expect(onPlay).toHaveBeenCalled();
  });

  it('remet isPlayingAudio à false sur playback finish', async () => {
    const { result } = renderHook(() => useAudioPlayer('file://test.mp3'));
    await act(async () => {
      await result.current.playAudio();
      await Promise.resolve();
    });

    // Simuler onPlaybackStatusUpdate avec didJustFinish=true
    expect(mockSound.setOnPlaybackStatusUpdate).toHaveBeenCalled();
    const statusCallback = mockSound.setOnPlaybackStatusUpdate.mock.calls[0][0];
    act(() => { statusCallback({ isLoaded: true, didJustFinish: true }); });
    expect(result.current.isPlayingAudio).toBe(false);
  });

  it('gère les erreurs createAsync sans crasher', async () => {
    const { Audio } = require('expo-av');
    Audio.Sound.createAsync.mockRejectedValueOnce(new Error('load error'));
    const { result } = renderHook(() => useAudioPlayer('file://bad.mp3'));
    await act(async () => { await result.current.playAudio(); });
    expect(result.current.isPlayingAudio).toBe(false);
  });
});

// ──────────────────────────────────────────────
// speakText
// ──────────────────────────────────────────────

describe('speakText', () => {
  it('ne fait rien si text vide', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText(''); });
    const Speech = require('expo-speech');
    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('utilise expo-av si audioUrl fourni', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => {
      await result.current.speakText('hello', { audioUrl: 'https://cdn.example.com/hello.mp3' });
    });
    const { Audio } = require('expo-av');
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
  });

  it('utilise TTS si pas d\'audioUrl', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('hello'); });
    const Speech = require('expo-speech');
    expect(Speech.speak).toHaveBeenCalled();
  });

  it('passe la langue fr-FR pour language=fr', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('bonjour', { language: 'fr' }); });
    const Speech = require('expo-speech');
    const [, opts] = Speech.speak.mock.calls[0];
    expect(opts.language).toBe('fr-FR');
  });

  it('passe la langue en-US par défaut', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('hello'); });
    const Speech = require('expo-speech');
    const [, opts] = Speech.speak.mock.calls[0];
    expect(opts.language).toBe('en-US');
  });
});

// ──────────────────────────────────────────────
// preprocessTextForTTS (via speakText)
// ──────────────────────────────────────────────

describe('preprocessTextForTTS (via speakText)', () => {
  it('ajoute un point pour les mots ≤ 3 chars', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('it'); });
    const Speech = require('expo-speech');
    const [text] = Speech.speak.mock.calls[0];
    expect(text).toBe('it.');
  });

  it('convertit en minuscules les mots courts tout en majuscules', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('IT'); });
    const Speech = require('expo-speech');
    const [text] = Speech.speak.mock.calls[0];
    expect(text).toBe('it.');
  });

  it('ne modifie pas les phrases longues', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('She is running fast today'); });
    const Speech = require('expo-speech');
    const [text] = Speech.speak.mock.calls[0];
    expect(text).toBe('She is running fast today');
  });

  it('mot de 4-5 chars (sans majuscules) → pas de point ajouté', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('book'); });
    const Speech = require('expo-speech');
    const [text] = Speech.speak.mock.calls[0];
    expect(text).toBe('book');
  });
});

// ──────────────────────────────────────────────
// stopSpeech
// ──────────────────────────────────────────────

describe('stopSpeech', () => {
  it('appelle Speech.stop et remet isPlayingAudio à false', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('hello'); });
    act(() => { result.current.stopSpeech(); });
    const Speech = require('expo-speech');
    expect(Speech.stop).toHaveBeenCalled();
    expect(result.current.isPlayingAudio).toBe(false);
  });
});

// ──────────────────────────────────────────────
// Timeout de sécurité TTS
// ──────────────────────────────────────────────

describe('safety timeout', () => {
  it('remet isPlayingAudio à false après 10s si onDone ne se déclenche pas', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => { await result.current.speakText('hello'); });
    expect(result.current.isPlayingAudio).toBe(true);
    act(() => { jest.advanceTimersByTime(10001); });
    expect(result.current.isPlayingAudio).toBe(false);
  });
});
