/**
 * Mock @react-native-async-storage/async-storage for Jest tests
 */

const store: Record<string, string> = {};

const AsyncStorage = {
  setItem: jest.fn().mockImplementation((key: string, value: string) => {
    store[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn().mockImplementation((key: string) => {
    return Promise.resolve(store[key] ?? null);
  }),
  removeItem: jest.fn().mockImplementation((key: string) => {
    delete store[key];
    return Promise.resolve();
  }),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockImplementation(() => {
    Object.keys(store).forEach(k => delete store[k]);
    return Promise.resolve();
  }),
  getAllKeys: jest.fn().mockImplementation(() => Promise.resolve(Object.keys(store))),
};

export default AsyncStorage;
