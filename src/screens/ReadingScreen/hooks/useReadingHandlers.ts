import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { ReadingQuestionData } from '../../../components/pedagogy/reading/types';

interface UseReadingHandlersProps {
  question: ReadingQuestionData;
  isLastQuestion: boolean;
  onNavigateBack: () => void;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  state: any; // ReadingState
  setState: any;
  resetState: () => void;
  onValidationSuccess: () => void;
}

export const useReadingHandlers = ({
  question,
  isLastQuestion,
  onNavigateBack,
  setCurrentQuestionIndex,
  state,
  setState,
  resetState,
  onValidationSuccess,
}: UseReadingHandlersProps) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlayAudio = useCallback(async (audioSource: string) => {
    try {
      if (state.isPlaying) {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setState((prev: any) => ({ ...prev, isPlaying: false }));
        return;
      }

      setState((prev: any) => ({ ...prev, isPlaying: true }));
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioSource },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setState((prev: any) => ({ ...prev, isPlaying: false }));
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setState((prev: any) => ({ ...prev, isPlaying: false }));
    }
  }, [state.isPlaying, setState]);

  const handleAnswer = useCallback((option: string) => {
    if (state.isValidated) return;
    setState((prev: any) => ({ ...prev, selectedOption: option }));
  }, [state.isValidated, setState]);

  const handleValidate = useCallback(() => {
    if (!state.selectedOption) return;
    
    const correctLetter = String.fromCharCode(65 + question.correctAnswer);
    const isCorrect = state.selectedOption === correctLetter;

    setState((prev: any) => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: prev.attemptCount + 1
    }));

    if (isCorrect) onValidationSuccess();
  }, [state.selectedOption, question, setState, onValidationSuccess]);

  const handleNext = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (isLastQuestion) {
      onNavigateBack();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetState();
    }
  }, [isLastQuestion, onNavigateBack, setCurrentQuestionIndex, resetState]);

  const handleRetry = useCallback(() => {
    setState((prev: any) => ({
      ...prev,
      selectedOption: undefined,
      isValidated: false,
      isCorrect: false
    }));
  }, [setState]);

  return {
    onPlayAudio: handlePlayAudio,
    onAnswer: handleAnswer,
    onValidate: handleValidate,
    onNext: handleNext,
    onRetry: handleRetry
  };
};