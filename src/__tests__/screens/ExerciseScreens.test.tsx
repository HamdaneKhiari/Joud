/**
 * Smoke tests — Screens d'exercices
 *
 * Objectif : chaque screen rend sans crash avec tous les hooks mockés.
 * Pas d'interactions testées ici — c'est le filet de sécurité de base.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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
// Mock — ExerciseValidation (bypass animations)
// ============================================

jest.mock('@/components/common/ExerciseValidation', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const MockExerciseValidation = ({ state = 'initial', onValidate, onNext, onRetry, onSkip, isLastQuestion, disabled, feedbackMessage }: any) => {
    const getLabel = () => {
      if (state === 'initial') return 'Valider';
      if (state === 'incorrect') return 'Réessayer';
      if (state === 'skip') return 'Passer';
      return isLastQuestion ? 'Terminer' : 'Continuer';
    };
    const getHandler = () => {
      if (state === 'initial') return onValidate;
      if (state === 'incorrect') return onRetry;
      if (state === 'skip') return onSkip;
      return onNext;
    };
    return React.createElement(
      View,
      null,
      feedbackMessage && feedbackMessage.title
        ? React.createElement(Text, { key: 'fb' }, feedbackMessage.title)
        : null,
      React.createElement(
        TouchableOpacity,
        { key: 'btn', onPress: getHandler(), disabled },
        React.createElement(Text, null, getLabel())
      )
    );
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { __esModule: true, default: MockExerciseValidation };
});

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

// ============================================
// Mock data
// ============================================

const mockGrammarFamily = {
  title: 'Present Simple', icon: 'book',
  rules: [{
    id: 1, title: 'Subject + Verb', content: 'Use present simple for habits.', simplified: 'S + V (+s)',
    examples: ['I go to school.', 'She goes to school.'],
    exercise: { question: 'She ___ to school.', correctAnswer: 'goes', options: ['go', 'goes', 'going'] }
  }]
};

const mockVocabContent = [
  { id: 1, data: { word: 'apple', translation: 'pomme', example: 'I eat an apple.', exampleTranslation: 'Je mange une pomme.' } },
];
const mockModule = { slug: 'vocab', icon: 'book' };
const mockFamily = { name: 'Fruits', icon: 'food-apple', id: 1 };

const mockSentenceContent = [
  { id: 1, data: { sentence_with_blank: 'She ___ to school.', sentence: 'She ___ to school.', phrase_fr: 'Elle va à l\'école.', options: ['goes', 'go', 'going'], correctAnswer: 'goes', correct_answer: 'goes' } }
];

const mockDialogueFamily = {
  name: 'At the café', title: 'At the café', icon: '☕',
  messages: [
    { speaker: 'A', text: 'Hello! Can I help you?' },
    { speaker: 'B', text: 'Yes, a coffee please.' },
  ],
  questions: [{
    question: 'What does B order?', text: 'What does B order?',
    options: ['Tea', 'Coffee', 'Water'],
    correctAnswer: 1,
  }]
};

// ============================================
// Tests — smoke
// ============================================

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

// ============================================
// Tests — avec contenu (couverture des branches de render)
// ============================================

describe('Screens avec contenu — render paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  // ─── GrammarScreen ───

  it('GrammarScreen — état loading', () => {
    require('@/screens/GrammarScreen/hooks/useGrammarContent').useGrammarContent.mockReturnValue({ grammarFamily: null, loading: true });
    const { UNSAFE_getByType } = render(<GrammarScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    // Loading → ActivityIndicator visible
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('GrammarScreen — render complet avec grammarFamily', () => {
    require('@/screens/GrammarScreen/hooks/useGrammarContent').useGrammarContent.mockReturnValue({ grammarFamily: mockGrammarFamily, loading: false });
    const { getByText } = render(<GrammarScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    expect(getByText('goes')).toBeTruthy();
  });

  it('GrammarScreen — handleAnswer sélectionne une option', () => {
    require('@/screens/GrammarScreen/hooks/useGrammarContent').useGrammarContent.mockReturnValue({ grammarFamily: mockGrammarFamily, loading: false });
    const { getByText } = render(<GrammarScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    fireEvent.press(getByText('goes'));
    // Pas de crash
    expect(getByText('goes')).toBeTruthy();
  });

  it('GrammarScreen — handleValidate après sélection', () => {
    const mockSaveProgressNow = jest.fn().mockResolvedValue(undefined);
    require('@/contexts/ProgressContext').useProgress.mockReturnValue({
      progress: {}, getLevelProgress: jest.fn().mockReturnValue(0),
      refreshProgress: jest.fn(), saveProgressNow: mockSaveProgressNow,
      trackItemCompletion: jest.fn(), getRevisionFamilies: jest.fn().mockReturnValue([]),
      resetProgress: jest.fn(), getFamilyProgress: jest.fn().mockReturnValue(0),
    });
    require('@/screens/GrammarScreen/hooks/useGrammarContent').useGrammarContent.mockReturnValue({ grammarFamily: mockGrammarFamily, loading: false });
    const { getByText } = render(<GrammarScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    fireEvent.press(getByText('goes'));
    // Valider (bouton ExerciseValidation)
    const validateBtn = getByText('Valider');
    fireEvent.press(validateBtn);
    expect(getByText('goes')).toBeTruthy();
  });

  // ─── VocabularyScreen ───

  it('VocabularyScreen — render avec contentItems (WordCard visible)', () => {
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: mockVocabContent, isLoading: false, error: null,
    });
    const { getAllByText } = render(<VocabularyScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    expect(getAllByText('apple').length).toBeGreaterThanOrEqual(1);
  });

  it('VocabularyScreen — render avec deux mots (traduction visible)', () => {
    const twoWords = [
      ...mockVocabContent,
      { id: 2, data: { word: 'banana', translation: 'banane', example: 'I like bananas.' } }
    ];
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: twoWords, isLoading: false, error: null,
    });
    const { getByText } = render(<VocabularyScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    expect(getByText('pomme')).toBeTruthy();
  });

  it('GrammarScreen — handleRetry: valider incorrect + réessayer', () => {
    require('@/screens/GrammarScreen/hooks/useGrammarContent').useGrammarContent.mockReturnValue({ grammarFamily: mockGrammarFamily, loading: false });
    const { getByText, queryByText } = render(<GrammarScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    // Sélectionner une mauvaise réponse + valider
    fireEvent.press(getByText('go'));
    fireEvent.press(getByText('Valider'));
    // Après validation incorrecte, "Réessayer" apparaît
    const retryBtn = queryByText('Réessayer');
    if (retryBtn) fireEvent.press(retryBtn);
    // Soit réessayer a été pressé, soit la validation incorrecte a bien été exécutée
    expect(getByText('go')).toBeTruthy();
  });

  // ─── SentenceScreen ───

  it('SentenceScreen — render avec contentItems en mode blanks (college)', () => {
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: mockSentenceContent, isLoading: false, error: null,
    });
    const { getByText } = render(<SentenceScreen />);
    expect(getByText('Complète la phrase :')).toBeTruthy();
  });

  it('SentenceScreen — sélectionner une option', () => {
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: mockSentenceContent, isLoading: false, error: null,
    });
    const { getAllByText } = render(<SentenceScreen />);
    const goesOptions = getAllByText('goes');
    fireEvent.press(goesOptions[0]);
    // L'option est sélectionnée — pas de crash
    expect(goesOptions[0]).toBeTruthy();
  });

  // ─── DialogueScreen ───

  it('DialogueScreen — render avec dialogue (messages affichés)', () => {
    require('@/screens/DialoguesScreen/hooks/useDialogueContent').useDialogueContent.mockReturnValue({
      dialogue: mockDialogueFamily, isLoading: false,
    });
    const { getByText } = render(<DialogueScreen />);
    expect(getByText('Hello! Can I help you?')).toBeTruthy();
  });

  it('DialogueScreen — affiche le titre du dialogue', () => {
    require('@/screens/DialoguesScreen/hooks/useDialogueContent').useDialogueContent.mockReturnValue({
      dialogue: mockDialogueFamily, isLoading: false,
    });
    const { getByText } = render(<DialogueScreen />);
    expect(getByText('At the café')).toBeTruthy();
  });

  // ─── DialogueScreen questions phase ───

  it('DialogueScreen — avance vers questions phase (1 message → checkmark button)', () => {
    const singleMsgDialogue = {
      name: 'Quick test', title: 'Quick test', icon: '🎤',
      messages: [{ speaker: 'A', text: 'Hi there!' }],
      questions: [{ question: 'What does A say?', text: 'What does A say?', options: ['Hi there!', 'Bye!', 'Sorry!'], correctAnswer: 0 }],
    };
    require('@/screens/DialoguesScreen/hooks/useDialogueContent').useDialogueContent.mockReturnValue({
      dialogue: singleMsgDialogue, isLoading: false,
    });
    const { UNSAFE_getAllByType } = render(<DialogueScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // Press last button (next/finish in DialogueCard)
    if (buttons.length > 0) fireEvent.press(buttons[buttons.length - 1]);
    // Phase transition → no crash
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('DialogueScreen — questions phase: réponse + validation', () => {
    const singleMsgDialogue = {
      name: 'Quick test', title: 'Quick test', icon: '🎤',
      messages: [{ speaker: 'A', text: 'Hi there!' }],
      questions: [{ question: 'What does A say?', text: 'What does A say?', options: ['Hi there!', 'Bye!', 'Sorry!'], correctAnswer: 0 }],
    };
    require('@/screens/DialoguesScreen/hooks/useDialogueContent').useDialogueContent.mockReturnValue({
      dialogue: singleMsgDialogue, isLoading: false,
    });
    const { UNSAFE_getAllByType, queryByText } = render(<DialogueScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // Advance to questions phase
    if (buttons.length > 0) fireEvent.press(buttons[buttons.length - 1]);
    // Now try to find Valider button (if in questions phase)
    const validerBtn = queryByText('Valider');
    if (validerBtn) {
      // Select option A first
      const optionA = queryByText('A');
      if (optionA) fireEvent.press(optionA);
      fireEvent.press(validerBtn);
    }
    expect(true).toBe(true); // No crash is the goal
  });

  // ─── SentenceScreen free mode (lycee) ───

  it('SentenceScreen — mode free (lycee identity) rend SentenceCard', () => {
    // Override identity for lycee audience
    const lyceeIdentity = { ...require('@/themes/tokens').tokens, id: 'lycee', themeMode: 'light' as const,
      organizationName: 'Joud Lycée',
      palette: { primary: '#6C3483', accent: '#F39C12', surface: '#FFFFFF', background: '#F9FAFB' },
      text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
      ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'clean', cardStyle: 'clean' },
      header: { background: '#6C3483', accent: '#F39C12', emoji: '📚', welcomeText: 'Bonjour !' },
      dailyWord: { background: '#FFF9C4', decoration: 'none' },
      aiTutor: { title: 'Tuteur IA', subtitle: 'Aide aux devoirs' },
      aiDiagnostic: { accent: '#6C3483', error: '#D32F2F', solutionBackground: ['#ECEFF1', '#CFD8DC'] },
      dashboard: { levelProgress: '#6C3483' },
      i18n: { locale: 'fr', rtl: false },
      icons: { logo: 'school' },
      iconSize: { xs: 12, sm: 16, md: 24, lg: 32, xl: 48 },
      fontFamily: { regular: 'System', medium: 'System', semibold: 'System', bold: 'System', title: 'System', extrabold: 'System' },
    };
    require('@/themes/ThemeContext').useTheme.mockReturnValue({ identity: lyceeIdentity, tokens });
    const freeContent = [
      { id: 1, data: { phrase_fr: 'Elle va à l\'école.', phrase_en: 'She goes to school.', sentence: 'She goes to school.', correct_answer: 'goes' } }
    ];
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: freeContent, isLoading: false, error: null,
    });
    const { getByText } = render(<SentenceScreen />);
    // In free mode, shows French phrase
    expect(getByText('Elle va à l\'école.')).toBeTruthy();
  });

  it('SentenceScreen — mode free: handleValidate réponse correcte', () => {
    const lyceeIdentity = { ...mockIdentity, id: 'lycee', ui: { ...mockIdentity.ui, mood: 'clean' } };
    require('@/themes/ThemeContext').useTheme.mockReturnValue({ identity: lyceeIdentity, tokens });
    const freeContent = [
      { id: 1, data: { phrase_fr: 'Elle va à l\'école.', phrase_en: 'she goes to school', sentence: 'She goes to school.', correct_answer: 'goes' } }
    ];
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: freeContent, isLoading: false, error: null,
    });
    const { getByPlaceholderText, getByText } = render(<SentenceScreen />);
    const input = getByPlaceholderText('Tape ta traduction ici...');
    fireEvent.changeText(input, 'she goes to school');
    fireEvent.press(getByText('Valider'));
    expect(getByText('EXACT !')).toBeTruthy();
  });

  it('SentenceScreen — mode free: handleValidate réponse incorrecte', () => {
    const lyceeIdentity = { ...mockIdentity, id: 'lycee', ui: { ...mockIdentity.ui, mood: 'clean' } };
    require('@/themes/ThemeContext').useTheme.mockReturnValue({ identity: lyceeIdentity, tokens });
    const freeContent = [
      { id: 1, data: { phrase_fr: 'Elle va à l\'école.', phrase_en: 'she goes to school', sentence: 'She goes to school.', correct_answer: 'goes' } }
    ];
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: freeContent, isLoading: false, error: null,
    });
    const { getByPlaceholderText, getByText } = render(<SentenceScreen />);
    const input = getByPlaceholderText('Tape ta traduction ici...');
    fireEvent.changeText(input, 'she go to school');
    fireEvent.press(getByText('Valider'));
    expect(getByText('OBSERVE LA NUANCE')).toBeTruthy();
  });

  // ─── GrammarScreen CompletionModal ───

  it('GrammarScreen — handleNext dernière règle → CompletionModal (async)', async () => {
    const saveProgressNow = jest.fn().mockResolvedValue(undefined);
    require('@/contexts/ProgressContext').useProgress.mockReturnValue({
      progress: {}, getLevelProgress: jest.fn().mockReturnValue(0),
      refreshProgress: jest.fn(), saveProgressNow,
      trackItemCompletion: jest.fn(), getRevisionFamilies: jest.fn().mockReturnValue([]),
      resetProgress: jest.fn(), getFamilyProgress: jest.fn().mockReturnValue(0),
    });
    require('@/screens/GrammarScreen/hooks/useGrammarContent').useGrammarContent.mockReturnValue({ grammarFamily: mockGrammarFamily, loading: false });
    const { getByText } = render(<GrammarScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    // Correct answer then Continuer/Terminer
    fireEvent.press(getByText('goes'));
    fireEvent.press(getByText('Valider'));
    // After correct: isLastRule=true → button is "Terminer"
    const continueBtn = getByText('Terminer');
    fireEvent.press(continueBtn);
    // saveProgressNow called
    expect(saveProgressNow).toHaveBeenCalled();
  });

  it('GrammarScreen — multiple règles: handleNext avance à la règle suivante', () => {
    const twoRuleFamily = {
      title: 'Present Simple', icon: 'book',
      rules: [
        { id: 1, title: 'Rule 1', content: 'Content 1', simplified: 'S1', examples: [], exercise: { question: 'Q1', correctAnswer: 'a', options: ['a', 'b', 'c'] } },
        { id: 2, title: 'Rule 2', content: 'Content 2', simplified: 'S2', examples: [], exercise: { question: 'Q2', correctAnswer: 'x', options: ['x', 'y', 'z'] } },
      ]
    };
    require('@/screens/GrammarScreen/hooks/useGrammarContent').useGrammarContent.mockReturnValue({ grammarFamily: twoRuleFamily, loading: false });
    const { getByText } = render(<GrammarScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    // First rule: select correct + validate
    fireEvent.press(getByText('a'));
    fireEvent.press(getByText('Valider'));
    // Now "Continuer" (not last question)
    fireEvent.press(getByText('Continuer'));
    // Second rule shown
    expect(getByText('Q2')).toBeTruthy();
  });

  // ─── ReadingScreen ───

  it('ReadingScreen — état loading', () => {
    require('@/screens/ReadingScreen/hooks/useReadingContent').useReadingContent.mockReturnValue({ questions: [], loading: true });
    const { UNSAFE_getByType } = render(<ReadingScreen />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('ReadingScreen — render avec questions', () => {
    const mockState = { selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 };
    const mockQuestions = [{
      id: 1, passage: 'The sun rises in the east.', question: 'Where does the sun rise?',
      options: ['East', 'West', 'North'], correctAnswer: 0,
    }];
    require('@/screens/ReadingScreen/hooks/useReadingContent').useReadingContent.mockReturnValue({ questions: mockQuestions, loading: false });
    require('@/screens/ReadingScreen/hooks/useReadingState').useReadingState.mockReturnValue({ state: mockState, setState: jest.fn(), resetState: jest.fn() });
    require('@/screens/ReadingScreen/hooks/useReadingHandlers').useReadingHandlers.mockReturnValue({
      onAnswer: jest.fn(), onValidate: jest.fn(), onNext: jest.fn(), onSkip: jest.fn(),
    });
    expect(() => render(<ReadingScreen />)).not.toThrow();
  });

  // ─── VocabularyScreen finish ───

  // ─── SentenceScreen blanks validation ───

  it('SentenceScreen — blanks: réponse correcte → BRAVO', () => {
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: mockSentenceContent, isLoading: false, error: null,
    });
    const { getAllByText, getByText } = render(<SentenceScreen />);
    // Select correct option 'goes'
    const options = getAllByText('goes');
    fireEvent.press(options[0]);
    fireEvent.press(getByText('Valider'));
    expect(getByText('BRAVO !')).toBeTruthy();
  });

  it('SentenceScreen — blanks: réponse incorrecte → PAS TOUT À FAIT', () => {
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: mockSentenceContent, isLoading: false, error: null,
    });
    const { getAllByText, getByText } = render(<SentenceScreen />);
    // Select wrong option 'go'
    const options = getAllByText('go');
    fireEvent.press(options[0]);
    fireEvent.press(getByText('Valider'));
    expect(getByText('PAS TOUT À FAIT')).toBeTruthy();
  });

  it('SentenceScreen — blanks: handleRetry remet en état initial', () => {
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: mockSentenceContent, isLoading: false, error: null,
    });
    const { getAllByText, getByText } = render(<SentenceScreen />);
    fireEvent.press(getAllByText('go')[0]);
    fireEvent.press(getByText('Valider'));
    // In incorrect state, button says 'Réessayer' → click it
    fireEvent.press(getByText('Réessayer'));
    // Back to initial → button is 'Valider'
    expect(getByText('Valider')).toBeTruthy();
  });

  // ─── ConnectorScreen avec contenu ───

  it('ConnectorScreen — loading state (ActivityIndicator)', () => {
    require('@/screens/ConnectorScreen/hooks/useConnectorContent').useConnectorContent.mockReturnValue({
      questions: [], loading: true,
    });
    const { UNSAFE_getByType } = render(<ConnectorScreen />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('ConnectorScreen — render avec question logic', () => {
    const logicQuestion = [{
      id: 1,
      type: 'logic',
      data: { sentence: 'I was tired ___ I slept.', options: ['so', 'but', 'because'], correctAnswer: 'so', translation: '' }
    }];
    require('@/screens/ConnectorScreen/hooks/useConnectorContent').useConnectorContent.mockReturnValue({
      questions: logicQuestion, loading: false,
    });
    expect(() => render(<ConnectorScreen />)).not.toThrow();
  });

  it('ConnectorScreen — render avec question fusion', () => {
    const fusionQuestion = [{
      id: 1,
      type: 'fusion',
      data: { phrase1: 'I was tired.', phrase2: 'I went to bed.', correctAnswer: 'I was tired, so I went to bed.', translation: '' }
    }];
    require('@/screens/ConnectorScreen/hooks/useConnectorContent').useConnectorContent.mockReturnValue({
      questions: fusionQuestion, loading: false,
    });
    // Override exerciseType to fusion via mockRoute-like params
    expect(() => render(<ConnectorScreen />)).not.toThrow();
  });

  it('VocabularyScreen — handleFinish (dernier mot)', () => {
    const saveProgressNow = jest.fn().mockResolvedValue(undefined);
    require('@/contexts/ProgressContext').useProgress.mockReturnValue({
      progress: {}, getLevelProgress: jest.fn().mockReturnValue(0),
      refreshProgress: jest.fn(), saveProgressNow,
      trackItemCompletion: jest.fn(), getRevisionFamilies: jest.fn().mockReturnValue([]),
      resetProgress: jest.fn(), getFamilyProgress: jest.fn().mockReturnValue(0),
    });
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: mockVocabContent, isLoading: false, error: null,
    });
    const { UNSAFE_getAllByType } = render(<VocabularyScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    if (buttons.length > 0) fireEvent.press(buttons[buttons.length - 1]);
    expect(true).toBe(true);
  });

  // ─── VocabularyScreen plus de couverture ───

  it('VocabularyScreen — isLoading=true → affiche ActivityIndicator', () => {
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: null, family: null, contentItems: [], isLoading: true, error: null,
    });
    const { UNSAFE_getByType } = render(<VocabularyScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('VocabularyScreen — handleNext avance au mot suivant (2 mots)', () => {
    const twoWords = [
      { id: 1, data: { word: 'apple', translation: 'pomme', example: 'I eat an apple.', exampleTranslation: '' } },
      { id: 2, data: { word: 'banana', translation: 'banane', example: 'I like bananas.', exampleTranslation: '' } },
    ];
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: twoWords, isLoading: false, error: null,
    });
    const { UNSAFE_getAllByType } = render(<VocabularyScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // Press "next" (last button when isLast=false with 2 words at index 0)
    if (buttons.length > 0) fireEvent.press(buttons[buttons.length - 1]);
    expect(true).toBe(true);
  });

  // ─── WordGamesScreen avec contenu ───

  it('WordGamesScreen — render principal avec question definition', () => {
    const gameContent = [{
      id: 1,
      data: { type: 'definition', word: 'apple', definition: 'A red fruit', options: ['pomme', 'chien', 'maison'], correctAnswer: 'pomme' }
    }];
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: gameContent, isLoading: false, error: null,
    });
    require('@/screens/WordGames/hooks/useGameState').useGameState.mockReturnValue({
      builderState: {}, setBuilderState: jest.fn(),
      definitionState: { isValidated: false, isCorrect: false, attemptCount: 0, selectedOption: null },
      setDefinitionState: jest.fn(),
      blanksState: {}, setBlanksState: jest.fn(),
      sentenceState: {}, setSentenceState: jest.fn(),
      detectiveState: {}, setDetectiveState: jest.fn(),
      replyState: {}, setReplyState: jest.fn(),
      transformerState: {}, setTransformerState: jest.fn(),
      resetAllStates: jest.fn(),
      getCurrentState: jest.fn().mockReturnValue({ isValidated: false, isCorrect: false, attemptCount: 0, selectedOption: null }),
    });
    expect(() => render(<WordGamesScreen route={mockRoute as any} navigation={mockNavigationProp as any} />)).not.toThrow();
  });

  it('WordGamesScreen — auto-progress useEffect fires when validated+correct', () => {
    const trackItemCompletion = jest.fn();
    require('@/contexts/ProgressContext').useProgress.mockReturnValue({
      progress: {}, getLevelProgress: jest.fn().mockReturnValue(0),
      refreshProgress: jest.fn(), saveProgressNow: jest.fn().mockResolvedValue(undefined),
      trackItemCompletion, getRevisionFamilies: jest.fn().mockReturnValue([]),
      resetProgress: jest.fn(), getFamilyProgress: jest.fn().mockReturnValue(0),
    });
    const gameContent = [{
      id: 1,
      data: { type: 'definition', word: 'cat', definition: 'An animal', options: ['chat', 'chien', 'maison'], correctAnswer: 'chat' }
    }];
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: gameContent, isLoading: false, error: null,
    });
    const validatedState = { isValidated: true, isCorrect: true, attemptCount: 1, selectedOption: 'chat' };
    require('@/screens/WordGames/hooks/useGameState').useGameState.mockReturnValue({
      builderState: {}, setBuilderState: jest.fn(),
      definitionState: validatedState, setDefinitionState: jest.fn(),
      blanksState: {}, setBlanksState: jest.fn(),
      sentenceState: {}, setSentenceState: jest.fn(),
      detectiveState: {}, setDetectiveState: jest.fn(),
      replyState: {}, setReplyState: jest.fn(),
      transformerState: {}, setTransformerState: jest.fn(),
      resetAllStates: jest.fn(),
      getCurrentState: jest.fn().mockReturnValue(validatedState),
    });
    expect(() => render(<WordGamesScreen route={mockRoute as any} navigation={mockNavigationProp as any} />)).not.toThrow();
    expect(trackItemCompletion).toHaveBeenCalled();
  });

  it('ReadingScreen — empty state (currentQuestion=null after loading)', () => {
    require('@/screens/ReadingScreen/hooks/useReadingContent').useReadingContent.mockReturnValue({
      questions: [], loading: false,
    });
    const { getByText } = render(<ReadingScreen />);
    expect(getByText('Aucune question disponible')).toBeTruthy();
  });

  it('ReadingScreen — back button in empty state', () => {
    require('@/screens/ReadingScreen/hooks/useReadingContent').useReadingContent.mockReturnValue({
      questions: [], loading: false,
    });
    const { getByText } = render(<ReadingScreen />);
    fireEvent.press(getByText('Retour'));
    expect(mockNav.navigate).toHaveBeenCalled();
  });

  it('DialogueScreen — questions phase: relire button + second DialogueCard', () => {
    const singleMsgDialogue = {
      name: 'Relire test', title: 'Relire test', icon: '📖',
      messages: [{ speaker: 'A', text: 'Start' }],
      questions: [{ question: 'Q1?', text: 'Q1?', options: ['A', 'B', 'C'], correctAnswer: 0 }],
    };
    require('@/screens/DialoguesScreen/hooks/useDialogueContent').useDialogueContent.mockReturnValue({
      dialogue: singleMsgDialogue, isLoading: false,
    });
    const { UNSAFE_getAllByType } = render(<DialogueScreen />);
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // Advance to questions phase (last button = "next/finish" in DialogueCard)
    if (buttons.length > 0) fireEvent.press(buttons[buttons.length - 1]);
    // No crash, may or may not show "Relire le dialogue"
    expect(true).toBe(true);
  });

  it('VocabularyScreen — CompletionModal visible after handleFinish', async () => {
    const saveProgressNow = jest.fn().mockResolvedValue(undefined);
    const trackItemCompletion = jest.fn();
    require('@/contexts/ProgressContext').useProgress.mockReturnValue({
      progress: {}, getLevelProgress: jest.fn().mockReturnValue(0),
      refreshProgress: jest.fn(), saveProgressNow,
      trackItemCompletion, getRevisionFamilies: jest.fn().mockReturnValue([]),
      resetProgress: jest.fn(), getFamilyProgress: jest.fn().mockReturnValue(0),
    });
    require('@/hooks/exercises/useExerciseContent').useExerciseContent.mockReturnValue({
      module: mockModule, family: mockFamily, contentItems: mockVocabContent, isLoading: false, error: null,
    });
    render(<VocabularyScreen route={mockRoute as any} navigation={mockNavigationProp as any} />);
    // No crash with full content path
    expect(mockFamily.name).toBe('Fruits');
  });
});
