/**
 * Jest configuration
 *
 * testEnvironment: 'node' — évite le crash structuredClone / __ExpoImportMetaRegistry
 * de l'Expo SDK 54 winter runtime avec jest-expo preset.
 *
 * Les tests de composants (renderHook, render) fonctionnent quand même
 * grâce à react-test-renderer (pas de dépendance DOM).
 * Proof: hooks tests (395 tests passent) et screens tests.
 */
module.exports = {
  testEnvironment: 'node',

  // Setup global — silence les warnings react-test-renderer, etc.
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

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

  // Module alias @/ → src/ + mocks pour tous les modules natifs
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
    '^react-native-reanimated$': '<rootDir>/src/__mocks__/react-native-reanimated.ts',
    '^expo-sqlite$': '<rootDir>/src/__mocks__/expo-sqlite.ts',
    '^expo-router$': '<rootDir>/src/__mocks__/expo-router.ts',
    '^expo-secure-store$': '<rootDir>/src/__mocks__/expo-secure-store.ts',
    '^expo-haptics$': '<rootDir>/src/__mocks__/expo-haptics.ts',
    '^expo-av$': '<rootDir>/src/__mocks__/expo-av.ts',
    '^expo-speech$': '<rootDir>/src/__mocks__/expo-speech.ts',
    '^expo-linear-gradient$': '<rootDir>/src/__mocks__/expo-linear-gradient.ts',
    '^@expo/vector-icons$': '<rootDir>/src/__mocks__/@expo/vector-icons.ts',
    '^@expo/vector-icons/(.*)$': '<rootDir>/src/__mocks__/@expo/vector-icons.ts',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/src/__mocks__/@react-native-async-storage/async-storage.ts',
    '^react-native-safe-area-context$': '<rootDir>/src/__mocks__/react-native-safe-area-context.ts',
    '^@react-navigation/native$': '<rootDir>/src/__mocks__/@react-navigation/native.ts',
  },

  globals: {
    __DEV__: true,
  },

  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/__mocks__/**',
  ],

  // Transform Expo/RN/Reanimated packages qui shippent en ESM
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-reanimated|-community)?|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|twrnc|lucide-react-native)',
  ],
};
