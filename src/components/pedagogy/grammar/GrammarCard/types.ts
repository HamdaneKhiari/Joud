/**
 * ============================================
 * GRAMMAR CARD - TYPES
 * Types TypeScript pour le composant GrammarCard
 * ============================================
 */

import type { LessonData, ExerciseState } from '@/types/pedagogy';

export interface GrammarCardProps {
  lessonData: LessonData;
  exerciseState: ExerciseState;
  onAnswer: (option: string) => void;
  onAudioPress?: () => void;
}
