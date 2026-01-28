// src/components/pedagogy/wordgames/GameCardRenderer.js
import PropTypes from 'prop-types';
import { log } from '../../../../utils/logUtils';
import DefinitionCard from '../DefinitionCard';
import BlanksCard from '../BlanksCard';
import SyntaxMasterCard from '../SyntaxMasterCard';
import SpeedMatchCard from '../SpeedMatchCard';
import DetectiveCard from '../DetectiveCard';
import IdiomsCard from '../IdiomsCard';

const MAX_ATTEMPTS = 2;

const GameCardRenderer = ({
  gameType,
  currentQuestion,
  currentQuestionIndex,
  isLastQuestion,
  gameFamily,
  states,
  handlers,
}) => {
  if (!currentQuestion) {
    log.error('GameCardRenderer: currentQuestion is null');
    return null;
  }

  switch (gameType) {
    case 'definition':
      return (
        <DefinitionCard
          key={`definition-${currentQuestionIndex}`}
          question={currentQuestion}
          selectedOption={states.definitionState.selectedOption}
          isValidated={states.definitionState.isValidated}
          isCorrect={states.definitionState.isCorrect}
          attemptCount={states.definitionState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          {...handlers.definition}
          isLastQuestion={isLastQuestion}
          color={gameFamily.color}
        />
      );

    case 'blanks':
      return (
        <BlanksCard
          key={`blanks-${currentQuestionIndex}`}
          question={currentQuestion}
          selectedOption={states.blanksState.selectedOption}
          isValidated={states.blanksState.isValidated}
          isCorrect={states.blanksState.isCorrect}
          attemptCount={states.blanksState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          {...handlers.blanks}
          isLastQuestion={isLastQuestion}
          color={gameFamily.color}
        />
      );

    case 'sentence':
      return (
        <SyntaxMasterCard
          key={`sentence-${currentQuestionIndex}`}
          question={currentQuestion}
          selectedOrder={states.sentenceState.selectedOrder}
          isValidated={states.sentenceState.isValidated}
          isCorrect={states.sentenceState.isCorrect}
          attemptCount={states.sentenceState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          {...handlers.sentence}
          isLastQuestion={isLastQuestion}
          color={gameFamily.color}
        />
      );

    case 'speed':
      return (
        <SpeedMatchCard
          key={`speed-${currentQuestionIndex}`}
          game={currentQuestion}
          color={gameFamily.color}
          {...handlers.speed}
        />
      );

    case 'detective':
      return (
        <DetectiveCard
          key={`detective-${currentQuestionIndex}`}
          question={currentQuestion}
          selectedWord={states.detectiveState.selectedWord}
          isValidated={states.detectiveState.isValidated}
          isCorrect={states.detectiveState.isCorrect}
          attemptCount={states.detectiveState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          {...handlers.detective}
          isLastQuestion={isLastQuestion}
          color={gameFamily.color}
        />
      );

    case 'idioms':
      return (
        <IdiomsCard
          key={`idioms-${currentQuestionIndex}`}
          question={currentQuestion}
          selectedOption={states.idiomsState.selectedOption}
          isValidated={states.idiomsState.isValidated}
          isCorrect={states.idiomsState.isCorrect}
          attemptCount={states.idiomsState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          {...handlers.idioms}
          isLastQuestion={isLastQuestion}
          color={gameFamily.color}
        />
      );

    default:
      log.warn('GameCardRenderer: Unknown game type:', gameType);
      return null;
  }
};

// PropTypes Handler (réutilisable)
const handlerShape = PropTypes.shape({
  onAnswer: PropTypes.func,
  onValidate: PropTypes.func,
  onRetry: PropTypes.func,
  onNext: PropTypes.func,
  onOrder: PropTypes.func,
  onComplete: PropTypes.func,
});

GameCardRenderer.propTypes = {
  gameType: PropTypes.oneOf(['definition', 'blanks', 'sentence', 'speed', 'detective', 'idioms']).isRequired,
  currentQuestion: PropTypes.shape({
    image: PropTypes.string,
    word: PropTypes.string,
    hint: PropTypes.string,
    correct: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    definition: PropTypes.string,
    options: PropTypes.array,
    correctAnswer: PropTypes.string,
  }).isRequired,
  currentQuestionIndex: PropTypes.number.isRequired,
  isLastQuestion: PropTypes.bool.isRequired,
  gameFamily: PropTypes.shape({
    color: PropTypes.string,
  }).isRequired,
  states: PropTypes.shape({
    definitionState: PropTypes.shape({
      selectedOption: PropTypes.string,
      isValidated: PropTypes.bool,
      isCorrect: PropTypes.bool,
      attemptCount: PropTypes.number,
    }),
    blanksState: PropTypes.shape({
      selectedOption: PropTypes.string,
      isValidated: PropTypes.bool,
      isCorrect: PropTypes.bool,
      attemptCount: PropTypes.number,
    }),
    sentenceState: PropTypes.shape({
      selectedOrder: PropTypes.arrayOf(PropTypes.string),
      isValidated: PropTypes.bool,
      isCorrect: PropTypes.bool,
      attemptCount: PropTypes.number,
    }),
    idiomsState: PropTypes.shape({
      selectedOption: PropTypes.string,
      isValidated: PropTypes.bool,
      isCorrect: PropTypes.bool,
      attemptCount: PropTypes.number,
    }),
    detectiveState: PropTypes.shape({
      selectedWord: PropTypes.number,
      isValidated: PropTypes.bool,
      isCorrect: PropTypes.bool,
      attemptCount: PropTypes.number,
    }),
  }).isRequired,
  handlers: PropTypes.shape({
    definition: handlerShape,
    blanks: handlerShape,
    sentence: handlerShape,
    speed: handlerShape,
    detective: handlerShape,
    idioms: handlerShape,
  }).isRequired,
};

export default GameCardRenderer;