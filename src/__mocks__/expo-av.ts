/**
 * Mock expo-av
 */
const mockSound = {
  loadAsync: jest.fn().mockResolvedValue(undefined),
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  setOnPlaybackStatusUpdate: jest.fn(),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
};

export const Audio = {
  Sound: {
    createAsync: jest.fn().mockResolvedValue({ sound: mockSound, status: { isLoaded: true } }),
  },
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
};

export const Video = 'Video';

export type AVPlaybackStatus = {
  isLoaded: boolean;
  isPlaying?: boolean;
  didJustFinish?: boolean;
};

export default { Audio, Video };
