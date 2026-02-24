/**
 * Navigation Helper - Gestion centralisée de la navigation
 * Version corrigée : Utilise des Slugs (string) au lieu de ModuleId
 */

import type { Router } from 'expo-router';

// ============================================
// TYPES
// ============================================

export interface NavigateToExerciseParams {
  // type est maintenant un string (ex: 'vocab', 'phrase_types')
  type: string; 
  levelId: number;
  familyId?: string;
  moduleId?: string;
}

// ============================================
// NAVIGATION HELPER
// ============================================

/**
 * Navigue vers un exercice spécifique (Écran final d'exercice)
 */
export const navigateToExercise = (
  router: Router,
  params: NavigateToExerciseParams
): void => {
  const { type, levelId, familyId, moduleId } = params;

  // CAS 1 : Exercice avec famille spécifique (ex: un exercice de vocabulaire précis)
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

  // CAS 3 : Sélection de famille (L'écran qui liste les thèmes d'un module)
  router.push({
    pathname: '/family/[familyId]',
    params: {
      familyId: type, // Ici type est le slug comme 'phrase_types'
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
      familyId: moduleId, // moduleId est le slug
      levelId: levelId.toString(),
      moduleId
    }
  });
};

/**
 * Navigue vers la sélection d'exercices (modules) d'un niveau
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