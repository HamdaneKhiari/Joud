/**
 * ============================================
 * GRAMMAR SCREEN - TYPES
 * Types TypeScript pour GrammarExerciseScreen
 * ============================================
 */

import type { ExerciseState, GrammarRule, GrammarFamily } from '@/types/pedagogy';

export interface GrammarScreenRouteParams {
  familyId: string;
  moduleId: string;
  levelId?: number;
  subfamilyId?: number;
}

// Re-export types centraux pour compatibilité
export type { ExerciseState, GrammarRule, GrammarFamily };
