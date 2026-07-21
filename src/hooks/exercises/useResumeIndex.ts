import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useFirstIncompleteIndex } from './useFirstIncompleteIndex';

export const useResumeIndex = (
  levelId: number,
  exerciseType: string,
  familyId: string,
  totalItems: number
): [number, Dispatch<SetStateAction<number>>] => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const getInitialIndex = useFirstIncompleteIndex(levelId, exerciseType, familyId, totalItems);

  useEffect(() => {
    if (totalItems > 0) {
      setCurrentIndex(getInitialIndex());
    }
  }, [totalItems, getInitialIndex]);

  return [currentIndex, setCurrentIndex];
};

export default useResumeIndex;
