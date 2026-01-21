export interface BaseConnectorProps {
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  maxAttempts: number;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  color: string;
}

export interface LogicQuestion {
  sentence: string;
  options: string[];
  correctAnswer: string;
  translation?: string;
}

export interface LogicLinksCardProps extends BaseConnectorProps {
  question: LogicQuestion;
  selectedOption?: string;
  onAnswer: (option: string) => void;
}

export interface FusionQuestion {
  phrase1: string;
  phrase2: string;
  hint?: string;
  correctAnswer: string;
  translation?: string;
}

export interface SentenceFusionCardProps extends BaseConnectorProps {
  question: FusionQuestion;
  userAnswer?: string;
  onAnswer: (text: string) => void;
}

export interface RephrasingQuestion {
  baseSentence: string;
  instruction: string;
  correctAnswer: string;
  translation?: string;
}

export interface RephrasingCardProps extends BaseConnectorProps {
  question: RephrasingQuestion;
  userAnswer?: string;
  onAnswer: (text: string) => void;
}

// State interfaces for the Renderer
export interface LogicState {
  selectedOption?: string;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

export interface FusionState {
  userAnswer?: string;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

export interface RephrasingState {
  userAnswer?: string;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

export interface ConnectorHandlers {
  onAnswer: (answer: any) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export interface ConnectorCardRendererProps {
  exerciseType: 'logic' | 'fusion' | 'rephrasing';
  currentQuestion: LogicQuestion | FusionQuestion | RephrasingQuestion;
  currentQuestionIndex: number;
  isLastQuestion: boolean;
  exerciseFamily: {
    color: string;
    [key: string]: any;
  };
  states: {
    logicState: LogicState;
    fusionState: FusionState;
    rephrasingState: RephrasingState;
  };
  handlers: {
    logic: ConnectorHandlers;
    fusion: ConnectorHandlers;
    rephrasing: ConnectorHandlers;
  };
}