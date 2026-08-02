/**
 * Mock expo-audio
 */
const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  remove: jest.fn(),
  replace: jest.fn(),
  seekTo: jest.fn().mockResolvedValue(undefined),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

export const createAudioPlayer = jest.fn().mockReturnValue(mockPlayer);

export const useAudioPlayer = jest.fn().mockReturnValue(mockPlayer);
export const useAudioPlayerStatus = jest.fn().mockReturnValue({ isLoaded: true, playing: false });

export const setAudioModeAsync = jest.fn().mockResolvedValue(undefined);
export const setIsAudioActiveAsync = jest.fn().mockResolvedValue(undefined);
export const requestRecordingPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });

export type AudioPlayer = typeof mockPlayer;
export type AudioStatus = {
  isLoaded: boolean;
  playing?: boolean;
  didJustFinish?: boolean;
};

export default { createAudioPlayer, useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync };
