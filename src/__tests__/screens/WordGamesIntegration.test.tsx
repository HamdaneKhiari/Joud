import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import WordGamesExerciseScreen from '@/screens/WordGames/WordGamesExerciseScreen';
import { tokens } from '@/themes/tokens';

// ============================================
// Mocks — Contexts
// ============================================
jest.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    user: { id: 'u1', firstName: 'Alice', audience: 'college', isOnboarded: true },
    loading: false
  })
}));

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: () => ({
    identity: {
      header: { background: '#000' },
      icons: {},
      ui: { cardRadius: 0, showDecorativeShapes: false, mood: 'playful', cardStyle: 'playful' },
      palette: { surface: '#fff', primary: '#000', accent: '#000', background: '#fff' },
      text: { primary: '#000', secondary: '#000', tertiary: '#000', onPrimary: '#fff' },
      iconSize: { md: 24, xs: 12, sm: 16, lg: 32 },
      fontFamily: { bold: 'System', regular: 'System', semibold: 'System', title: 'System' }
    },
    tokens: require('@/themes/tokens').tokens
  })
}));

const mockTrackItemCompletion = jest.fn(() => console.log('trackItemCompletion CALLED!'));
jest.mock('@/contexts/ProgressContext', () => ({
  useProgress: () => ({
    getFamilyProgress: jest.fn().mockReturnValue(0),
    trackItemCompletion: mockTrackItemCompletion,
    saveProgressNow: jest.fn().mockResolvedValue(undefined),
  })
}));

// ============================================
// Mocks — Router & Navigation
// ============================================
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ familyId: '1', levelId: '1' }),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() })
}));
jest.mock('@/hooks/useSafeNavigation', () => ({
  __esModule: true,
  default: () => ({ navigate: jest.fn() })
}));

// ============================================
// Mocks — Hooks
// ============================================
jest.mock('@/hooks/exercises/useExerciseContent', () => ({
  useExerciseContent: () => ({
    module: { slug: 'word_games', icon: 'gamepad-variant' },
    family: { name: 'Animals', icon: 'paw', id: 1 },
    contentItems: [
      {
        id: 1,
        data: {
          type: 'definition',
          word: 'cat',
          definition: 'An animal',
          options: ['chat', 'chien', 'maison'],
          correctAnswer: 'chat'
        }
      }
    ],
    isLoading: false,
    error: null,
  })
}));

jest.mock('@/hooks/exercises/useRecordError', () => ({
  useRecordError: () => ({ recordError: jest.fn() })
}));

jest.mock('@/hooks/exercises/useExerciseActivity', () => ({ useExerciseActivity: jest.fn() }));
jest.mock('@/hooks/exercises/useExerciseSaveOnUnmount', () => ({ useExerciseSaveOnUnmount: jest.fn() }));
jest.mock('@/hooks/exercises/useFirstIncompleteIndex', () => ({
  __esModule: true,
  default: () => () => 0,
  useFirstIncompleteIndex: () => () => 0,
}));
jest.mock('@/utils/labelMapper', () => ({
  useLevelLabel: () => ({ title: 'Niveau 1', badge: '1', description: '' })
}));

jest.mock('@/hooks/useReducedMotion', () => ({
  __esModule: true,
  default: () => true
}));

jest.useFakeTimers();

describe('WordGamesIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('selects option, validates, and tracks completion', () => {
    const { getByText } = render(<WordGamesExerciseScreen />);
    
    // 1. Sélectionner la bonne réponse
    console.log('Pressing answer...');
    const answerButton = getByText('chat');
    fireEvent.press(answerButton);

    console.log('Pressing Valider...');
    const validateButton = getByText('Valider');
    fireEvent.press(validateButton);

    act(() => {
      jest.runAllTimers();
    });

    expect(mockTrackItemCompletion).toHaveBeenCalled();
  });
});
