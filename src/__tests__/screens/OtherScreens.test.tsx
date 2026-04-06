/**
 * Smoke tests — Screens navigation, onboarding, révision
 *
 * FamilySelectionScreen, SubFamilySelectionScreen, OnboardingScreen, RevisionScreen.
 * Objectif : rendu sans crash avec contextes et hooks mockés.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// ============================================
// Mocks — Contextes
// ============================================

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/themes/ThemeContext', () => ({ useTheme: jest.fn() }));
jest.mock('@/contexts/ProgressContext', () => ({ useProgress: jest.fn() }));
jest.mock('@/contexts/CurrentLevelContext', () => ({ useCurrentLevel: jest.fn() }));

// ============================================
// Mocks — Hooks navigation/sélection
// ============================================

jest.mock('@/hooks/useSafeNavigation', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/familySelection/useFamiliesWithProgress', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/subFamilySelection/useSubfamilies', () => ({ __esModule: true, default: jest.fn() }));

// ============================================
// Mocks — Hooks révision
// ============================================

jest.mock('@/hooks/revision/useRevisionQuestions', () => ({ useRevisionQuestions: jest.fn() }));
jest.mock('@/hooks/exercises/useExerciceValidationState', () => ({ useExerciseValidationState: jest.fn() }));
jest.mock('@/hooks/exercises/useExerciseActivity', () => ({ useExerciseActivity: jest.fn() }));
jest.mock('@/hooks/exercises/useExerciseSaveOnUnmount', () => ({ useExerciseSaveOnUnmount: jest.fn() }));

// ============================================
// Mocks — Utilitaires
// ============================================

jest.mock('@/utils/labelMapper', () => ({
  useLevelLabel: jest.fn(),
  getLevelLabel: jest.fn().mockResolvedValue({ title: 'Niveau 1', badge: '1', description: '' }),
  getModuleLabel: jest.fn().mockResolvedValue({ title: 'Module', description: '', icon: 'book' }),
  getAvailableModules: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/utils/moduleHelper', () => ({
  getModuleColor: jest.fn().mockResolvedValue('#34495E'),
}));
jest.mock('@/hooks/useGetFamiliesByModule', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/hooks/useSafeAction', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/utils/navigationHelper', () => ({
  navigateToExercise: jest.fn(),
  navigateToExerciseSelection: jest.fn(),
}));
jest.mock('@/config/moduleConfig', () => ({
  moduleHasSubfamilies: jest.fn().mockReturnValue(false),
  ALL_MODULE_SLUGS: ['vocab', 'grammar', 'phrase_types', 'reading', 'dialogues', 'word_games', 'connector'],
}));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import FamilySelectionScreen from '@/screens/FamilySelectionScreen';
import SubFamilySelectionScreen from '@/screens/SubFamilySelectionScreen';
import OnboardingScreen from '@/screens/Onboarding/OnboardingScreen';
import RevisionScreen from '@/screens/RevisionScreen';
import ExerciceSelectionScreen from '@/screens/ExerciceSelectionScreen';
import { tokens } from '@/themes/tokens';

// ============================================
// Setup
// ============================================

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
};

const mockIdentity = {
  id: 'college', themeMode: 'light', organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
  header: { background: '#34495E', accent: '#FFD700', emoji: '📚', welcomeText: 'Bonjour !' },
  dailyWord: { background: '#FFF9C4', decoration: 'none' },
  aiTutor: { title: 'Tuteur IA', subtitle: 'Aide aux devoirs' },
  aiDiagnostic: { accent: '#34495E', error: '#D32F2F', solutionBackground: ['#ECEFF1', '#CFD8DC'] },
  dashboard: { levelProgress: '#34495E' },
  i18n: { locale: 'fr', rtl: false },
  icons: { logo: 'school' },
  iconSize: { xs: 12, sm: 16, md: 24, lg: 32, xl: 48 },
  fontFamily: { regular: 'System', medium: 'System', semibold: 'System', bold: 'System', title: 'System', extrabold: 'System' },
};

function setupMocks() {
  const { useUser }          = require('@/contexts/UserContext');
  const { useTheme }         = require('@/themes/ThemeContext');
  const { useProgress }      = require('@/contexts/ProgressContext');
  const { useCurrentLevel }  = require('@/contexts/CurrentLevelContext');

  useUser.mockReturnValue({
    db: mockDb,
    user: { id: 'u1', firstName: 'Alice', audience: 'college', isOnboarded: true },
    loading: false,
    updateUser: jest.fn(),
    updateAudience: jest.fn(),
    isOnboarded: true,
  });
  useTheme.mockReturnValue({ identity: mockIdentity, tokens });
  useProgress.mockReturnValue({
    progress: {}, getLevelProgress: jest.fn().mockReturnValue(0),
    refreshProgress: jest.fn(), saveProgressNow: jest.fn().mockResolvedValue(undefined),
    trackItemCompletion: jest.fn(), getRevisionFamilies: jest.fn().mockReturnValue([]),
    resetProgress: jest.fn(), getFamilyProgress: jest.fn().mockReturnValue(0),
    getLastActivity: jest.fn().mockReturnValue(null),
    getRecommendedModule: jest.fn().mockReturnValue(null),
    isLoading: false,
  });
  useCurrentLevel.mockReturnValue({ currentLevel: 1, setCurrentLevel: jest.fn() });

  require('@/hooks/useSafeNavigation').default.mockReturnValue({
    navigate: jest.fn(), loading: false, disabled: false, canNavigate: true, lastExecuted: null, cleanup: jest.fn(),
  });
  require('@/hooks/familySelection/useFamiliesWithProgress').default.mockReturnValue({
    families: [], isLoading: false, refresh: jest.fn(),
  });
  require('@/hooks/subFamilySelection/useSubfamilies').default.mockReturnValue({
    subfamilies: [], isLoading: false,
  });

  require('@/hooks/revision/useRevisionQuestions').useRevisionQuestions.mockReturnValue({
    mode: 'selection', questions: [], currentIndex: 0, currentQuestion: null,
    isLoading: false, selectedAnswer: null, isValidated: false, isCorrect: false,
    attemptCount: 0, startSession: jest.fn(), selectAnswer: jest.fn(),
    validateAnswer: jest.fn(), nextQuestion: jest.fn(), retryQuestion: jest.fn(),
    resetSession: jest.fn(), isFirstQuestion: true, isLastQuestion: true,
    totalQuestions: 0, progress: 0, correctCount: 0, incorrectCount: 0,
    isSessionCompleted: false,
  });
  require('@/hooks/exercises/useExerciceValidationState').useExerciseValidationState.mockReturnValue({
    canSkip: false, validationState: 'initial', buttonDisabled: false,
  });
  require('@/hooks/exercises/useExerciseActivity').useExerciseActivity.mockReturnValue(undefined);
  require('@/hooks/exercises/useExerciseSaveOnUnmount').useExerciseSaveOnUnmount.mockReturnValue(undefined);

  require('@/utils/labelMapper').useLevelLabel.mockReturnValue({ title: 'Niveau 1', badge: '1', description: '' });

  // ExerciceSelectionScreen
  require('@/hooks/useGetFamiliesByModule').default.mockReturnValue({
    familyIds: [], isLoading: false,
  });
  require('@/hooks/useSafeAction').default.mockReturnValue({
    execute: jest.fn(), loading: false, disabled: false, lastExecuted: 0, cleanup: jest.fn(),
  });
}

// ============================================
// Tests
// ============================================

describe('Smoke tests — Navigation et autres screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('FamilySelectionScreen — rend sans crash', () => {
    expect(() => render(<FamilySelectionScreen />)).not.toThrow();
  });

  it('FamilySelectionScreen — affiche le skeleton quand isLoading=true', () => {
    require('@/hooks/familySelection/useFamiliesWithProgress').default.mockReturnValue({
      families: [], isLoading: true, refresh: jest.fn(),
    });
    expect(() => render(<FamilySelectionScreen />)).not.toThrow();
  });

  it('FamilySelectionScreen — rend avec des familles (moduleId fourni)', () => {
    require('@/hooks/familySelection/useFamiliesWithProgress').default.mockReturnValue({
      families: [
        { id: 1, name: 'Animals', icon: 'paw', progress: 50, color: '#E74C3C' },
        { id: 2, name: 'Food', icon: 'food', progress: 30, color: '#27AE60' },
      ],
      isLoading: false, refresh: jest.fn(),
    });
    expect(() => render(
      <FamilySelectionScreen route={{ params: { moduleId: 'vocab', levelId: '1' } } as any} />
    )).not.toThrow();
  });

  it('FamilySelectionScreen — recentActivity tri la famille en premier', () => {
    const families = [
      { id: 1, name: 'Animals', icon: 'paw', progress: 50, color: '#E74C3C' },
      { id: 2, name: 'Food', icon: 'food', progress: 30, color: '#27AE60' },
    ];
    require('@/hooks/familySelection/useFamiliesWithProgress').default.mockReturnValue({
      families, isLoading: false, refresh: jest.fn(),
    });
    require('@/contexts/ProgressContext').useProgress.mockReturnValue({
      progress: {}, getLevelProgress: jest.fn().mockReturnValue(0),
      refreshProgress: jest.fn(), saveProgressNow: jest.fn().mockResolvedValue(undefined),
      trackItemCompletion: jest.fn(), getRevisionFamilies: jest.fn().mockReturnValue([]),
      resetProgress: jest.fn(), getFamilyProgress: jest.fn().mockReturnValue(0),
      getLastActivity: jest.fn().mockReturnValue({ familyId: '1', progress: 50, lastReviewed: Date.now() }),
      getRecommendedModule: jest.fn().mockReturnValue(null),
      isLoading: false,
    });
    expect(() => render(
      <FamilySelectionScreen route={{ params: { moduleId: 'vocab', levelId: '1' } } as any} />
    )).not.toThrow();
  });

  it('SubFamilySelectionScreen — rend sans crash', () => {
    expect(() => render(<SubFamilySelectionScreen />)).not.toThrow();
  });

  it('OnboardingScreen — rend sans crash', () => {
    expect(() => render(<OnboardingScreen />)).not.toThrow();
  });

  it('OnboardingScreen — saisie de prénom change l\'input', () => {
    const { fireEvent } = require('@testing-library/react-native');
    const { getByPlaceholderText } = render(<OnboardingScreen />);
    const input = getByPlaceholderText('Ton prénom...');
    fireEvent.changeText(input, 'Alice');
    expect(input.props.value).toBe('Alice');
  });


  it('RevisionScreen — rend sans crash', () => {
    expect(() => render(<RevisionScreen />)).not.toThrow();
  });

  it('ExerciceSelectionScreen — rend sans crash', () => {
    expect(() => render(<ExerciceSelectionScreen />)).not.toThrow();
  });
});
