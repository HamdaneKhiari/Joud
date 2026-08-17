/**
 * Tests de composants — ExerciseValidation/helpers.ts
 * Couvre : getButtonConfig, getDefaultFeedback (fonctions pures)
 */

import { getButtonConfig, getDefaultFeedback } from '@/components/common/ExerciseValidation/helpers';
import type { ValidationState } from '@/components/common/ExerciseValidation/types';

// ============================================
// getButtonConfig
// ============================================

describe('getButtonConfig', () => {
  const styles = {
    buttonInitial: { backgroundColor: 'blue' },
    buttonCorrect: { backgroundColor: 'green' },
    buttonIncorrect: { backgroundColor: 'red' },
    buttonSkip: { backgroundColor: 'orange' },
  };

  // ─── État initial ───────────────────────────────────────────────────────────

  it('initial → icon checkmark-circle, label "Valider"', () => {
    const config = getButtonConfig('initial', false, false, styles);
    expect(config.icon).toBe('checkmark-circle');
    expect(config.label).toBe('Valider');
    expect(config.style).toBe(styles.buttonInitial);
  });

  // ─── État correct ───────────────────────────────────────────────────────────

  it('correct + pas dernière question → "Continuer"', () => {
    const config = getButtonConfig('correct', false, false, styles);
    expect(config.icon).toBe('arrow-forward-circle');
    expect(config.label).toBe('Continuer');
    expect(config.style).toBe(styles.buttonCorrect);
  });

  it('correct + dernière question → "Terminer"', () => {
    const config = getButtonConfig('correct', true, false, styles);
    expect(config.icon).toBe('checkmark-done-circle');
    expect(config.label).toBe('Terminer');
  });

  // ─── État incorrect ─────────────────────────────────────────────────────────

  it('incorrect → icon refresh-circle, label "Réessayer"', () => {
    const config = getButtonConfig('incorrect', false, false, styles);
    expect(config.icon).toBe('refresh-circle');
    expect(config.label).toBe('Réessayer');
    expect(config.style).toBe(styles.buttonIncorrect);
  });

  // ─── État skip ──────────────────────────────────────────────────────────────

  it('skip → label "Continuer"', () => {
    const config = getButtonConfig('skip', false, true, styles);
    expect(config.label).toBe('Continuer');
    expect(config.style).toBe(styles.buttonSkip);
  });

  // ─── Fallback ───────────────────────────────────────────────────────────────

  it('état inconnu → fallback sur initial', () => {
    const config = getButtonConfig('unknown' as ValidationState, false, false, styles);
    expect(config.icon).toBe('checkmark-circle');
    expect(config.label).toBe('Valider');
  });
});

// ============================================
// getDefaultFeedback
// ============================================

describe('getDefaultFeedback', () => {
  // ─── showFeedback = false ────────────────────────────────────────────────────

  it('retourne null si showFeedback est false', () => {
    expect(getDefaultFeedback('correct', false, null, false, null, 0)).toBeNull();
    expect(getDefaultFeedback('incorrect', false, null, false, null, 0)).toBeNull();
  });

  // ─── Feedback personnalisé prioritaire ──────────────────────────────────────

  it('retourne le feedback custom s\'il est fourni', () => {
    const custom = { title: 'Custom', message: 'Mon message' };
    const result = getDefaultFeedback('correct', true, custom, false, null, 0);
    expect(result).toBe(custom);
  });

  // ─── Feedback correct ────────────────────────────────────────────────────────

  it('correct → title "CORRECT"', () => {
    const result = getDefaultFeedback('correct', true, null, false, null, 0);
    expect(result?.title).toBe('CORRECT');
    expect(result?.message).toBeTruthy();
  });

  // ─── Feedback skip ────────────────────────────────────────────────────────

  it('skip + correctAnswer → message contient la bonne réponse', () => {
    const result = getDefaultFeedback('skip', true, null, true, 'house', 2);
    expect(result?.title).toBe('RÉPONSE');
    expect(result?.message).toContain('house');
  });

  it('skip sans correctAnswer → message générique', () => {
    const result = getDefaultFeedback('skip', true, null, true, null, 2);
    expect(result?.title).toBe('RÉPONSE');
    expect(result?.message).not.toContain('undefined');
    expect(result?.message).not.toContain('null');
  });

  // ─── Feedback incorrect ──────────────────────────────────────────────────────

  it('incorrect + attemptCount=0 → premier essai raté', () => {
    const result = getDefaultFeedback('incorrect', true, null, false, null, 0);
    expect(result?.title).toBe('ESSAIE ENCORE');
  });

  it('incorrect + attemptCount=1 → dernier essai', () => {
    const result = getDefaultFeedback('incorrect', true, null, false, null, 1);
    expect(result?.title).toBe('DERNIER ESSAI');
  });

  // ─── État initial ─────────────────────────────────────────────────────────────

  it('initial → retourne null (pas de feedback visible)', () => {
    const result = getDefaultFeedback('initial', true, null, false, null, 0);
    expect(result).toBeNull();
  });

  // ─── Retourne toujours un objet avec title et message (sauf null) ─────────────

  const validStates: ValidationState[] = ['correct', 'incorrect', 'skip'];
  validStates.forEach(state => {
    it(`state="${state}" → objet { title, message } non vide`, () => {
      const result = getDefaultFeedback(state, true, null, state === 'skip', 'answer', 1);
      expect(result).not.toBeNull();
      expect(result?.title).toBeTruthy();
      expect(result?.message).toBeTruthy();
    });
  });
});
