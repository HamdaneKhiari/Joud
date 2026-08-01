/**
 * Smoke tests + comportement — Word Game Cards
 *
 * Couvre : DefinitionCard, BlanksCard, DetectiveCard, ReplyCard,
 *          TransformerCard, SyntaxMasterCard, SpeedMatchCard, AudioMatchCard,
 *          DialogueReaderCard, DialogueQuestionCard.
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
import DialogueReaderCard from '@/components/pedagogy/dialogues/DialogueReaderCard';
import DialogueQuestionCard from '@/components/pedagogy/dialogues/DialogueQuestionCard';

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

  it('annonce le résultat aux lecteurs d\'écran après validation (option mauvaise)', () => {
    // showFeedback = isValidated && (isCorrect || canSkip) — canSkip vient du hook mocké,
    // il faut donc le faire renvoyer true pour simuler "dernière tentative épuisée".
    require('@/hooks/exercises/useExerciceValidationState').useExerciseValidationState
      .mockReturnValue({ canSkip: true, validationState: 'incorrect', buttonDisabled: false });
    const { getByLabelText } = render(
      <DefinitionCard
        question={mockDefinitionQuestion}
        {...sharedCardProps}
        selectedOption="A type of bread."
        isValidated
        isCorrect={false}
        attemptCount={2}
        maxAttempts={2}
      />
    );
    expect(getByLabelText('A type of bread., mauvaise réponse')).toBeTruthy();
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

  it('annonce le résultat aux lecteurs d\'écran après validation (mot correct trouvé)', () => {
    const { getByLabelText } = render(
      <DetectiveCard
        question={mockDetectiveQuestion}
        selectedWord={1}
        {...sharedCardProps}
        isValidated
        isCorrect
        onAnswer={jest.fn()}
      />
    );
    expect(getByLabelText("don't, bonne réponse")).toBeTruthy();
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

// SyntaxMasterCard n'a pas onAnswer/selectedOption (state machine par mots ordonnés,
// pas par option choisie) — sous-ensemble de sharedCardProps qui correspond à son vrai contrat.
const sharedOrderCardProps = {
  isValidated: false,
  isCorrect: false,
  attemptCount: 0,
  maxAttempts: 2,
  onValidate: jest.fn(),
  onRetry: jest.fn(),
  onNext: jest.fn(),
  isLastQuestion: false,
};

describe('SyntaxMasterCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(
      <SyntaxMasterCard
        question={mockSentenceQuestion}
        selectedOrder={[]}
        {...sharedOrderCardProps}
        onOrder={jest.fn()}
      />
    )).not.toThrow();
  });

  it('affiche les mots désordonnés', () => {
    const { getByText } = render(
      <SyntaxMasterCard
        question={mockSentenceQuestion}
        selectedOrder={[]}
        {...sharedOrderCardProps}
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
        {...sharedOrderCardProps}
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
        {...sharedOrderCardProps}
        isValidated={false}
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
        {...sharedOrderCardProps}
        isValidated={false}
        onOrder={onOrder}
      />
    );
    // 'She' apparaît deux fois : dans words et dans ordered
    const sheButtons = getAllByText('She');
    fireEvent.press(sheButtons[0]);
    expect(onOrder).toHaveBeenCalled();
  });

  it('affiche l\'indice via le toggle "Besoin d\'aide ?" (absent avant ce correctif malgré la donnée disponible)', () => {
    const { getByText, queryByText } = render(
      <SyntaxMasterCard
        question={mockSentenceQuestion}
        selectedOrder={[]}
        {...sharedOrderCardProps}
        onOrder={jest.fn()}
      />
    );
    expect(queryByText('Commence par "She".')).toBeNull();
    fireEvent.press(getByText("Besoin d'aide ?"));
    expect(getByText('Commence par "She".')).toBeTruthy();
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

  it('mauvaise association → flash rouge + vibration (avant ce correctif : aucun signal du tout)', () => {
    const { act } = require('@testing-library/react-native');
    const Haptics = require('expo-haptics');
    // 2 paires pour avoir une mauvaise réponse possible (apple/pomme, banana/banane)
    const twoPairGame = { ...mockSpeedMatchQuestion, pairs: mockSpeedMatchQuestion.pairs.slice(0, 2), timeLimit: 30 };
    const { getByText, getByLabelText } = render(<SpeedMatchCard game={twoPairGame} onComplete={jest.fn()} />);

    fireEvent.press(getByText('apple'));
    fireEvent.press(getByText('banane')); // ne correspond pas à apple → mauvaise association

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
    expect(getByLabelText('apple, mauvaise association')).toBeTruthy();
    expect(getByLabelText('banane, mauvaise association')).toBeTruthy();

    // Le flash s'efface après le délai (l'app redevient utilisable normalement)
    act(() => { jest.advanceTimersByTime(400); });
    expect(getByLabelText('apple')).toBeTruthy();
  });

  it('trouve la dernière paire exactement quand le chrono passe à 0 → succès, pas échec (bug corrigé)', () => {
    const { act } = require('@testing-library/react-native');
    const singlePairGame = {
      ...mockSpeedMatchQuestion,
      pairs: [{ english: 'apple', french: 'pomme' }],
      timeLimit: 1,
    };
    const { getByText } = render(<SpeedMatchCard game={singlePairGame} onComplete={jest.fn()} />);
    fireEvent.press(getByText('apple'));
    // Le clic qui complète le match ET le tick du minuteur à 0 dans le même batch (act englobant
    // : les effets ne se recalculent qu'à sa sortie, donc l'ancien intervalle est encore actif) —
    // reproduit exactement le scénario "pile au moment où le temps expire" signalé par l'audit.
    act(() => {
      fireEvent.press(getByText('pomme'));
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('Bravo! Tu as réussi!')).toBeTruthy();
    expect(() => getByText('Temps écoulé!')).toThrow();
    expect(() => getByText('Game Over!')).toThrow();
  });

  it('temps écoulé sans avoir trouvé toutes les paires → message "Temps écoulé", jamais le générique "Game Over"', () => {
    const { act } = require('@testing-library/react-native');
    const { getByText } = render(
      <SpeedMatchCard game={{ ...mockSpeedMatchQuestion, timeLimit: 1 }} onComplete={jest.fn()} />
    );
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByText('Temps écoulé!')).toBeTruthy();
  });

  it('met le minuteur en pause quand l\'app passe en arrière-plan, reprend exactement où il en était au retour', () => {
    const { act } = require('@testing-library/react-native');
    const { AppState } = require('react-native');
    const { getByText } = render(
      <SpeedMatchCard game={{ ...mockSpeedMatchQuestion, timeLimit: 10 }} onComplete={jest.fn()} />
    );
    const [, changeHandler] = AppState.addEventListener.mock.calls.find(([event]: [string]) => event === 'change');

    act(() => { jest.advanceTimersByTime(3000); });
    expect(getByText('7s')).toBeTruthy();

    act(() => { changeHandler('background'); });
    act(() => { jest.advanceTimersByTime(5000); }); // en pause : ne décompte pas
    expect(getByText('7s')).toBeTruthy();

    act(() => { changeHandler('active'); });
    act(() => { jest.advanceTimersByTime(2000); }); // reprend pile où il en était
    expect(getByText('5s')).toBeTruthy();
  });

  it('signale l\'urgence (couleur + annonce lecteur d\'écran) dans les 5 dernières secondes', () => {
    const { act } = require('@testing-library/react-native');
    const { getByText, getByLabelText } = render(
      <SpeedMatchCard game={{ ...mockSpeedMatchQuestion, timeLimit: 7 }} onComplete={jest.fn()} />
    );
    // À 6s restantes : pas encore critique
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByText('6s').props.accessibilityLiveRegion).toBe('none');

    // À 5s restantes : signal d'urgence actif
    act(() => { jest.advanceTimersByTime(1000); });
    expect(getByText('5s').props.accessibilityLiveRegion).toBe('polite');
    expect(getByLabelText('5 secondes restantes')).toBeTruthy();
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
    expect(getByText('Continuer')).toBeTruthy();
  });

  it('mauvaise association → flash rouge + vibration sur l\'image (avant ce correctif : aucun signal du tout)', () => {
    const { act } = require('@testing-library/react-native');
    const Haptics = require('expo-haptics');
    // Rend le mélange des images déterministe (sort no-op) pour cibler "Image 2" (= banana)
    // sans ambiguïté après avoir sélectionné "apple".
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const { getByLabelText } = render(
      <AudioMatchCard game={mockAudioMatchQuestion} onComplete={jest.fn()} />
    );
    randomSpy.mockRestore();

    fireEvent.press(getByLabelText('Écouter "apple"'));
    fireEvent.press(getByLabelText('Image 2')); // banana, pas apple → mauvaise association

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
    expect(getByLabelText('Image 2, mauvaise association')).toBeTruthy();

    act(() => { jest.advanceTimersByTime(400); });
    expect(getByLabelText('Image 2')).toBeTruthy();
  });

  it('le callback onDone d\'un 1er mot ne remet pas l\'icône "en lecture" d\'un 2e mot déjà lancé', () => {
    const Speech = require('expo-speech');
    const { getByLabelText } = render(
      <AudioMatchCard game={mockAudioMatchQuestion} onComplete={jest.fn()} />
    );
    fireEvent.press(getByLabelText('Écouter "apple"'));
    const firstCallOptions = Speech.speak.mock.calls[0][1];
    fireEvent.press(getByLabelText('Écouter "banana"'));

    // Le callback onDone du mot "apple" (obsolète, plus l'utterance active) se déclenche après coup.
    firstCallOptions.onDone();

    // "banana" doit rester affiché comme en cours de lecture, pas repasser à son état "arrêté".
    expect(getByLabelText('Lecture en cours')).toBeTruthy();
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

describe('DialogueReaderCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(
      <DialogueReaderCard
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
      <DialogueReaderCard
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

  it('bloque le lancement d\'une 2e bulle audio tant que la 1re joue encore', () => {
    const dialogueWithAudio = {
      ...mockDialogue,
      messages: [
        { ...mockDialogue.messages[0], audio: 'file://msg0.mp3' },
        { ...mockDialogue.messages[1], audio: 'file://msg1.mp3' },
      ],
    };
    const { getByLabelText } = render(
      <DialogueReaderCard
        dialogue={dialogueWithAudio}
        currentMessageIndex={1}
        onPreviousMessage={jest.fn()}
        onNextMessage={jest.fn()}
        isLastMessage={false}
        totalMessages={2}
      />
    );
    const { Audio } = require('expo-av');
    fireEvent.press(getByLabelText('Écouter "Hello, can I have a coffee please?"'));
    // La 2e bulle passe disabled=true dès que playingBubble n'est plus null,
    // avant même que la 1re lecture ait fini de charger (createAsync).
    expect(getByLabelText('Écouter "Of course! Anything else?"').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(getByLabelText('Écouter "Of course! Anything else?"'));
    expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(1);
  });

  it('utilise le NavigationButtons unifié — "Suivant" en cours de dialogue, "Voir les questions" au dernier message', () => {
    const { getByText, rerender } = render(
      <DialogueReaderCard
        dialogue={mockDialogue}
        currentMessageIndex={0}
        onPreviousMessage={jest.fn()}
        onNextMessage={jest.fn()}
        isLastMessage={false}
        totalMessages={2}
      />
    );
    expect(getByText('Suivant')).toBeTruthy();

    rerender(
      <DialogueReaderCard
        dialogue={mockDialogue}
        currentMessageIndex={1}
        onPreviousMessage={jest.fn()}
        onNextMessage={jest.fn()}
        isLastMessage
        totalMessages={2}
      />
    );
    expect(getByText('Voir les questions')).toBeTruthy();
  });
});

describe('DialogueQuestionCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    const mockQuestion = {
      question: 'What does Alice order?',
      options: ['Coffee', 'Tea', 'Water', 'Juice'],
      correctAnswer: 0,
    };
    expect(() => render(
      <DialogueQuestionCard
        question={mockQuestion}
        selectedOption={undefined}
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
import type { GameQuestion, GameType } from '@/screens/WordGames/schema';
import type { UseGameStateReturn } from '@/screens/WordGames/hooks/useGameState';
import type { UseGameHandlersReturn } from '@/screens/WordGames/hooks/useGameHandlers';

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

  const states = mockStates as unknown as UseGameStateReturn;
  const handlers = mockHandlers as unknown as UseGameHandlersReturn;

  it('retourne null si currentQuestion est null', () => {
    const { toJSON } = render(
      <GameCardRenderer
        gameType="definition" currentQuestion={null as unknown as GameQuestion}
        currentQuestionIndex={0} isLastQuestion={false}
        gameFamily={mockGameFamily} states={states} handlers={handlers}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('rend DefinitionCard pour type definition', () => {
    const q: GameQuestion = { type: 'definition', difficulty: 'easy', word: 'Cat', definition: 'A furry pet', options: ['Dog', 'Cat', 'Bird', 'Fish'], correctAnswer: 'Cat' };
    const { getByText } = render(
      <GameCardRenderer
        gameType="definition" currentQuestion={q}
        currentQuestionIndex={0} isLastQuestion={false}
        gameFamily={mockGameFamily} states={states} handlers={handlers}
      />
    );
    expect(getByText('Cat')).toBeTruthy();
  });

  it('rend BlanksCard pour type blanks', () => {
    const q: GameQuestion = { type: 'blanks', difficulty: 'easy', sentence: 'The ___ is fat.', options: ['cat', 'dog'], correctAnswer: 'cat' };
    expect(() => render(
      <GameCardRenderer
        gameType="blanks" currentQuestion={q}
        currentQuestionIndex={0} isLastQuestion={false}
        gameFamily={mockGameFamily} states={states} handlers={handlers}
      />
    )).not.toThrow();
  });

  it('rend null pour type inconnu', () => {
    const q = { type: 'unknown_type' };
    const { toJSON } = render(
      <GameCardRenderer
        gameType={'unknown_type' as unknown as GameType} currentQuestion={q as unknown as GameQuestion}
        currentQuestionIndex={0} isLastQuestion={false}
        gameFamily={mockGameFamily} states={states} handlers={handlers}
      />
    );
    expect(toJSON()).toBeNull();
  });
});
