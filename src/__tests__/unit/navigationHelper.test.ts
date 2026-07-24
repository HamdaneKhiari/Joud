/**
 * Tests unitaires — navigationHelper.ts
 * Couvre : navigateToExercise, navigateToExerciseSelection
 */

import {
  navigateToExercise,
  navigateToExerciseSelection,
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
// navigateToExercise
// ============================================

describe('navigateToExercise', () => {
  it('navigue vers /family/[familyId] avec le bon pathname et params', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'vocab', levelId: 1 });

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/family/[familyId]',
      params: {
        familyId: 'vocab',
        levelId: '1',
        moduleId: 'vocab',
      },
    });
  });

  it('utilise moduleId fourni comme moduleId dans les params', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'vocab', levelId: 2, moduleId: 'connector' });

    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ moduleId: 'connector' }),
    }));
  });

  it('utilise type comme moduleId si moduleId non fourni', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'reading', levelId: 1 });

    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ moduleId: 'reading' }),
    }));
  });

  it('levelId est converti en string', () => {
    const router = makeRouter();
    navigateToExercise(router, { type: 'reading', levelId: 2 });

    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ levelId: '2' }),
    }));
  });

  it('familyId dans les params correspond au type', () => {
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
