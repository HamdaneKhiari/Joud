/**
 * Navigation Helper - Gestion centralisée de la navigation
 */

import type { Router } from 'expo-router';
import type { ModuleId } from './labelMapper';

// ============================================
// TYPES
// ============================================

export interface NavigateToExerciseParams {
  type: ModuleId | string;
  levelId: number;
  familyId?: string;
  moduleId?: string;
}

// ============================================
// NAVIGATION HELPER
// ============================================

/**
 * Navigue vers un exercice spécifique avec Expo Router
 * Gère tous les types de modules (vocab, grammar, quiz, etc.)
 */
export const navigateToExercise = (
  router: Router,
  params: NavigateToExerciseParams
): void => {
  const { type, levelId, familyId, moduleId } = params;

  // CAS 1 : Évaluation (Quiz/Assessment)
  if (type === 'assessment' || type === 'quiz') {
    router.push({
      pathname: '/exercise/[exerciseId]',
      params: {
        exerciseId: 'assessment',
        levelId: levelId.toString(),
        type: 'quiz'
      }
    });
    return;
  }

  // CAS 2 : Exercice avec famille spécifique
  if (familyId) {
    router.push({
      pathname: '/exercise/[exerciseId]',
      params: {
        exerciseId: `${type}_${familyId}`,
        levelId: levelId.toString(),
        moduleId: moduleId || type,
        familyId,
        type
      }
    });
    return;
  }

  // CAS 3 : Sélection de famille (défaut)
  router.push({
    pathname: '/family/[familyId]',
    params: {
      familyId: type,
      levelId: levelId.toString(),
      moduleId: moduleId || type
    }
  });
};

/**
 * Navigue vers la sélection de familles d'un module
 */
export const navigateToFamilySelection = (
  router: Router,
  moduleId: string,
  levelId: number
): void => {
  router.push({
    pathname: '/family/[familyId]',
    params: {
      familyId: moduleId,
      levelId: levelId.toString(),
      moduleId
    }
  });
};

/**
 * Navigue vers la sélection d'exercices d'un niveau
 */
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

/**
 * Retour en arrière sécurisé
 */
export const goBack = (router: Router): void => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
};
