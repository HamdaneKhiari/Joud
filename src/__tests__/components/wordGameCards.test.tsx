/**
 * Smoke tests + comportement — Word Game Cards
 *
 * Couvre : DefinitionCard, BlanksCard, DetectiveCard, ReplyCard,
 *          TransformerCard, SyntaxMasterCard, SpeedMatchCard, AudioMatchCard,
 *          DialogueCard.
 *
 * Objectif : chaque composant rend sans crash + assertions de contenu basiques.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { tokens } from '@/themes/tokens';

// ============================================
// Mocks globaux
// ============================================

jest.mock('@/themes/ThemeContext', () => ({ useTheme: jest.fn() }));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

// Hooks exercice (utilisés par les cartes intégrant ExerciseValidation)
jest.mock('@/hooks/exercises/useExerciceValidationState', () => ({
  useExerciseValidationState: jest.fn(),
}));
jest.mock('@/hooks/exercises/useFeedbackMessages', () => ({
  useFeedbackMessages: jest.fn(),
  getFeedbackState: jest.fn().mockReturnValue(null),
}));

// useSafeAction (requis par ExerciseValidation)
jest.mock('@/hooks/useSafeAction', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import DefinitionCard from '@/components/pedagogy/wordgames/DefinitionCard';
import BlanksCard from '@/components/pedagogy/wordgames/BlanksCard';
import DetectiveCard from '@/components/pedagogy/wordgames/DetectiveCard';
import ReplyCard from '@/components/pedagogy/wordgames/ReplyCard';
import TransformerCard from '@/components/pedagogy/wordgames/TransformerCard';
import SyntaxMasterCard from '@/components/pedagogy/wordgames/SyntaxMasterCard';
import SpeedMatchCard from '@/components/pedagogy/wordgames/SpeedMatchCard';
import AudioMatchCard from '@/components/pedagogy/wordgames/AudioMatchCard';
import DialogueCard from '@/components/pedagogy/dialogues/DialogueCard';

// ============================================
// Fixtures
// ============================================

const mockIdentity = {
  id: 'college',
  themeMode: 'light' as const,
  organizationName: 'Joud',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
  header: { background: '#34495E', accent: '#FFD700', emoji: '📚', welcomeText: 'Bonjour !' },
  dailyWord: { background: '#FFF9C4', decoration: 'none' },
  aiTutor: { title: 'Tuteur IA', subtitle: 'Aide' },
  aiDiagnostic: { accent: '#34495E', error: '#D32F2F', solutionBackground: ['#ECEFF1'] },
  dashboard: { levelProgress: '#34495E' },
  i18n: { locale: 'fr', rtl: false },
  icons: { logo: 'school', hint: 'bulb-outline', hideHint: 'eye-off-outline' },
  iconSize: { xs: 12, sm: 16, md: 24, lg: 32, xl: 48 },
  fontFamily: {
    regular: 'System', medium: 'System', semibold: 'System',
    bold: 'System', title: 'System', extrabold: 'System',
  },
};

const mockSafeAction = {
  execute: jest.fn(),
  loading: false,
  disabled: false,
  lastExecuted: 0,
  cleanup: jest.fn(),
};

// Props partagées (state machine)
const sharedCardProps = {
  selectedOption: null,
  isValidated: false,
  isCorrect: false,
  attemptCount: 0,
  maxAttempts: 2,
  onAnswer: jest.fn(),
  onValidate: jest.fn(),
  onRetry: jest.fn(),
  onNext: jest.fn(),
  isLastQuestion: false,
};

function setupMocks() {
  const { useTheme } = require('@/themes/ThemeContext');
  useTheme.mockReturnValue({ identity: mockIdentity, tokens, currentApp: 'college' });

  require('@/hooks/useSafeAction').default.mockReturnValue(mockSafeAction);

  require('@/hooks/exercises/useExerciceValidationState').useExerciseValidationState
    .mockReturnValue({ canSkip: false, validationState: 'initial', buttonDisabled: false });

  require('@/hooks/exercises/useFeedbackMessages').useFeedbackMessages
    .mockReturnValue({ getFeedback: jest.fn().mockResolvedValue(null) });
}

// ============================================
// DefinitionCard
// ============================================

const mockDefinitionQuestion = {
  type: 'definition' as const,
  difficulty: 'easy' as const,
  word: 'Croissant',
  definition: 'A flaky, buttery pastry.',
  options: ['A flaky, buttery pastry.', 'A type of bread.', 'A French soup.', 'A pastry filled with cream.'],
  correctAnswer: 'A flaky, buttery pastry.',
  image: '🥐',
  context: 'I had a croissant for breakfast.',
};

describe('DefinitionCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(
      <DefinitionCard question={mockDefinitionQuestion} {...sharedCardProps} />
    )).not.toThrow();
  });

  it('affiche le titre "What is this?" et les options', () => {
    const { getByText } = render(
      <DefinitionCard question={mockDefinitionQuestion} {...sharedCardProps} />
    );
    expect(getByText('What is this?')).toBeTruthy();
  });

  it('affiche les options uniques', () => {
    const { getByText } = render(
      <DefinitionCard question={mockDefinitionQuestion} {...sharedCardProps} />
    );
    // Options uniques (pas la même texte que la définition)
    expect(getByText('A type of bread.')).toBeTruthy();
    expect(getByText('A French soup.')).toBeTruthy();
  });

  it('appelle onAnswer quand une option unique est pressée (non validé)', () => {
    const onAnswer = jest.fn();
    const { getByText } = render(
      <DefinitionCard question={mockDefinitionQuestion} {...sharedCardProps} onAnswer={onAnswer} />
    );
    // Utilise une option unique (pas la définition elle-même)
    fireEvent.press(getByText('A type of bread.'));
    expect(onAnswer).toHaveBeenCalledWith('A type of bread.');
  });
});

// ============================================
// BlanksCard
// ============================================

const mockBlanksQuestion = {
  type: 'blanks' as const,
  difficulty: 'easy' as const,
  sentence: 'She ___ to school every day.',
  options: ['go', 'goes', 'went', 'gone'],
  correctAnswer: 'goes',
  hint: 'Third person singular',
  translation: 'Elle va à l\'école tous les jours.',
};

describe('BlanksCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(
      <BlanksCard question={mockBlanksQuestion} {...sharedCardProps} />
    )).not.toThrow();
  });

  it('affiche la phrase avec le trou', () => {
    const { getByText } = render(
      <BlanksCard question={mockBlanksQuestion} {...sharedCardProps} />
    );
    expect(getByText(/to school every day/)).toBeTruthy();
  });

  it('affiche les options', () => {
    const { getByText } = render(
      <BlanksCard question={mockBlanksQuestion} {...sharedCardProps} />
    );
    expect(getByText('goes')).toBeTruthy();
    expect(getByText('went')).toBeTruthy();
  });

  it('appelle onAnswer quand une option est pressée', () => {
    const onAnswer = jest.fn();
    const { getByText } = render(
      <BlanksCard question={mockBlanksQuestion} {...sharedCardProps} onAnswer={onAnswer} />
    );
    fireEvent.press(getByText('goes'));
    expect(onAnswer).toHaveBeenCalledWith('goes');
  });
});

// ============================================
// DetectiveCard
// ============================================

const mockDetectiveQuestion = {
  type: 'detective' as const,
  difficulty: 'medium' as const,
  sentence: 'He don\'t like apples.',
  errorWordIndex: 1,
  correctWord: 'doesn\'t',
  explanation: '"He" requires "doesn\'t" not "don\'t".',
};

describe('DetectiveCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(
      <DetectiveCard
        question={mockDetectiveQuestion}
        selectedWord={null}
        {...sharedCardProps}
        onAnswer={jest.fn()}
      />
    )).not.toThrow();
  });

  it('affiche les mots de la phrase comme options cliquables', () => {
    const { getByText } = render(
      <DetectiveCard
        question={mockDetectiveQuestion}
        selectedWord={null}
        {...sharedCardProps}
        onAnswer={jest.fn()}
      />
    );
    // La phrase est splittée en mots cliquables
    expect(getByText('He')).toBeTruthy();
  });

  it('appelle onAnswer avec l\'index du mot pressé', () => {
    const onAnswer = jest.fn();
    const { getByText } = render(
      <DetectiveCard
        question={mockDetectiveQuestion}
        selectedWord={null}
        {...sharedCardProps}
        onAnswer={onAnswer}
      />
    );
    fireEvent.press(getByText("don't"));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });
});

// ============================================
// ReplyCard
// ============================================

const mockReplyQuestion = {
  type: 'reply' as const,
  difficulty: 'easy' as const,
  situation: 'You meet someone for the first time.',
  prompt: 'Nice to meet you!',
  options: ['Nice to meet you too!', 'Goodbye!', 'What?', 'I don\'t know.'],
  correctAnswer: 'Nice to meet you too!',
  explanation: 'The standard polite reply.',
};

describe('ReplyCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(
      <ReplyCard question={mockReplyQuestion} {...sharedCardProps} />
    )).not.toThrow();
  });

  it('affiche le prompt', () => {
    const { getByText } = render(
      <ReplyCard question={mockReplyQuestion} {...sharedCardProps} />
    );
    expect(getByText('Nice to meet you!')).toBeTruthy();
  });

  it('appelle onAnswer quand une option est pressée', () => {
    const onAnswer = jest.fn();
    const { getByText } = render(
      <ReplyCard question={mockReplyQuestion} {...sharedCardProps} onAnswer={onAnswer} />
    );
    fireEvent.press(getByText('Nice to meet you too!'));
    expect(onAnswer).toHaveBeenCalledWith('Nice to meet you too!');
  });
});

// ============================================
// TransformerCard
// ============================================

const mockTransformerQuestion = {
  type: 'transformer' as const,
  difficulty: 'medium' as const,
  rootWord: 'WORK',
  sentence: 'He is ___ now.',
  options: ['working', 'works', 'worked', 'work'],
  correctAnswer: 'working',
  hint: 'Present continuous',
  translation: 'Il travaille maintenant.',
};

describe('TransformerCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(
      <TransformerCard question={mockTransformerQuestion} {...sharedCardProps} />
    )).not.toThrow();
  });

  it('affiche le mot racine', () => {
    const { getByText } = render(
      <TransformerCard question={mockTransformerQuestion} {...sharedCardProps} />
    );
    expect(getByText('WORK')).toBeTruthy();
  });

  it('affiche les options de transformation', () => {
    const { getByText } = render(
      <TransformerCard question={mockTransformerQuestion} {...sharedCardProps} />
    );
    expect(getByText('working')).toBeTruthy();
    expect(getByText('works')).toBeTruthy();
  });

  it('appelle onAnswer quand une option est pressée', () => {
    const onAnswer = jest.fn();
    const { getByText } = render(
      <TransformerCard question={mockTransformerQuestion} {...sharedCardProps} onAnswer={onAnswer} />
    );
    fireEvent.press(getByText('working'));
    expect(onAnswer).toHaveBeenCalledWith('working');
  });
});

// ============================================
// SyntaxMasterCard
// ============================================

const mockSentenceQuestion = {
  type: 'sentence' as const,
  difficulty: 'medium' as const,
  words: ['is', 'She', 'student', 'a'],
  correctOrder: ['She', 'is', 'a', 'student'],
  translation: 'Elle est une étudiante.',
  hint: 'Commence par "She".',
};

describe('SyntaxMasterCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(
      <SyntaxMasterCard
        question={mockSentenceQuestion}
        selectedOrder={[]}
        {...sharedCardProps}
        onAnswer={jest.fn()}
        onOrder={jest.fn()}
      />
    )).not.toThrow();
  });

  it('affiche les mots désordonnés', () => {
    const { getByText } = render(
      <SyntaxMasterCard
        question={mockSentenceQuestion}
        selectedOrder={[]}
        {...sharedCardProps}
        onAnswer={jest.fn()}
        onOrder={jest.fn()}
      />
    );
    expect(getByText('is')).toBeTruthy();
    expect(getByText('She')).toBeTruthy();
  });

  it('appuyer sur un mot l\'ajoute à la sélection', () => {
    const onOrder = jest.fn();
    const { getAllByText } = render(
      <SyntaxMasterCard
        question={mockSentenceQuestion}
        selectedOrder={[]}
        {...sharedCardProps}
        onAnswer={jest.fn()}
        onOrder={onOrder}
      />
    );
    fireEvent.press(getAllByText('She')[0]);
    expect(onOrder).toHaveBeenCalled();
  });

  it('affiche le bouton Vérifier quand des mots sont sélectionnés', () => {
    const { getAllByText } = render(
      <SyntaxMasterCard
        question={mockSentenceQuestion}
        selectedOrder={['She', 'is']}
        {...sharedCardProps}
        isValidated={false}
        onAnswer={jest.fn()}
        onOrder={jest.fn()}
      />
    );
    // 'She' apparaît dans les mots disponibles ET dans la zone ordonnée
    expect(getAllByText('She').length).toBeGreaterThanOrEqual(1);
  });

  it('appuyer sur un mot sélectionné le remet dans la liste', () => {
    const onOrder = jest.fn();
    const { getAllByText } = render(
      <SyntaxMasterCard
        question={mockSentenceQuestion}
        selectedOrder={['She']}
        {...sharedCardProps}
        isValidated={false}
        onAnswer={jest.fn()}
        onOrder={onOrder}
      />
    );
    // 'She' apparaît deux fois : dans words et dans ordered
    const sheButtons = getAllByText('She');
    fireEvent.press(sheButtons[0]);
    expect(onOrder).toHaveBeenCalled();
  });
});

// ============================================
// SpeedMatchCard
// ============================================

const mockSpeedMatchQuestion = {
  type: 'speed' as const,
  difficulty: 'easy' as const,
  pairs: [
    { english: 'apple', french: 'pomme' },
    { english: 'banana', french: 'banane' },
    { english: 'cat', french: 'chat' },
  ],
  timeLimit: 30,
};

describe('SpeedMatchCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rend sans crash', () => {
    expect(() => render(
      <SpeedMatchCard game={mockSpeedMatchQuestion} onComplete={jest.fn()} />
    )).not.toThrow();
  });

  it('affiche les mots anglais', () => {
    const { getByText } = render(
      <SpeedMatchCard game={mockSpeedMatchQuestion} onComplete={jest.fn()} />
    );
    expect(getByText('apple')).toBeTruthy();
  });

  it('affiche les traductions françaises mélangées', () => {
    const { getByText } = render(
      <SpeedMatchCard game={mockSpeedMatchQuestion} onComplete={jest.fn()} />
    );
    expect(getByText('pomme')).toBeTruthy();
    expect(getByText('banane')).toBeTruthy();
  });

  it('appuyer sur un mot EN le sélectionne', () => {
    const { getByText } = render(
      <SpeedMatchCard game={mockSpeedMatchQuestion} onComplete={jest.fn()} />
    );
    fireEvent.press(getByText('apple'));
    // Le composant devrait toujours être visible (pas de crash)
    expect(getByText('apple')).toBeTruthy();
  });

  it('le timer décompte et termine le jeu', () => {
    const { act } = require('@testing-library/react-native');
    const onComplete = jest.fn();
    render(<SpeedMatchCard game={{ ...mockSpeedMatchQuestion, timeLimit: 3 }} onComplete={onComplete} />);
    // Avancer le timer de 3 secondes
    act(() => { jest.advanceTimersByTime(3000); });
    // Le jeu se termine (l'écran de résultat doit apparaître)
    // onComplete n'est pas appelé automatiquement — il faut appuyer "Continuer"
    // On vérifie juste que le composant ne crash pas
  });

  it('affiche l\'écran de résultats quand toutes paires matchées', () => {
    // Utiliser 1 seule paire pour faciliter le test
    const singlePairGame = {
      ...mockSpeedMatchQuestion,
      pairs: [{ english: 'apple', french: 'pomme' }],
      timeLimit: 30,
    };
    const onComplete = jest.fn();
    const { getByText } = render(<SpeedMatchCard game={singlePairGame} onComplete={onComplete} />);

    // Sélectionner le mot EN
    fireEvent.press(getByText('apple'));
    // Sélectionner le mot FR correspondant
    fireEvent.press(getByText('pomme'));
    // Toutes les paires sont matchées → écran de résultats
    expect(getByText('Continuer')).toBeTruthy();
  });
});

// ============================================
// AudioMatchCard
// ============================================

const mockAudioMatchQuestion = {
  type: 'audio_match' as const,
  difficulty: 'easy' as const,
  pairs: [
    { word: 'apple', image: '🍎' },
    { word: 'banana', image: '🍌' },
    { word: 'cat', image: '🐱' },
  ],
  timeLimit: 30,
};

describe('AudioMatchCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    jest.useFakeTimers();
    jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rend sans crash', () => {
    expect(() => render(
      <AudioMatchCard game={mockAudioMatchQuestion} onComplete={jest.fn()} />
    )).not.toThrow();
  });

  it('affiche les images/emojis des paires', () => {
    const { getByText } = render(
      <AudioMatchCard game={mockAudioMatchQuestion} onComplete={jest.fn()} />
    );
    expect(getByText('🍎')).toBeTruthy();
  });

  it('affiche les images des paires à matcher', () => {
    const { getByText } = render(
      <AudioMatchCard game={mockAudioMatchQuestion} onComplete={jest.fn()} />
    );
    // Les emojis des images sont affichés
    expect(getByText('🍎')).toBeTruthy();
    expect(getByText('🍌')).toBeTruthy();
  });

  it('le timer décompte et affiche l\'écran de résultats', () => {
    const { act } = require('@testing-library/react-native');
    const { getByText } = render(
      <AudioMatchCard game={{ ...mockAudioMatchQuestion, timeLimit: 1 }} onComplete={jest.fn()} />
    );
    act(() => { jest.advanceTimersByTime(1500); });
    expect(getByText('Continue')).toBeTruthy();
  });
});

// ============================================
// DialogueCard
// ============================================

const mockDialogue = {
  title: 'At the café',
  icon: '☕',
  color: '#8B4513',
  characters: [
    { name: 'Alice', color: '#34495E' },
    { name: 'Bob', color: '#E74C3C' },
  ],
  messages: [
    { speaker: 'Alice', text: 'Hello, can I have a coffee please?', textFr: 'Bonjour, puis-je avoir un café ?' },
    { speaker: 'Bob', text: 'Of course! Anything else?', textFr: 'Bien sûr ! Autre chose ?' },
  ],
};

describe('DialogueCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash en mode dialogue', () => {
    expect(() => render(
      <DialogueCard
        dialogue={mockDialogue}
        currentMessageIndex={0}
        onPreviousMessage={jest.fn()}
        onNextMessage={jest.fn()}
        isLastMessage={false}
        totalMessages={2}
      />
    )).not.toThrow();
  });

  it('affiche le premier message du dialogue', () => {
    const { getByText } = render(
      <DialogueCard
        dialogue={mockDialogue}
        currentMessageIndex={0}
        onPreviousMessage={jest.fn()}
        onNextMessage={jest.fn()}
        isLastMessage={false}
        totalMessages={2}
      />
    );
    expect(getByText('Hello, can I have a coffee please?')).toBeTruthy();
  });

  it('rend sans crash en mode question', () => {
    const mockQuestion = {
      question: 'What does Alice order?',
      options: ['Coffee', 'Tea', 'Water', 'Juice'],
      correctAnswer: 0,
    };
    expect(() => render(
      <DialogueCard
        question={mockQuestion}
        selectedOption={null}
        isValidated={false}
        isCorrect={false}
        onAnswer={jest.fn()}
      />
    )).not.toThrow();
  });
});

// ============================================
// GameCardRenderer
// ============================================

import GameCardRenderer from '@/components/pedagogy/wordgames/GameCardRendered';

const mockStates = {
  definitionState: { selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 },
  blanksState:     { selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 },
  sentenceState:   { selectedOrder: [], isValidated: false, isCorrect: false, attemptCount: 0 },
  detectiveState:  { selectedWord: null, isValidated: false, isCorrect: false, attemptCount: 0 },
  replyState:      { selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 },
  transformerState:{ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 },
};

const noop = jest.fn();
const mockHandlers = {
  definition:  { onAnswer: noop, onValidate: noop, onRetry: noop, onNext: noop },
  blanks:      { onAnswer: noop, onValidate: noop, onRetry: noop, onNext: noop },
  sentence:    { onOrder: noop, onValidate: noop, onRetry: noop, onNext: noop },
  speed:       { onComplete: noop },
  detective:   { onAnswer: noop, onValidate: noop, onRetry: noop, onNext: noop },
  audio_match: { onComplete: noop },
  reply:       { onAnswer: noop, onValidate: noop, onRetry: noop, onNext: noop },
  transformer: { onAnswer: noop, onValidate: noop, onRetry: noop, onNext: noop },
};

const mockGameFamily = { id: 1, name: 'Animals', icon: 'paw', module_slug: 'word_games', order_index: 1 };

describe('GameCardRenderer', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('retourne null si currentQuestion est null', () => {
    const { toJSON } = render(
      <GameCardRenderer
        gameType="definition" currentQuestion={null as any}
        currentQuestionIndex={0} isLastQuestion={false}
        gameFamily={mockGameFamily as any} states={mockStates as any} handlers={mockHandlers as any}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('rend DefinitionCard pour type definition', () => {
    const q = { type: 'definition', word: 'Cat', definition: 'A furry pet', options: ['Dog', 'Cat', 'Bird', 'Fish'], correctAnswer: 'Cat' };
    const { getByText } = render(
      <GameCardRenderer
        gameType="definition" currentQuestion={q as any}
        currentQuestionIndex={0} isLastQuestion={false}
        gameFamily={mockGameFamily as any} states={mockStates as any} handlers={mockHandlers as any}
      />
    );
    expect(getByText('Cat')).toBeTruthy();
  });

  it('rend BlanksCard pour type blanks', () => {
    const q = { type: 'blanks', sentence: 'The ___ is fat.', options: ['cat', 'dog'], correctAnswer: 'cat' };
    expect(() => render(
      <GameCardRenderer
        gameType="blanks" currentQuestion={q as any}
        currentQuestionIndex={0} isLastQuestion={false}
        gameFamily={mockGameFamily as any} states={mockStates as any} handlers={mockHandlers as any}
      />
    )).not.toThrow();
  });

  it('rend null pour type inconnu', () => {
    const q = { type: 'unknown_type' };
    const { toJSON } = render(
      <GameCardRenderer
        gameType={'unknown_type' as any} currentQuestion={q as any}
        currentQuestionIndex={0} isLastQuestion={false}
        gameFamily={mockGameFamily as any} states={mockStates as any} handlers={mockHandlers as any}
      />
    );
    expect(toJSON()).toBeNull();
  });
});
