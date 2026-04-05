/**
 * Tests de composants pédagogiques
 *
 * Couvre : WordCard, GrammarCard, QuestionCard, ExerciseValidation, RevisionQuestionCard
 * Stratégie : smoke test + comportement (fireEvent) + contenu (getByText)
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

// AudioButton — mock léger pour éviter la chaîne expo-av / expo-speech / useTheme interne
jest.mock('@/components/ui/AudioButtons/AudioButton', () => {
  const React = require('react');
  return ({ text }: { text: string }) => React.createElement('View', { testID: `audio-btn-${text}` });
});

// useSafeAction — mock complet pour ExerciseValidation
jest.mock('@/hooks/useSafeAction', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import WordCard from '@/components/pedagogy/Vocabulary/WordCard/WordCard';
import GrammarCard from '@/components/pedagogy/grammar/GrammarCard';
import QuestionCard from '@/components/pedagogy/shared/QuestionCard';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import RevisionQuestionCard from '@/components/pedagogy/revision/RevisionQuestionCard';

// ============================================
// Fixtures
// ============================================

const mockIdentity = {
  id: 'college',
  themeMode: 'light' as const,
  organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
  header: { background: '#34495E', accent: '#FFD700', emoji: '📚', welcomeText: 'Bonjour !' },
  dailyWord: { background: '#FFF9C4', decoration: 'none' },
  aiTutor: { title: 'Tuteur IA', subtitle: 'Aide aux devoirs' },
  aiDiagnostic: { accent: '#34495E', error: '#D32F2F', solutionBackground: ['#ECEFF1', '#CFD8DC'] },
  dashboard: { levelProgress: '#34495E' },
  i18n: { locale: 'fr', rtl: false },
  icons: { logo: 'school', hint: 'bulb-outline', hideHint: 'eye-off-outline' },
  iconSize: { xs: 12, sm: 16, md: 24, lg: 32, xl: 48 },
  fontFamily: {
    regular: 'System', medium: 'System', semibold: 'System',
    bold: 'System', title: 'System', extrabold: 'System',
  },
};

const mockSafeAction = { execute: jest.fn(), loading: false, disabled: false, lastExecuted: 0, cleanup: jest.fn() };

function setupMocks() {
  const { useTheme } = require('@/themes/ThemeContext');
  useTheme.mockReturnValue({ identity: mockIdentity, tokens, currentApp: 'college' });

  const useSafeAction = require('@/hooks/useSafeAction').default as jest.Mock;
  useSafeAction.mockReturnValue(mockSafeAction);
}

// ============================================
// WordCard
// ============================================

describe('WordCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('rend sans crash', () => {
    expect(() => render(<WordCard englishWord="apple" frenchWord="pomme" />)).not.toThrow();
  });

  it('affiche le mot anglais et la traduction française', () => {
    const { getByText } = render(<WordCard englishWord="apple" frenchWord="pomme" />);
    expect(getByText('apple')).toBeTruthy();
    expect(getByText('pomme')).toBeTruthy();
  });

  it('affiche la phrase d\'exemple quand exampleSentence est fourni', () => {
    const { getByText } = render(
      <WordCard
        englishWord="apple"
        frenchWord="pomme"
        exampleSentence="I eat an apple every day."
        exampleTranslation="Je mange une pomme chaque jour."
      />
    );
    expect(getByText('I eat an apple every day.')).toBeTruthy();
    expect(getByText('Je mange une pomme chaque jour.')).toBeTruthy();
  });

  it('n\'affiche pas de phrase d\'exemple si exampleSentence est absent', () => {
    const { queryByText } = render(
      <WordCard englishWord="apple" frenchWord="pomme" />
    );
    expect(queryByText('Je mange une pomme chaque jour.')).toBeNull();
  });

  it('avec highlightWord → rend sans crash (splitting regex)', () => {
    expect(() => render(
      <WordCard
        englishWord="apple"
        frenchWord="pomme"
        exampleSentence="I eat an apple every day."
        highlightWord="apple"
      />
    )).not.toThrow();
  });
});

// ============================================
// GrammarCard
// ============================================

const mockLessonData = {
  title: 'Present Simple',
  rule: 'Use the base form of the verb for I/you/we/they.',
  simplified: 'Pour les actions habituelles.',
  examples: ['I play football.', 'She plays tennis.'],
  exercise: {
    question: 'Which is correct?',
    options: ['He play football', 'He plays football', 'He playing football'],
    correctAnswer: 'He plays football',
  },
};

describe('GrammarCard', () => {
  const onAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    onAnswer.mockReset();
  });

  it('rend sans crash', () => {
    expect(() => render(
      <GrammarCard
        lessonData={mockLessonData}
        exerciseState={{ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 }}
        onAnswer={onAnswer}
      />
    )).not.toThrow();
  });

  it('affiche le titre, la règle, les exemples et la question', () => {
    const { getByText } = render(
      <GrammarCard
        lessonData={mockLessonData}
        exerciseState={{ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 }}
        onAnswer={onAnswer}
      />
    );
    expect(getByText('Present Simple')).toBeTruthy();
    expect(getByText('Use the base form of the verb for I/you/we/they.')).toBeTruthy();
    expect(getByText('I play football.')).toBeTruthy();
    expect(getByText('Which is correct?')).toBeTruthy();
  });

  it('affiche "En bref" quand simplified est fourni', () => {
    const { getByText } = render(
      <GrammarCard
        lessonData={mockLessonData}
        exerciseState={{ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 }}
        onAnswer={onAnswer}
      />
    );
    expect(getByText('Pour les actions habituelles.')).toBeTruthy();
  });

  it('appelle onAnswer quand une option est pressée (non validé)', () => {
    const { getByText } = render(
      <GrammarCard
        lessonData={mockLessonData}
        exerciseState={{ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 }}
        onAnswer={onAnswer}
      />
    );
    fireEvent.press(getByText('He plays football'));
    expect(onAnswer).toHaveBeenCalledWith('He plays football');
  });

  it('n\'appelle PAS onAnswer quand validé (options désactivées)', () => {
    const { getByText } = render(
      <GrammarCard
        lessonData={mockLessonData}
        exerciseState={{ selectedOption: 'He plays football', isValidated: true, isCorrect: true, attemptCount: 1 }}
        onAnswer={onAnswer}
      />
    );
    fireEvent.press(getByText('He plays football'));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('rend sans titre ni simplified', () => {
    const lessonWithoutOptional = {
      rule: 'Simple rule.',
      examples: [],
      exercise: { question: 'Q?', options: ['A', 'B'], correctAnswer: 'A' },
    };
    expect(() => render(
      <GrammarCard
        lessonData={lessonWithoutOptional}
        exerciseState={{ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 }}
        onAnswer={onAnswer}
      />
    )).not.toThrow();
  });
});

// ============================================
// QuestionCard
// ============================================

describe('QuestionCard', () => {
  const onAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    onAnswer.mockReset();
  });

  it('rend sans crash', () => {
    expect(() => render(
      <QuestionCard
        question="What is the plural of 'cat'?"
        options={['cats', 'cates', 'caties']}
        onAnswer={onAnswer}
      />
    )).not.toThrow();
  });

  it('affiche la question et les options', () => {
    const { getByText } = render(
      <QuestionCard
        question="What is the plural of 'cat'?"
        options={['cats', 'cates', 'caties']}
        onAnswer={onAnswer}
      />
    );
    expect(getByText("What is the plural of 'cat'?")).toBeTruthy();
    expect(getByText('cats')).toBeTruthy();
    expect(getByText('cates')).toBeTruthy();
  });

  it('appelle onAnswer quand une option est pressée', () => {
    const { getByText } = render(
      <QuestionCard
        question="Question?"
        options={['cats', 'cates']}
        onAnswer={onAnswer}
      />
    );
    fireEvent.press(getByText('cats'));
    expect(onAnswer).toHaveBeenCalledWith('cats');
  });

  it('n\'affiche pas d\'indice par défaut', () => {
    const { queryByText } = render(
      <QuestionCard
        question="Question?"
        options={['A', 'B']}
        onAnswer={onAnswer}
        hint="This is a hint"
      />
    );
    // L'indice est caché par défaut
    expect(queryByText('This is a hint')).toBeNull();
  });

  it('affiche l\'indice après avoir pressé le bouton d\'aide', () => {
    const { getByText, queryByText } = render(
      <QuestionCard
        question="Question?"
        options={['A', 'B']}
        onAnswer={onAnswer}
        hint="This is a hint"
      />
    );
    fireEvent.press(getByText("Besoin d'aide ?"));
    expect(getByText('This is a hint')).toBeTruthy();
    // Et le bouton change de texte
    expect(queryByText("Besoin d'aide ?")).toBeNull();
    expect(getByText("Masquer l'indice")).toBeTruthy();
  });

  it('masque l\'indice quand on presse "Masquer l\'indice"', () => {
    const { getByText, queryByText } = render(
      <QuestionCard
        question="Question?"
        options={['A', 'B']}
        onAnswer={onAnswer}
        hint="This is a hint"
      />
    );
    // Ouvrir
    fireEvent.press(getByText("Besoin d'aide ?"));
    // Fermer
    fireEvent.press(getByText("Masquer l'indice"));
    expect(queryByText('This is a hint')).toBeNull();
  });

  it('n\'affiche pas le bouton d\'indice si hint est absent', () => {
    const { queryByText } = render(
      <QuestionCard question="Q?" options={['A', 'B']} onAnswer={onAnswer} />
    );
    expect(queryByText("Besoin d'aide ?")).toBeNull();
  });

  it('affiche le FeedbackBanner quand externalShowFeedback=true', () => {
    const { getByText } = render(
      <QuestionCard
        question="Q?"
        options={['A', 'B']}
        onAnswer={onAnswer}
        externalShowFeedback
        externalIsCorrect
        feedbackMessage="Correct !"
      />
    );
    expect(getByText('Correct !')).toBeTruthy();
  });
});

// ============================================
// ExerciseValidation
// ============================================

describe('ExerciseValidation', () => {
  const onValidate = jest.fn();
  const onNext = jest.fn();
  const onRetry = jest.fn();
  const onSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    mockSafeAction.execute.mockReset();
    [onValidate, onNext, onRetry, onSkip].forEach(fn => fn.mockReset());
  });

  it('rend sans crash (état initial)', () => {
    expect(() => render(
      <ExerciseValidation onValidate={onValidate} onNext={onNext} />
    )).not.toThrow();
  });

  it('état "initial" → affiche "Valider"', () => {
    const { getByText } = render(
      <ExerciseValidation state="initial" onValidate={onValidate} />
    );
    expect(getByText('Valider')).toBeTruthy();
  });

  it('état "correct" (non-dernière question) → affiche "Continuer"', () => {
    const { getByText } = render(
      <ExerciseValidation state="correct" isLastQuestion={false} onNext={onNext} />
    );
    expect(getByText('Continuer')).toBeTruthy();
  });

  it('état "correct" + isLastQuestion → affiche "Terminer"', () => {
    const { getByText } = render(
      <ExerciseValidation state="correct" isLastQuestion onNext={onNext} />
    );
    expect(getByText('Terminer')).toBeTruthy();
  });

  it('état "incorrect" → affiche "Réessayer"', () => {
    const { getByText } = render(
      <ExerciseValidation state="incorrect" onRetry={onRetry} />
    );
    expect(getByText('Réessayer')).toBeTruthy();
  });

  it('état "skip" → affiche "Continuer"', () => {
    const { getByText } = render(
      <ExerciseValidation state="skip" onSkip={onSkip} />
    );
    expect(getByText('Continuer')).toBeTruthy();
  });

  it('presse le bouton en état "initial" → appelle safeValidate.execute', () => {
    const { getByText } = render(
      <ExerciseValidation state="initial" onValidate={onValidate} />
    );
    fireEvent.press(getByText('Valider'));
    expect(mockSafeAction.execute).toHaveBeenCalled();
  });

  it('disabled=true → le bouton ne déclenche pas execute', () => {
    const { getByText } = render(
      <ExerciseValidation state="initial" onValidate={onValidate} disabled />
    );
    fireEvent.press(getByText('Valider'));
    expect(mockSafeAction.execute).not.toHaveBeenCalled();
  });

  it('état "incorrect" → affiche les points de tentative quand maxAttempts > 1', () => {
    const { getByText } = render(
      <ExerciseValidation
        state="incorrect"
        attemptCount={1}
        maxAttempts={2}
        onRetry={onRetry}
      />
    );
    // remainingAttempts = 2 - 1 = 1 → "Encore 1 essai"
    expect(getByText('Encore 1 essai')).toBeTruthy();
  });

  it('affiche feedback par défaut correct en état "correct"', () => {
    const { getByText } = render(
      <ExerciseValidation state="correct" onNext={onNext} showFeedback />
    );
    expect(getByText('CORRECT')).toBeTruthy();
  });

  it('affiche feedback personnalisé si feedbackMessage fourni', () => {
    const { getByText } = render(
      <ExerciseValidation
        state="correct"
        onNext={onNext}
        showFeedback
        feedbackMessage={{ title: 'Parfait !', message: 'Excellente réponse' }}
      />
    );
    expect(getByText('Parfait !')).toBeTruthy();
    expect(getByText('Excellente réponse')).toBeTruthy();
  });

  it('showFeedback=false → pas de FeedbackBanner', () => {
    const { queryByText } = render(
      <ExerciseValidation state="correct" onNext={onNext} showFeedback={false} />
    );
    expect(queryByText('CORRECT')).toBeNull();
  });
});

// ============================================
// RevisionQuestionCard
// ============================================

const mockRevisionQuestion = {
  id: 'q1',
  questionText: 'What is the capital of France?',
  options: ['London', 'Paris', 'Berlin'],
  correctAnswer: 'Paris',
  emoji: '🌍',
  module: 'vocab',
  difficulty: 1,
};

describe('RevisionQuestionCard', () => {
  const onSelectAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    onSelectAnswer.mockReset();
  });

  it('rend sans crash', () => {
    expect(() => render(
      <RevisionQuestionCard
        question={mockRevisionQuestion}
        selectedAnswer={null}
        isValidated={false}
        isCorrect={false}
        onSelectAnswer={onSelectAnswer}
      />
    )).not.toThrow();
  });

  it('affiche le texte de la question et les options', () => {
    const { getByText } = render(
      <RevisionQuestionCard
        question={mockRevisionQuestion}
        selectedAnswer={null}
        isValidated={false}
        isCorrect={false}
        onSelectAnswer={onSelectAnswer}
      />
    );
    expect(getByText('What is the capital of France?')).toBeTruthy();
    expect(getByText('London')).toBeTruthy();
    expect(getByText('Paris')).toBeTruthy();
    expect(getByText('Berlin')).toBeTruthy();
  });

  it('appelle onSelectAnswer quand une option est pressée (non validé)', () => {
    const { getByText } = render(
      <RevisionQuestionCard
        question={mockRevisionQuestion}
        selectedAnswer={null}
        isValidated={false}
        isCorrect={false}
        onSelectAnswer={onSelectAnswer}
      />
    );
    fireEvent.press(getByText('Paris'));
    expect(onSelectAnswer).toHaveBeenCalledWith('Paris');
  });

  it('n\'appelle PAS onSelectAnswer quand validé', () => {
    const { getByText } = render(
      <RevisionQuestionCard
        question={mockRevisionQuestion}
        selectedAnswer="Paris"
        isValidated
        isCorrect
        onSelectAnswer={onSelectAnswer}
      />
    );
    fireEvent.press(getByText('Paris'));
    expect(onSelectAnswer).not.toHaveBeenCalled();
  });

  it('rend sans crash après validation correcte', () => {
    expect(() => render(
      <RevisionQuestionCard
        question={mockRevisionQuestion}
        selectedAnswer="Paris"
        isValidated
        isCorrect
        onSelectAnswer={onSelectAnswer}
      />
    )).not.toThrow();
  });

  it('rend sans crash après validation incorrecte', () => {
    expect(() => render(
      <RevisionQuestionCard
        question={mockRevisionQuestion}
        selectedAnswer="London"
        isValidated
        isCorrect={false}
        onSelectAnswer={onSelectAnswer}
      />
    )).not.toThrow();
  });
});
