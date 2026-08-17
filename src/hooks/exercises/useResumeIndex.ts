import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { useFirstIncompleteIndex } from './useFirstIncompleteIndex';

export const useResumeIndex = (
  levelId: number,
  exerciseType: string,
  familyId: string,
  totalItems: number
): [number, Dispatch<SetStateAction<number>>] => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const getInitialIndex = useFirstIncompleteIndex(levelId, exerciseType, familyId, totalItems);
  const initializedKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${levelId}-${exerciseType}-${familyId}`;
    if (totalItems > 0 && initializedKey.current !== key) {
      initializedKey.current = key;
      setCurrentIndex(getInitialIndex());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, levelId, exerciseType, familyId]);

  return [currentIndex, setCurrentIndex];
};

export default useResumeIndex;
