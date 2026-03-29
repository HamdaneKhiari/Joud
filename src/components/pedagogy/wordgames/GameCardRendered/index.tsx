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
import AudioMatchCard from '../AudioMatchCard';
import ReplyCard from '../ReplyCard';
import TransformerCard from '../TransformerCard';

// Types & Type Guards
import type { GameQuestion, GameType } from '@/screens/WordGames/schema';
import {
  isDefinitionQuestion,
  isBlanksQuestion,
  isSentenceQuestion,
  isSpeedMatchQuestion,
  isDetectiveQuestion,
  isAudioMatchQuestion,
  isReplyQuestion,
  isTransformerQuestion,
} from '@/screens/WordGames/schema';

// Hooks
import type { UseGameStateReturn } from '@/screens/WordGames/hooks/useGameState';
import type { UseGameHandlersReturn } from '@/screens/WordGames/hooks/useGameHandlers';
import type { Family } from '@/database/schema';
import { log } from '@/utils/logUtils';

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
  gameFamily: _gameFamily,
  states,
  handlers,
}) => {
  if (!currentQuestion) {
    log.error('[GameCardRenderer] currentQuestion is null');
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

  // =================== AUDIO MATCH CARD ===================
  if (gameType === 'audio_match' && isAudioMatchQuestion(currentQuestion)) {
    return (
      <AudioMatchCard
        key={`audio_match-${currentQuestionIndex}`}
        game={currentQuestion}
        onComplete={handlers.audio_match.onComplete}
      />
    );
  }

  // =================== REPLY CARD ===================
  if (gameType === 'reply' && isReplyQuestion(currentQuestion)) {
    return (
      <ReplyCard
        key={`reply-${currentQuestionIndex}`}
        question={currentQuestion}
        selectedOption={states.replyState.selectedOption}
        isValidated={states.replyState.isValidated}
        isCorrect={states.replyState.isCorrect}
        attemptCount={states.replyState.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        onAnswer={handlers.reply.onAnswer}
        onValidate={handlers.reply.onValidate}
        onRetry={handlers.reply.onRetry}
        onNext={handlers.reply.onNext}
        isLastQuestion={isLastQuestion}
      />
    );
  }

  // =================== TRANSFORMER CARD ===================
  if (gameType === 'transformer' && isTransformerQuestion(currentQuestion)) {
    return (
      <TransformerCard
        key={`transformer-${currentQuestionIndex}`}
        question={currentQuestion}
        selectedOption={states.transformerState.selectedOption}
        isValidated={states.transformerState.isValidated}
        isCorrect={states.transformerState.isCorrect}
        attemptCount={states.transformerState.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        onAnswer={handlers.transformer.onAnswer}
        onValidate={handlers.transformer.onValidate}
        onRetry={handlers.transformer.onRetry}
        onNext={handlers.transformer.onNext}
        isLastQuestion={isLastQuestion}
      />
    );
  }

  // =================== FALLBACK ===================
  log.warn('[GameCardRenderer] Unknown game type:', gameType);
  return null;
};

export default GameCardRenderer;
