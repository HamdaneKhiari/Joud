/**
 * Tests unitaires — moduleConfig.ts
 * Couvre : MODULE_CONFIG, moduleHasSubfamilies
 */

import { MODULE_CONFIG, moduleHasSubfamilies } from '@/config/moduleConfig';

// ============================================
// moduleHasSubfamilies
// ============================================

describe('moduleHasSubfamilies', () => {
  // Modules AVEC sous-familles
  it('vocab → true', () => expect(moduleHasSubfamilies('vocab')).toBe(true));
  it('phrase_types → true', () => expect(moduleHasSubfamilies('phrase_types')).toBe(true));
  it('dialogues → true', () => expect(moduleHasSubfamilies('dialogues')).toBe(true));
  it('reading → true', () => expect(moduleHasSubfamilies('reading')).toBe(true));

  // Modules SANS sous-familles
  it('word_games → false', () => expect(moduleHasSubfamilies('word_games')).toBe(false));
  it('connector → false', () => expect(moduleHasSubfamilies('connector')).toBe(false));

  // Module inconnu → false (défaut)
  it('module inconnu → false', () => expect(moduleHasSubfamilies('unknown_module')).toBe(false));
  it('chaîne vide → false', () => expect(moduleHasSubfamilies('')).toBe(false));
  it('assessment → false (non configuré)', () => expect(moduleHasSubfamilies('assessment')).toBe(false));
});

// ============================================
// MODULE_CONFIG — propriété requiresSubfamilyForAllFamilies
// ============================================

describe('MODULE_CONFIG — requiresSubfamilyForAllFamilies', () => {
  it('phrase_types nécessite des subfamilies pour toutes les familles', () => {
    expect(MODULE_CONFIG['phrase_types'].requiresSubfamilyForAllFamilies).toBe(true);
  });

  it('dialogues nécessite des subfamilies pour toutes les familles', () => {
    expect(MODULE_CONFIG['dialogues'].requiresSubfamilyForAllFamilies).toBe(true);
  });

  it('vocab ne nécessite pas obligatoirement des subfamilies (certaines familles n\'en ont pas)', () => {
    expect(MODULE_CONFIG['vocab'].requiresSubfamilyForAllFamilies).toBe(false);
  });

  it('word_games n\'a pas de propriété requiresSubfamilyForAllFamilies', () => {
    expect(MODULE_CONFIG['word_games'].requiresSubfamilyForAllFamilies).toBeUndefined();
  });
});

// ============================================
// MODULE_CONFIG — cohérence globale
// ============================================

describe('MODULE_CONFIG — cohérence', () => {
  it('tous les modules configurés ont la propriété hasSubfamilies', () => {
    Object.entries(MODULE_CONFIG).forEach(([slug, config]) => {
      expect(typeof config.hasSubfamilies).toBe('boolean'),
        `${slug} doit avoir hasSubfamilies booléen`;
    });
  });

  it('aucun module inconnu dans la config', () => {
    const expectedModules = ['vocab', 'phrase_types', 'dialogues', 'reading', 'word_games', 'connector'];
    Object.keys(MODULE_CONFIG).forEach(slug => {
      expect(expectedModules).toContain(slug);
    });
  });
});
