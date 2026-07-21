import type { Router } from 'expo-router';

export interface NavigateToExerciseParams {
  type: string; // slug du module, ex: 'vocab', 'phrase_types'
  levelId: number;
  moduleId?: string;
}

// Navigue vers l'écran qui liste les thèmes (familles) d'un module
export const navigateToExercise = (
  router: Router,
  params: NavigateToExerciseParams
): void => {
  const { type, levelId, moduleId } = params;

  router.push({
    pathname: '/family/[familyId]',
    params: {
      familyId: type,
      levelId: levelId.toString(),
      moduleId: moduleId || type
    }
  });
};

export const navigateToExerciseSelection = (
  router: Router,
  levelId: number
): void => {
  router.push({
    pathname: '/level/[levelId]',
    params: {
      levelId: levelId.toString()
    }
  });
};