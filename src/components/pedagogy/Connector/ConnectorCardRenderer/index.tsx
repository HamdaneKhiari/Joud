import React from 'react';
import { log } from '../../../../utils/logUtils';
import LogicLinksCard from '../LogicLinksCard';
import SentenceFusionCard from '../SentenceFusionCard';
import RephrasingCard from '../RephrasingCard';
import { useTheme } from '@/themes/ThemeContext'; // ✅ Ajouté pour le fallback couleur
import { 
  ConnectorCardRendererProps, 
  LogicQuestion, 
  FusionQuestion, 
  RephrasingQuestion 
} from '../types';

const MAX_ATTEMPTS = 2;

const ConnectorCardRenderer: React.FC<ConnectorCardRendererProps & { hideValidation?: boolean; scrollEnabled?: boolean }> = ({
  exerciseType,
  currentQuestion,
  currentQuestionIndex,
  isLastQuestion,
  exerciseFamily,
  states,
  handlers,
  hideValidation = false,
  scrollEnabled = true,
}) => {
  const { identity } = useTheme(); // ✅ Récupération du thème

  if (!currentQuestion) {
    log.error('ConnectorCardRenderer: currentQuestion is null');
    return null;
  }

  // ✅ Fallback : si la famille n'a pas de couleur, on prend la couleur principale de l'identité
  const displayColor = exerciseFamily?.color || identity.palette.primary;

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
          color={displayColor}
          hideValidation={hideValidation}
          scrollEnabled={scrollEnabled}
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
          color={displayColor}
          hideValidation={hideValidation}
          scrollEnabled={scrollEnabled}
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
          color={displayColor}
          hideValidation={hideValidation}
          scrollEnabled={scrollEnabled}
        />
      );

    default:
      log.warn('ConnectorCardRenderer: Unknown exercise type:', exerciseType);
      return null;
  }
};

export default ConnectorCardRenderer;