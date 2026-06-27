/**
 * Tests unitaires — navigationHelper.ts
 * Couvre : navigateToExercise, navigateToFamilySelection,
 *          navigateToExerciseSelection, goBack
 */

import {
  navigateToExercise,
  navigateToFamilySelection,
  navigateToExerciseSelection,
  goBack,
} from '@/utils/navigationHelper';
import type { Router } from 'expo-router';

// ============================================
// Mock Router
// ============================================

const makeRouter = (canGoBack = true): Router =>
  ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(canGoBack),
  } as unknown as Router);

// ============================================
// navigateToExercise — avec familyId
// ============================================

describe('navigateToExercise — avec familyId', () => {
  it('appelle router.push avec le bon pathname et params', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'vocab', levelId: 1, familyId: '5' });

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/exercise/[exerciseId]',
      params: expect.objectContaining({
        exerciseId: 'vocab_5',
        levelId: '1',
        familyId: '5',
        type: 'vocab',
      }),
    });
  });

  it('utilise moduleId fourni comme moduleId dans les params', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'vocab', levelId: 2, familyId: '8', moduleId: 'vocab' });

    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ moduleId: 'vocab' }),
    }));
  });

  it('utilise type comme moduleId si moduleId non fourni', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'reading', levelId: 1, familyId: '3' });

    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ moduleId: 'reading' }),
    }));
  });
});

// ============================================
// navigateToExercise — sans familyId
// ============================================

describe('navigateToExercise — sans familyId (sélection de famille)', () => {
  it('navigue vers /family/[familyId]', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'phrase_types', levelId: 3 });

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/family/[familyId]',
      params: expect.objectContaining({
        familyId: 'phrase_types',
        levelId: '3',
      }),
    });
  });

  it('levelId est converti en string', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'reading', levelId: 2 });

    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ levelId: '2' }),
    }));
  });
});

// ============================================
// navigateToFamilySelection
// ============================================

describe('navigateToFamilySelection', () => {
  it('navigue vers /family/[familyId] avec le moduleId', () => {
    const router = makeRouter();
    navigateToFamilySelection(router, 'dialogues', 1);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/family/[familyId]',
      params: {
        familyId: 'dialogues',
        levelId: '1',
        moduleId: 'dialogues',
      },
    });
  });

  it('levelId est converti en string', () => {
    const router = makeRouter();
    navigateToFamilySelection(router, 'connector', 4);

    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ levelId: '4' }),
    }));
  });
});

// ============================================
// navigateToExerciseSelection
// ============================================

describe('navigateToExerciseSelection', () => {
  it('navigue vers /level/[levelId]', () => {
    const router = makeRouter();
    navigateToExerciseSelection(router, 2);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/level/[levelId]',
      params: { levelId: '2' },
    });
  });

  it('levelId 1 → params.levelId "1"', () => {
    const router = makeRouter();
    navigateToExerciseSelection(router, 1);

    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({ params: { levelId: '1' } })
    );
  });
});

// ============================================
// goBack
// ============================================

describe('goBack', () => {
  it('appelle router.back() si canGoBack est true', () => {
    const router = makeRouter(true);
    goBack(router);
    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('appelle router.replace("/") si canGoBack est false', () => {
    const router = makeRouter(false);
    goBack(router);
    expect(router.replace).toHaveBeenCalledWith('/');
    expect(router.back).not.toHaveBeenCalled();
  });
});
