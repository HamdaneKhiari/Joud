/**
 * Mock expo-secure-store for Jest tests
 */

const store: Record<string, string> = {};

export const setItemAsync = jest.fn().mockImplementation((key: string, value: string) => {
  store[key] = value;
  return Promise.resolve();
});

export const getItemAsync = jest.fn().mockImplementation((key: string) => {
  return Promise.resolve(store[key] ?? null);
});

export const deleteItemAsync = jest.fn().mockImplementation((key: string) => {
  delete store[key];
  return Promise.resolve();
});

export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'WhenUnlockedThisDeviceOnly';

export default { setItemAsync, getItemAsync, deleteItemAsync, WHEN_UNLOCKED_THIS_DEVICE_ONLY };
