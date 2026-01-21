import React from 'react';
import { log } from '../../../../utils/logUtils';
import LogicLinksCard from '../LogicLinksCard';
import SentenceFusionCard from '../SentenceFusionCard';
import RephrasingCard from '../RephrasingCard';
import { 
  ConnectorCardRendererProps, 
  LogicQuestion, 
  FusionQuestion, 
  RephrasingQuestion 
} from '../types';

const MAX_ATTEMPTS = 2;

const ConnectorCardRenderer: React.FC<ConnectorCardRendererProps> = ({
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
          question={currentQuestion as LogicQuestion}
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
          question={currentQuestion as FusionQuestion}
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
          question={currentQuestion as RephrasingQuestion}
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

export default ConnectorCardRenderer;