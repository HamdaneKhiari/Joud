import { useCallback, useState } from 'react';
import { useProgress } from '@/contexts/ProgressContext';

export const useExerciseCompletion = () => {
  const { saveProgressNow } = useProgress();
  const [showCompletion, setShowCompletion] = useState(false);

  const complete = useCallback(() => {
    return saveProgressNow().then(() => setShowCompletion(true));
  }, [saveProgressNow]);

  return { showCompletion, complete };
};

export default useExerciseCompletion;
