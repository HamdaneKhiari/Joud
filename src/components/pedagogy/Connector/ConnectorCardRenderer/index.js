// ============================================
// FICHIER: src/components/pedagogy/connector/ConnectorCardRenderer/index.js
// Renderer pour les 3 types d'exercices Connector
// ============================================

import PropTypes from 'prop-types';
import { log } from '../../../../utils/logUtils';
import LogicLinksCard from '../LogicLinksCard';
import SentenceFusionCard from '../SentenceFusionCard';
import RephrasingCard from '../RephrasingCard';

const MAX_ATTEMPTS = 2;

const ConnectorCardRenderer = ({
  exerciseType,
  currentQuestion,
  currentQuestionIndex,
  isLastQuestion,
  exerciseFamily,
  states,
  handlers,
}) => {
  if (!currentQuestion) {
    log.error('ConnectorCardRenderer: currentQuestion is null');
    return null;
  }

  switch (exerciseType) {
    case 'logic':
      return (
        <LogicLinksCard
          key={`logic-${currentQuestionIndex}`}
          question={currentQuestion}
          selectedOption={states.logicState.selectedOption}
          isValidated={states.logicState.isValidated}
          isCorrect={states.logicState.isCorrect}
          attemptCount={states.logicState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          {...handlers.logic}
          isLastQuestion={isLastQuestion}
          color={exerciseFamily.color}
        />
      );

    case 'fusion':
      return (
        <SentenceFusionCard
          key={`fusion-${currentQuestionIndex}`}
          question={currentQuestion}
          userAnswer={states.fusionState.userAnswer}
          isValidated={states.fusionState.isValidated}
          isCorrect={states.fusionState.isCorrect}
          attemptCount={states.fusionState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          {...handlers.fusion}
          isLastQuestion={isLastQuestion}
          color={exerciseFamily.color}
        />
      );

    case 'rephrasing':
      return (
        <RephrasingCard
          key={`rephrasing-${currentQuestionIndex}`}
          question={currentQuestion}
          userAnswer={states.rephrasingState.userAnswer}
          isValidated={states.rephrasingState.isValidated}
          isCorrect={states.rephrasingState.isCorrect}
          attemptCount={states.rephrasingState.attemptCount}
          maxAttempts={MAX_ATTEMPTS}
          {...handlers.rephrasing}
          isLastQuestion={isLastQuestion}
          color={exerciseFamily.color}
        />
      );

    default:
      log.warn('ConnectorCardRenderer: Unknown exercise type:', exerciseType);
      return null;
  }
};

const handlerShape = PropTypes.shape({
  onAnswer: PropTypes.func,
  onValidate: PropTypes.func,
  onRetry: PropTypes.func,
  onNext: PropTypes.func,
});

ConnectorCardRenderer.propTypes = {
  exerciseType: PropTypes.oneOf(['logic', 'fusion', 'rephrasing']).isRequired,
  currentQuestion: PropTypes.object.isRequired,
  currentQuestionIndex: PropTypes.number.isRequired,
  isLastQuestion: PropTypes.bool.isRequired,
  exerciseFamily: PropTypes.shape({
    color: PropTypes.string,
  }).isRequired,
  states: PropTypes.shape({
    logicState: PropTypes.shape({
      selectedOption: PropTypes.string,
      isValidated: PropTypes.bool,
      isCorrect: PropTypes.bool,
      attemptCount: PropTypes.number,
    }),
    fusionState: PropTypes.shape({
      userAnswer: PropTypes.string,
      isValidated: PropTypes.bool,
      isCorrect: PropTypes.bool,
      attemptCount: PropTypes.number,
    }),
    rephrasingState: PropTypes.shape({
      userAnswer: PropTypes.string,
      isValidated: PropTypes.bool,
      isCorrect: PropTypes.bool,
      attemptCount: PropTypes.number,
    }),
  }).isRequired,
  handlers: PropTypes.shape({
    logic: handlerShape,
    fusion: handlerShape,
    rephrasing: handlerShape,
  }).isRequired,
};

export default ConnectorCardRenderer;
