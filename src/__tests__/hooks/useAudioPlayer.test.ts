/**
 * Tests: useAudioPlayer
 * Couvre : playAudio, speakText (audioUrl + TTS), stopSpeech, preprocessTextForTTS (via speakText)
 */

import { renderHook, act } from '@testing-library/react-native';

jest.useFakeTimers();

const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  remove: jest.fn(),
  addListener: jest.fn(),
};

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn().mockReturnValue(mockPlayer),
}));
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light' },
}));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock('@/hooks/usePreferences', () => ({
  usePreferences: jest.fn().mockReturnValue({ prefs: { hapticsEnabled: true }, updatePref: jest.fn() }),
}));

import { useAudioPlayer } from '@/components/ui/AudioButtons/hooks/useAudioPlayer';

beforeEach(() => {
  jest.clearAllMocks();
  // Réinjecter le mock player après clearAllMocks
  const { createAudioPlayer } = require('expo-audio');
  createAudioPlayer.mockReturnValue(mockPlayer);
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
    const { createAudioPlayer } = require('expo-audio');
    expect(createAudioPlayer).not.toHaveBeenCalled();
  });

  it('crée et joue le son quand audioSource est fourni', async () => {
    const { result } = renderHook(() => useAudioPlayer('file://test.mp3'));
    await act(async () => { await result.current.playAudio(); });
    const { createAudioPlayer } = require('expo-audio');
    expect(createAudioPlayer).toHaveBeenCalledWith({ uri: 'file://test.mp3' });
    expect(mockPlayer.play).toHaveBeenCalled();
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

    // Simuler l'event playbackStatusUpdate avec didJustFinish=true
    expect(mockPlayer.addListener).toHaveBeenCalledWith('playbackStatusUpdate', expect.any(Function));
    const statusCallback = mockPlayer.addListener.mock.calls[0][1];
    act(() => { statusCallback({ isLoaded: true, didJustFinish: true }); });
    expect(result.current.isPlayingAudio).toBe(false);
  });

  it('gère les erreurs createAudioPlayer sans crasher et logue l\'erreur', async () => {
    const { createAudioPlayer } = require('expo-audio');
    createAudioPlayer.mockImplementationOnce(() => { throw new Error('load error'); });
    const { result } = renderHook(() => useAudioPlayer('file://bad.mp3'));
    await act(async () => { await result.current.playAudio(); });
    expect(result.current.isPlayingAudio).toBe(false);
    const { log } = require('@/utils/logUtils');
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('playAudio'), expect.any(Error));
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

  it('utilise expo-audio si audioUrl fourni', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    await act(async () => {
      await result.current.speakText('hello', { audioUrl: 'https://cdn.example.com/hello.mp3' });
    });
    const { createAudioPlayer } = require('expo-audio');
    expect(createAudioPlayer).toHaveBeenCalledWith({ uri: 'https://cdn.example.com/hello.mp3' });
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

// ──────────────────────────────────────────────
// Préférence Vibrations — BUG RÉEL : hapticsEnabled n'était lu nulle part, le switch des
// Réglages n'avait aucun effet réel sur les vibrations.
// ──────────────────────────────────────────────

describe('respect de la préférence hapticsEnabled', () => {
  it('déclenche la vibration quand hapticsEnabled=true (comportement par défaut)', async () => {
    const { result } = renderHook(() => useAudioPlayer('http://example.com/a.mp3'));
    await act(async () => { await result.current.playAudio(); });
    const Haptics = require('expo-haptics');
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('ne déclenche aucune vibration quand hapticsEnabled=false', async () => {
    const { usePreferences } = require('@/hooks/usePreferences');
    usePreferences.mockReturnValue({ prefs: { hapticsEnabled: false }, updatePref: jest.fn() });

    const { result } = renderHook(() => useAudioPlayer('http://example.com/a.mp3'));
    await act(async () => { await result.current.playAudio(); });
    const Haptics = require('expo-haptics');
    expect(Haptics.impactAsync).not.toHaveBeenCalled();

    usePreferences.mockReturnValue({ prefs: { hapticsEnabled: true }, updatePref: jest.fn() });
  });
});
