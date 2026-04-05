/**
 * Smoke tests — Screens d'exercices
 *
 * Objectif : chaque screen rend sans crash avec tous les hooks mockés.
 * Pas d'interactions testées ici — c'est le filet de sécurité de base.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// ============================================
// Mocks — Contextes
// ============================================

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/themes/ThemeContext', () => ({ useTheme: jest.fn() }));
jest.mock('@/contexts/ProgressContext', () => ({ useProgress: jest.fn() }));

// ============================================
// Mocks — Hooks exercices partagés
// ============================================

jest.mock('@/hooks/exercises/useExerciseContent', () => ({ useExerciseContent: jest.fn() }));
jest.mock('@/hooks/exercises/useExerciseSaveOnUnmount', () => ({ useExerciseSaveOnUnmount: jest.fn() }));
jest.mock('@/hooks/exercises/useExerciseActivity', () => ({ useExerciseActivity: jest.fn() }));
jest.mock('@/hooks/exercises/useFirstIncompleteIndex', () => ({
  __esModule: true,
  useFirstIncompleteIndex: jest.fn(),
  default: jest.fn(),
}));
jest.mock('@/hooks/exercises/useExerciceValidationState', () => ({ useExerciseValidationState: jest.fn() }));
jest.mock('@/hooks/exercises/useRecordError', () => ({ useRecordError: jest.fn() }));
jest.mock('@/hooks/exercises/useRecordWordSeen', () => ({ useRecordWordSeen: jest.fn() }));
jest.mock('@/hooks/useSafeNavigation', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/labelMapper', () => ({
  useLevelLabel: jest.fn(),
  getLevelLabel: jest.fn().mockResolvedValue({ title: 'Niveau 1', badge: '1', description: '' }),
  getModuleLabel: jest.fn().mockResolvedValue({ title: 'Module', description: '', icon: 'book' }),
  getAvailableModules: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/utils/navigationHelper', () => ({ navigateToExerciseSelection: jest.fn() }));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));
jest.mock('@/utils/feedback', () => ({ generateFeedbackMessage: jest.fn().mockReturnValue('') }));

// ============================================
// Mocks — Hooks spécifiques par screen
// ============================================

jest.mock('@/screens/GrammarScreen/hooks/useGrammarContent', () => ({ useGrammarContent: jest.fn() }));
jest.mock('@/screens/ReadingScreen/hooks/useReadingContent', () => ({ useReadingContent: jest.fn() }));
jest.mock('@/screens/ReadingScreen/hooks/useReadingState', () => ({ useReadingState: jest.fn() }));
jest.mock('@/screens/ReadingScreen/hooks/useReadingHandlers', () => ({ useReadingHandlers: jest.fn() }));
jest.mock('@/screens/DialoguesScreen/hooks/useDialogueContent', () => ({ useDialogueContent: jest.fn() }));
jest.mock('@/screens/ConnectorScreen/hooks/useConnectorContent', () => ({ useConnectorContent: jest.fn() }));
jest.mock('@/screens/ConnectorScreen/hooks/useConnectorState', () => ({ useConnectorState: jest.fn() }));
jest.mock('@/screens/ConnectorScreen/hooks/useConnectorHandlers', () => ({ useConnectorHandlers: jest.fn() }));
jest.mock('@/screens/WordGames/hooks/useGameState', () => ({ useGameState: jest.fn() }));
jest.mock('@/screens/WordGames/hooks/useGameHandlers', () => ({ useGameHandlers: jest.fn() }));

// ============================================
// Mocks — Données / DB
// ============================================

jest.mock('@/database/queries', () => ({
  getLevelsByAudience: jest.fn().mockResolvedValue([]),
  upsertProgress: jest.fn().mockResolvedValue(undefined),
}));

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import VocabularyScreen from '@/screens/VocabularyScreen/VocabularyExerciceScreen';
import GrammarScreen from '@/screens/GrammarScreen/GrammarExerciseScreen';
import SentenceScreen from '@/screens/SentenceScreen/SentenceExerciceScreen';
import ReadingScreen from '@/screens/ReadingScreen/ReadingExerciseScreen';
import DialogueScreen from '@/screens/DialoguesScreen/DialogueExerciseScreen';
import WordGamesScreen from '@/screens/WordGames/WordGamesExerciseScreen';
import ConnectorScreen from '@/screens/ConnectorScreen/ConnectorExerciseScreen';
import { tokens } from '@/themes/tokens';

// ============================================
// Setup global des mocks
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

const mockNav = { navigate: jest.fn(), loading: false, disabled: false, canNavigate: true, lastExecuted: null, cleanup: jest.fn() };
const getFirstIncomplete = jest.fn().mockReturnValue(0);

function setupMocks() {
  const { useUser }    = require('@/contexts/UserContext');
  const { useTheme }   = require('@/themes/ThemeContext');
  const { useProgress } = require('@/contexts/ProgressContext');

  useUser.mockReturnValue({ db: mockDb, user: { id: 'u1', firstName: 'Alice', audience: 'college', isOnboarded: true }, loading: false });
  useTheme.mockReturnValue({ identity: mockIdentity, tokens });
  useProgress.mockReturnValue({
    progress: {}, getLevelProgress: jest.fn().mockReturnValue(0),
    refreshProgress: jest.fn(), saveProgressNow: jest.fn().mockResolvedValue(undefined),
    trackItemCompletion: jest.fn(), getRevisionFamilies: jest.fn().mockReturnValue([]),
    resetProgress: jest.fn(), getFamilyProgress: jest.fn().mockReturnValue(0),
  });

  require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
    module: null, family: null, contentItems: [], isLoading: false, error: null,
  });
  require('@/hooks/exercises/useExerciseSaveOnUnmount').useExerciseSaveOnUnmount.mockReturnValue(undefined);
  require('@/hooks/exercises/useExerciseActivity').useExerciseActivity.mockReturnValue(undefined);
  require('@/hooks/exercises/useFirstIncompleteIndex').default.mockReturnValue(getFirstIncomplete);
  require('@/hooks/exercises/useFirstIncompleteIndex').useFirstIncompleteIndex.mockReturnValue(getFirstIncomplete);
  require('@/hooks/exercises/useExerciceValidationState').useExerciseValidationState.mockReturnValue({
    canSkip: false, validationState: 'initial', buttonDisabled: false,
  });
  require('@/hooks/exercises/useRecordError').useRecordError.mockReturnValue({ recordError: jest.fn() });
  require('@/hooks/exercises/useRecordWordSeen').useRecordWordSeen.mockReturnValue({ recordWordSeen: jest.fn() });
  require('@/hooks/useSafeNavigation').default.mockReturnValue(mockNav);
  require('@/utils/labelMapper').useLevelLabel.mockReturnValue({ title: 'Niveau 1', badge: '1', description: '' });

  require('@/screens/GrammarScreen/hooks/useGrammarContent').useGrammarContent.mockReturnValue({ grammarFamily: null, loading: false });
  require('@/screens/ReadingScreen/hooks/useReadingContent').useReadingContent.mockReturnValue({ questions: [], loading: false });
  require('@/screens/ReadingScreen/hooks/useReadingState').useReadingState.mockReturnValue({ state: {}, setState: jest.fn(), resetState: jest.fn() });
  require('@/screens/ReadingScreen/hooks/useReadingHandlers').useReadingHandlers.mockReturnValue({ handleAnswer: jest.fn(), handleNext: jest.fn(), handleSkip: jest.fn() });
  require('@/screens/DialoguesScreen/hooks/useDialogueContent').useDialogueContent.mockReturnValue({ dialogue: null, isLoading: false });
  require('@/screens/ConnectorScreen/hooks/useConnectorContent').useConnectorContent.mockReturnValue({ questions: [], loading: false });
  require('@/screens/ConnectorScreen/hooks/useConnectorState').useConnectorState.mockReturnValue({
    logicState: {}, fusionState: {}, rephrasingState: {},
    setLogicState: jest.fn(), setFusionState: jest.fn(), setRephrasingState: jest.fn(),
    resetAllStates: jest.fn(),
  });
  require('@/screens/ConnectorScreen/hooks/useConnectorHandlers').useConnectorHandlers.mockReturnValue({
    logic: { onAnswer: jest.fn(), onValidate: jest.fn(), onRetry: jest.fn(), onNext: jest.fn() },
    fusion: { onAnswer: jest.fn(), onValidate: jest.fn(), onRetry: jest.fn(), onNext: jest.fn() },
    rephrasing: { onAnswer: jest.fn(), onValidate: jest.fn(), onRetry: jest.fn(), onNext: jest.fn() },
  });
  require('@/screens/WordGames/hooks/useGameState').useGameState.mockReturnValue({
    builderState: {}, setBuilderState: jest.fn(),
    definitionState: {}, setDefinitionState: jest.fn(),
    blanksState: {}, setBlanksState: jest.fn(),
    sentenceState: {}, setSentenceState: jest.fn(),
    detectiveState: {}, setDetectiveState: jest.fn(),
    replyState: {}, setReplyState: jest.fn(),
    transformerState: {}, setTransformerState: jest.fn(),
    resetAllStates: jest.fn(), getCurrentState: jest.fn().mockReturnValue({}),
  });
  require('@/screens/WordGames/hooks/useGameHandlers').useGameHandlers.mockReturnValue({
    builder: { onSelect: jest.fn() }, definition: { onSelect: jest.fn() },
    blanks: { onSelect: jest.fn() }, sentence: { onAnswer: jest.fn() },
    detective: { onSelect: jest.fn() }, speed: { onComplete: jest.fn() },
    audio_match: { onComplete: jest.fn() }, reply: { onAnswer: jest.fn() },
    transformer: { onAnswer: jest.fn() },
  });
}

// ============================================
// Tests
// ============================================

// Screens ancienne API react-navigation passent route/navigation comme props
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockRoute = { params: { familyId: '101', levelId: '1', exerciseType: 'vocab', subfamilyId: '0', moduleId: '1', title: 'Test', moduleColor: '#34495E' } };
const mockNavigationProp = { navigate: jest.fn(), goBack: jest.fn(), push: jest.fn(), setOptions: jest.fn(), addListener: jest.fn().mockReturnValue(() => {}) };
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('Smoke tests — Screens d\'exercices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('VocabularyScreen — rend sans crash', () => {
    expect(() => render(<VocabularyScreen route={mockRoute as any} navigation={mockNavigationProp as any} />)).not.toThrow();
  });

  it('GrammarScreen — rend sans crash', () => {
    expect(() => render(<GrammarScreen route={mockRoute as any} navigation={mockNavigationProp as any} />)).not.toThrow();
  });

  it('SentenceScreen — rend sans crash', () => {
    expect(() => render(<SentenceScreen />)).not.toThrow();
  });

  it('ReadingScreen — rend sans crash', () => {
    expect(() => render(<ReadingScreen />)).not.toThrow();
  });

  it('DialogueScreen — rend sans crash', () => {
    expect(() => render(<DialogueScreen />)).not.toThrow();
  });

  it('WordGamesScreen — rend sans crash', () => {
    expect(() => render(<WordGamesScreen route={mockRoute as any} navigation={mockNavigationProp as any} />)).not.toThrow();
  });

  it('ConnectorScreen — rend sans crash', () => {
    expect(() => render(<ConnectorScreen />)).not.toThrow();
  });
});
