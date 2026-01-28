/**
 * ============================================
 * GAME CARD RENDERER (TypeScript + Type Guards)
 * Composant de routage qui affiche la bonne card selon le type de question
 * ============================================
 */

import React from 'react';

// Cards
import DefinitionCard from '../DefinitionCard';
import BlanksCard from '../BlanksCard';
import SyntaxMasterCard from '../SyntaxMasterCard';
import SpeedMatchCard from '../SpeedMatchCard';
import DetectiveCard from '../DetectiveCard';
import IdiomsCard from '../IdiomsCard';

// Types & Type Guards
import type { GameQuestion, GameType } from '@/screens/WordGames/schema';
import {
  isDefinitionQuestion,
  isBlanksQuestion,
  isSentenceQuestion,
  isSpeedMatchQuestion,
  isDetectiveQuestion,
  isIdiomsQuestion,
} from '@/screens/WordGames/schema';

// Hooks
import type { UseGameStateReturn } from '@/screens/WordGames/hooks/useGameState';
import type { UseGameHandlersReturn } from '@/screens/WordGames/hooks/useGameHandlers';
import type { Family } from '@/database/schema';

// ============================================
// TYPES
// ============================================

export interface GameCardRendererProps {
  gameType: GameType;
  currentQuestion: GameQuestion;
  currentQuestionIndex: number;
  isLastQuestion: boolean;
  gameFamily: Family;
  states: UseGameStateReturn;
  handlers: UseGameHandlersReturn;
}

// ============================================
// CONSTANTS
// ============================================

const MAX_ATTEMPTS = 2;

// ============================================
// COMPOSANT
// ============================================

const GameCardRenderer: React.FC<GameCardRendererProps> = ({
  gameType,
  currentQuestion,
  currentQuestionIndex,
  isLastQuestion,
  gameFamily,
  states,
  handlers,
}) => {
  // Vérification de sécurité
  if (!currentQuestion) {
    console.error('[GameCardRenderer] currentQuestion is null');
    return null;
  }

  // =================== DEFINITION CARD ===================
  if (gameType === 'definition' && isDefinitionQuestion(currentQuestion)) {
    return (
      <DefinitionCard
        key={`definition-${currentQuestionIndex}`}
        question={currentQuestion}
        selectedOption={states.definitionState.selectedOption}
        isValidated={states.definitionState.isValidated}
        isCorrect={states.definitionState.isCorrect}
        attemptCount={states.definitionState.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        onAnswer={handlers.definition.onAnswer}
        onValidate={handlers.definition.onValidate}
        onRetry={handlers.definition.onRetry}
        onNext={handlers.definition.onNext}
        isLastQuestion={isLastQuestion}
      />
    );
  }

  // =================== BLANKS CARD ===================
  if (gameType === 'blanks' && isBlanksQuestion(currentQuestion)) {
    return (
      <BlanksCard
        key={`blanks-${currentQuestionIndex}`}
        question={currentQuestion}
        selectedOption={states.blanksState.selectedOption}
        isValidated={states.blanksState.isValidated}
        isCorrect={states.blanksState.isCorrect}
        attemptCount={states.blanksState.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        onAnswer={handlers.blanks.onAnswer}
        onValidate={handlers.blanks.onValidate}
        onRetry={handlers.blanks.onRetry}
        onNext={handlers.blanks.onNext}
        isLastQuestion={isLastQuestion}
      />
    );
  }

  // =================== SENTENCE BUILDER CARD ===================
  if (gameType === 'sentence' && isSentenceQuestion(currentQuestion)) {
    return (
      <SyntaxMasterCard
        key={`sentence-${currentQuestionIndex}`}
        question={currentQuestion}
        selectedOrder={states.sentenceState.selectedOrder}
        isValidated={states.sentenceState.isValidated}
        isCorrect={states.sentenceState.isCorrect}
        attemptCount={states.sentenceState.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        onOrder={handlers.sentence.onOrder}
        onValidate={handlers.sentence.onValidate}
        onRetry={handlers.sentence.onRetry}
        onNext={handlers.sentence.onNext}
        isLastQuestion={isLastQuestion}
      />
    );
  }

  // =================== SPEED MATCH CARD ===================
  if (gameType === 'speed' && isSpeedMatchQuestion(currentQuestion)) {
    return (
      <SpeedMatchCard
        key={`speed-${currentQuestionIndex}`}
        game={currentQuestion}
        onComplete={handlers.speed.onComplete}
      />
    );
  }

  // =================== DETECTIVE CARD ===================
  if (gameType === 'detective' && isDetectiveQuestion(currentQuestion)) {
    return (
      <DetectiveCard
        key={`detective-${currentQuestionIndex}`}
        question={currentQuestion}
        selectedWord={states.detectiveState.selectedWord}
        isValidated={states.detectiveState.isValidated}
        isCorrect={states.detectiveState.isCorrect}
        attemptCount={states.detectiveState.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        onAnswer={handlers.detective.onAnswer}
        onValidate={handlers.detective.onValidate}
        onRetry={handlers.detective.onRetry}
        onNext={handlers.detective.onNext}
        isLastQuestion={isLastQuestion}
      />
    );
  }

  // =================== IDIOMS CARD ===================
  if (gameType === 'idioms' && isIdiomsQuestion(currentQuestion)) {
    return (
      <IdiomsCard
        key={`idioms-${currentQuestionIndex}`}
        question={currentQuestion}
        selectedOption={states.idiomsState.selectedOption}
        isValidated={states.idiomsState.isValidated}
        isCorrect={states.idiomsState.isCorrect}
        attemptCount={states.idiomsState.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        onAnswer={handlers.idioms.onAnswer}
        onValidate={handlers.idioms.onValidate}
        onRetry={handlers.idioms.onRetry}
        onNext={handlers.idioms.onNext}
        isLastQuestion={isLastQuestion}
      />
    );
  }

  // =================== FALLBACK ===================
  console.warn('[GameCardRenderer] Unknown game type:', gameType);
  return null;
};

export default GameCardRenderer;
