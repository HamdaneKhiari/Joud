/**
 * Tests unitaires — familySelectionHelper.ts
 * Couvre : enrichFamiliesWithProgress (fonction pure)
 * Note : getCompletedWordsForLevel et saveFamilyProgress sont testés dans les tests d'intégration
 *        car ils nécessitent AsyncStorage
 */

import { enrichFamiliesWithProgress } from '@/utils/familySelection/familySelectionHelper';

// ============================================
// enrichFamiliesWithProgress
// ============================================

describe('enrichFamiliesWithProgress', () => {
  const makeFamily = (id: string, words: string[], totalWords?: number) => ({
    id,
    name: `Family ${id}`,
    words,
    totalWords,
  });

  it('retourne un tableau vide pour une liste de familles vide', () => {
    expect(enrichFamiliesWithProgress([], new Set())).toEqual([]);
  });

  it('progress = 0 si aucun mot complété', () => {
    const family = makeFamily('1', ['word1', 'word2', 'word3']);
    const [result] = enrichFamiliesWithProgress([family], new Set());
    expect(result.progress).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.badge).toBeNull();
  });

  it('progress = 100 si tous les mots complétés', () => {
    const family = makeFamily('1', ['word1', 'word2']);
    const completedWords = new Set(['word1', 'word2']);
    const [result] = enrichFamiliesWithProgress([family], completedWords);
    expect(result.progress).toBe(100);
    expect(result.completed).toBe(2);
  });

  it('progress = 50 si la moitié des mots complétés', () => {
    const family = makeFamily('1', ['w1', 'w2', 'w3', 'w4']);
    const completedWords = new Set(['w1', 'w2']);
    const [result] = enrichFamiliesWithProgress([family], completedWords);
    expect(result.progress).toBe(50);
    expect(result.completed).toBe(2);
  });

  it('progress arrondi (33%)', () => {
    const family = makeFamily('1', ['w1', 'w2', 'w3']);
    const completedWords = new Set(['w1']);
    const [result] = enrichFamiliesWithProgress([family], completedWords);
    expect(result.progress).toBe(33);
  });

  // Badges
  it('badge = null si progress = 0', () => {
    const family = makeFamily('1', ['w1']);
    const [result] = enrichFamiliesWithProgress([family], new Set());
    expect(result.badge).toBeNull();
  });

  it('badge = "NOUVEAU" si progress entre 1% et 29%', () => {
    const family = makeFamily('1', ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10']);
    const completedWords = new Set(['w1']); // 10%
    const [result] = enrichFamiliesWithProgress([family], completedWords);
    expect(result.badge).toBe('NOUVEAU');
  });

  it('badge = "🥉 BRONZE" si progress entre 30% et 69%', () => {
    const words = Array.from({ length: 10 }, (_, i) => `w${i}`);
    const family = makeFamily('1', words);
    const completedWords = new Set(words.slice(0, 5)); // 50%
    const [result] = enrichFamiliesWithProgress([family], completedWords);
    expect(result.badge).toBe('🥉 BRONZE');
  });

  it('badge = "🥈 ARGENT" si progress entre 70% et 99%', () => {
    const words = Array.from({ length: 10 }, (_, i) => `w${i}`);
    const family = makeFamily('1', words);
    const completedWords = new Set(words.slice(0, 8)); // 80%
    const [result] = enrichFamiliesWithProgress([family], completedWords);
    expect(result.badge).toBe('🥈 ARGENT');
  });

  it('badge = "⭐ OR" si progress = 100%', () => {
    const words = ['w1', 'w2', 'w3'];
    const family = makeFamily('1', words);
    const completedWords = new Set(words);
    const [result] = enrichFamiliesWithProgress([family], completedWords);
    expect(result.badge).toBe('⭐ OR');
  });

  // Famille sans mots
  it('progress = 0 si la famille n\'a pas de mots', () => {
    const family = makeFamily('1', []);
    const [result] = enrichFamiliesWithProgress([family], new Set(['w1']));
    expect(result.progress).toBe(0);
  });

  it('utilise totalWords si défini plutôt que words.length', () => {
    const family = makeFamily('1', ['w1', 'w2'], 10); // totalWords = 10 mais words.length = 2
    const completedWords = new Set(['w1']); // 1 complété / 10 total → 10%
    const [result] = enrichFamiliesWithProgress([family], completedWords);
    expect(result.progress).toBe(10);
  });

  // Préservation des propriétés originales
  it('préserve les propriétés originales de la famille', () => {
    const family = { id: '42', name: 'Test', icon: '🍎', color: '#FF0000', words: ['w1'] };
    const [result] = enrichFamiliesWithProgress([family], new Set());
    expect(result.id).toBe('42');
    expect(result.name).toBe('Test');
    expect(result.icon).toBe('🍎');
    expect(result.color).toBe('#FF0000');
  });

  // Plusieurs familles
  it('traite plusieurs familles indépendamment', () => {
    const families = [
      makeFamily('1', ['a', 'b', 'c', 'd']),
      makeFamily('2', ['e', 'f']),
      makeFamily('3', ['g']),
    ];
    const completed = new Set(['a', 'b', 'e', 'f']);
    const results = enrichFamiliesWithProgress(families, completed);
    expect(results[0].progress).toBe(50); // 2/4
    expect(results[1].progress).toBe(100); // 2/2
    expect(results[2].progress).toBe(0);  // 0/1
  });
});
