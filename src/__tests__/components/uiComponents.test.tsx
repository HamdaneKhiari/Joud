/**
 * Tests: ExerciseDecorative, ConnectorCardRenderer, SummaryPhase
 * Composants UI utilitaires — smoke + branches de rendu.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { tokens } from '@/themes/tokens';

// ============================================
// Mocks
// ============================================

jest.mock('@/themes/ThemeContext', () => ({ useTheme: jest.fn() }));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));
jest.mock('@/hooks/useSafeAction', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// ============================================
// Imports
// ============================================

import ExerciseDecorative from '@/components/layout/ExerciseHeader/components/ExerciseDecorative';
import ConnectorCardRenderer from '@/components/pedagogy/Connector/ConnectorCardRenderer';
import SummaryPhase from '@/screens/RevisionScreen/components/SummaryPhase';
import CompletionModal from '@/components/common/CompletionModal';
import DashboardCard from '@/screens/Dashboard/components/DashboardCard';
import { InfoBox } from '@/screens/components/InfoBox';
import RephrasingCard from '@/components/pedagogy/Connector/RephrasingCard';
import SentenceFusionCard from '@/components/pedagogy/Connector/SentenceFusionCard';

// ============================================
// Fixture
// ============================================

const mockIdentity = {
  id: 'college', themeMode: 'light' as const, organizationName: 'Joud',
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
  const { useTheme } = require('@/themes/ThemeContext');
  useTheme.mockReturnValue({ identity: mockIdentity, tokens });
  require('@/hooks/useSafeAction').default.mockReturnValue({
    execute: jest.fn(), loading: false, disabled: false, lastExecuted: 0, cleanup: jest.fn(),
  });
}

// ============================================
// ExerciseDecorative
// ============================================

describe('ExerciseDecorative', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend un emoji (string sans URL)', () => {
    const { getByText } = render(<ExerciseDecorative icon="📚" />);
    expect(getByText('📚')).toBeTruthy();
  });

  it('rend sans crash avec position=left', () => {
    expect(() => render(<ExerciseDecorative icon="📖" position="left" />)).not.toThrow();
  });

  it('rend sans crash avec position=center', () => {
    expect(() => render(<ExerciseDecorative icon="🎯" position="center" />)).not.toThrow();
  });

  it('rend sans crash avec position=right (défaut)', () => {
    expect(() => render(<ExerciseDecorative icon="⭐" position="right" />)).not.toThrow();
  });

  it('rend une image URI (http)', () => {
    expect(() => render(<ExerciseDecorative icon="https://example.com/img.png" />)).not.toThrow();
  });

  it('rend un nombre (image locale)', () => {
    expect(() => render(<ExerciseDecorative icon={42} />)).not.toThrow();
  });

  it('rend un ReactElement', () => {
    const element = <></>;
    expect(() => render(<ExerciseDecorative icon={element} />)).not.toThrow();
  });
});

// ============================================
// ConnectorCardRenderer
// ============================================

describe('ConnectorCardRenderer', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  const mockStates = {
    logicState: { selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 },
    fusionState: { userAnswer: '', isValidated: false, isCorrect: false, attemptCount: 0 },
    rephrasingState: { userAnswer: '', isValidated: false, isCorrect: false, attemptCount: 0 },
  };
  const noop = jest.fn();
  const mockHandlers = {
    logic:      { onAnswer: noop, onValidate: noop, onRetry: noop, onNext: noop },
    fusion:     { onAnswer: noop, onValidate: noop, onRetry: noop, onNext: noop },
    rephrasing: { onAnswer: noop, onValidate: noop, onRetry: noop, onNext: noop },
  };

  it('retourne null si currentQuestion est null', () => {
    const { toJSON } = render(
      <ConnectorCardRenderer exerciseType="logic" currentQuestion={null as any} currentQuestionIndex={0} isLastQuestion={false} exerciseFamily={null as any} states={mockStates as any} handlers={mockHandlers as any} />
    );
    expect(toJSON()).toBeNull();
  });

  it('rend LogicLinksCard pour exerciseType=logic', () => {
    const q = { sentence: 'I was tired ___ I slept.', options: ['so', 'but', 'because'], correctAnswer: 'so', translation: '' };
    expect(() => render(
      <ConnectorCardRenderer exerciseType="logic" currentQuestion={q as any} currentQuestionIndex={0} isLastQuestion={false} exerciseFamily={null as any} states={mockStates as any} handlers={mockHandlers as any} />
    )).not.toThrow();
  });

  it('rend null pour exerciseType inconnu', () => {
    const q = { type: 'unknown' };
    const { toJSON } = render(
      <ConnectorCardRenderer exerciseType={'unknown' as any} currentQuestion={q as any} currentQuestionIndex={0} isLastQuestion={false} exerciseFamily={null as any} states={mockStates as any} handlers={mockHandlers as any} />
    );
    expect(toJSON()).toBeNull();
  });
});

// ============================================
// SummaryPhase
// ============================================

describe('SummaryPhase', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  const baseProps = {
    identity: mockIdentity as any,
    totalQuestions: 10,
    correctCount: 9,
    incorrectCount: 1,
    onBack: jest.fn(),
    onRestart: jest.fn(),
  };

  it('rend sans crash', () => {
    expect(() => render(<SummaryPhase {...baseProps} />)).not.toThrow();
  });

  it('affiche le pourcentage de réussite', () => {
    const { getByText } = render(<SummaryPhase {...baseProps} />);
    expect(getByText('90%')).toBeTruthy();
  });

  it('getMessage >= 80% → Incroyable (playful)', () => {
    const { getByText } = render(<SummaryPhase {...baseProps} correctCount={9} totalQuestions={10} />);
    expect(getByText('🎉 Incroyable !')).toBeTruthy();
  });

  it('getMessage >= 60% et < 80% → Bien joué', () => {
    const { getByText } = render(<SummaryPhase {...baseProps} correctCount={7} totalQuestions={10} />);
    expect(getByText('👍 Bien joué !')).toBeTruthy();
  });

  it('getMessage >= 40% et < 60% → Continue', () => {
    const { getByText } = render(<SummaryPhase {...baseProps} correctCount={4} totalQuestions={10} />);
    expect(getByText('💪 Continue !')).toBeTruthy();
  });

  it('getMessage < 40% → Révise encore', () => {
    const { getByText } = render(<SummaryPhase {...baseProps} correctCount={2} totalQuestions={10} />);
    expect(getByText('📖 Révise encore !')).toBeTruthy();
  });

  it('totalQuestions=0 → 0% sans crash', () => {
    const { getByText } = render(<SummaryPhase {...baseProps} correctCount={0} totalQuestions={0} incorrectCount={0} />);
    expect(getByText('0%')).toBeTruthy();
  });
});

// ============================================
// CompletionModal
// ============================================

describe('CompletionModal', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash quand visible=false', () => {
    expect(() => render(<CompletionModal visible={false} onDone={jest.fn()} />)).not.toThrow();
  });

  it('rend sans crash quand visible=true', () => {
    expect(() => render(<CompletionModal visible={true} onDone={jest.fn()} title="Bravo !" subtitle="Exercice terminé" />)).not.toThrow();
  });

  it('affiche le titre quand visible=true', () => {
    const { getByText } = render(<CompletionModal visible={true} onDone={jest.fn()} title="Lesson done!" />);
    expect(getByText('Lesson done!')).toBeTruthy();
  });
});

// ============================================
// DashboardCard
// ============================================

describe('DashboardCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('rend sans crash', () => {
    expect(() => render(<DashboardCard icon="📚" title="Vocab" variantColor="primary" />)).not.toThrow();
  });

  it('affiche le titre', () => {
    const { getByText } = render(<DashboardCard icon="📚" title="Mon module" variantColor="primary" />);
    expect(getByText('Mon module')).toBeTruthy();
  });

  it('affiche le subtitle si fourni', () => {
    const { getByText } = render(<DashboardCard icon="🎯" title="T" subtitle="Sous-titre" variantColor="accent" />);
    expect(getByText('Sous-titre')).toBeTruthy();
  });

  it('affiche le buttonText si fourni', () => {
    const { getByText } = render(<DashboardCard icon="⭐" title="T" buttonText="Commencer" variantColor="primary" onPress={jest.fn()} />);
    expect(getByText('Commencer')).toBeTruthy();
  });

  it('showArrow=false → pas de flèche ➔', () => {
    const { queryByText } = render(<DashboardCard icon="📚" title="T" variantColor="primary" onPress={jest.fn()} showArrow={false} />);
    expect(queryByText('➔')).toBeNull();
  });

  it('rend les children', () => {
    const { getByText } = render(
      <DashboardCard icon="📚" title="T" variantColor="primary">
        <></>
      </DashboardCard>
    );
    expect(getByText('T')).toBeTruthy();
  });
});

// ============================================
// InfoBox
// ============================================

describe('InfoBox', () => {
  it('rend sans crash', () => {
    expect(() => render(
      <InfoBox icon="information-circle" iconColor="#34495E" backgroundColor="#F9FAFB" borderColor="#D1D5DB" text="Test info" />
    )).not.toThrow();
  });

  it('affiche le texte', () => {
    const { getByText } = render(
      <InfoBox icon="information-circle" iconColor="#34495E" backgroundColor="#F9FAFB" borderColor="#D1D5DB" text="Hello info" />
    );
    expect(getByText('Hello info')).toBeTruthy();
  });

  it('affiche le titre si fourni', () => {
    const { getByText } = render(
      <InfoBox icon="warning" iconColor="#F59E0B" backgroundColor="#FFF" borderColor="#F59E0B" title="Attention" text="Message" />
    );
    expect(getByText('Attention')).toBeTruthy();
  });
});

// ============================================
// RephrasingCard
// ============================================

describe('RephrasingCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  const baseQuestion = {
    baseSentence: 'I am happy.', correctAnswer: 'I feel happy.',
    instruction: 'Rephrase using "feel"', translation: 'Je suis heureux.',
  };
  const noop = jest.fn();

  it('rend sans crash', () => {
    expect(() => render(
      <RephrasingCard question={baseQuestion as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} />
    )).not.toThrow();
  });

  it('affiche la phrase originale', () => {
    const { getByText } = render(
      <RephrasingCard question={baseQuestion as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} />
    );
    expect(getByText('I am happy.')).toBeTruthy();
  });

  it('affiche l\'instruction', () => {
    const { getByText } = render(
      <RephrasingCard question={baseQuestion as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} />
    );
    expect(getByText('Rephrase using "feel"')).toBeTruthy();
  });

  it('hideValidation=true → pas de bouton Valider', () => {
    const { queryByText } = render(
      <RephrasingCard question={baseQuestion as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} hideValidation />
    );
    expect(queryByText('Valider')).toBeNull();
  });

  it('isValidated=true, isCorrect=false, attemptCount>=maxAttempts → affiche correctAnswer', () => {
    const { getByText } = render(
      <RephrasingCard question={baseQuestion as any} userAnswer="wrong" isValidated={true} isCorrect={false}
        attemptCount={2} maxAttempts={2}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} />
    );
    expect(getByText('I feel happy.')).toBeTruthy();
  });
});

// ============================================
// SentenceFusionCard
// ============================================

describe('SentenceFusionCard', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  const baseQuestion = {
    phrase1: 'I was tired.', phrase2: 'I went to bed.', correctAnswer: 'I was tired so I went to bed.',
    hint: 'Use "so"', translation: 'J\'étais fatigué donc je suis allé au lit.',
  };
  const noop = jest.fn();

  it('rend sans crash', () => {
    expect(() => render(
      <SentenceFusionCard question={baseQuestion as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} />
    )).not.toThrow();
  });

  it('affiche phrase1 et phrase2', () => {
    const { getByText } = render(
      <SentenceFusionCard question={baseQuestion as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} />
    );
    expect(getByText('I was tired.')).toBeTruthy();
    expect(getByText('I went to bed.')).toBeTruthy();
  });

  it('affiche le hint', () => {
    const { getByText } = render(
      <SentenceFusionCard question={baseQuestion as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} />
    );
    expect(getByText('Use "so"')).toBeTruthy();
  });

  it('hideValidation=true → pas de bouton', () => {
    const { queryByText } = render(
      <SentenceFusionCard question={baseQuestion as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} hideValidation />
    );
    expect(queryByText('Valider')).toBeNull();
  });

  it('sans hint → rend sans crash', () => {
    const noHintQ = { ...baseQuestion, hint: undefined };
    expect(() => render(
      <SentenceFusionCard question={noHintQ as any} userAnswer="" isValidated={false} isCorrect={false}
        onAnswer={noop} onValidate={noop} onRetry={noop} onNext={noop} isLastQuestion={false} />
    )).not.toThrow();
  });
});
