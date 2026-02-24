/**
 * Jest configuration - dual projects:
 *
 * "unit" (this file root level config): pure TypeScript tests with Node env.
 *   → No React Native overhead, no Expo winter runtime issues.
 *   → Covers: tokens, feedback, moduleConfig, logUtils, and future pure-TS utils.
 *
 * When you need component tests (tsx), add a second project block using
 * the jest-expo preset with the react-native environment.
 */
module.exports = {
  // Skip jest-expo preset here to avoid the Expo SDK 54 winter runtime
  // lazy-require crash (structuredClone / __ExpoImportMetaRegistry getters
  // calling require() outside Jest module scope).
  testEnvironment: 'node',

  // Babel transform via expo preset (handles TS, JSX, module aliases)
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        presets: ['babel-preset-expo'],
        caller: { name: 'metro', bundler: 'metro', platform: 'ios' },
      },
    ],
  },

  // Module alias @/ → src/
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Minimal mocks for native modules in the Node.js unit test environment
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
    '^expo-secure-store$': '<rootDir>/src/__mocks__/expo-secure-store.ts',
    '^expo-sqlite$': '<rootDir>/src/__mocks__/expo-sqlite.ts',
    '^expo-router$': '<rootDir>/src/__mocks__/expo-router.ts',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/src/__mocks__/@react-native-async-storage/async-storage.ts',
  },

  // __DEV__ is a React Native global - define it for the Node environment
  globals: {
    __DEV__: true,
  },

  // Only run files inside __tests__ folders
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],

  // Transform Expo/RN packages that ship ESM source
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|twrnc|lucide-react-native)',
  ],
};
