/**
 * Mock expo-speech
 */
export const speak = jest.fn();
export const stop = jest.fn();
export const isSpeakingAsync = jest.fn().mockResolvedValue(false);
export const getAvailableVoicesAsync = jest.fn().mockResolvedValue([]);

export default { speak, stop, isSpeakingAsync, getAvailableVoicesAsync };
