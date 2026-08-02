/**
 * Tests unitaires — phraseUtils
 * Couvre : getExpectedPhraseEn, cleanPhrase, tokenizePhraseForTiles, shuffleTiles
 */

import {
  getExpectedPhraseEn,
  cleanPhrase,
  tokenizePhraseForTiles,
  shuffleTiles,
} from '@/utils/phraseUtils';

// ============================================
// getExpectedPhraseEn
// ============================================

describe('getExpectedPhraseEn', () => {
  it('retourne phrase_en directement quand fourni', () => {
    expect(getExpectedPhraseEn({ phrase_en: 'I like coffee.' })).toBe('I like coffee.');
  });

  it('phrase_en prioritaire même si sentence/correctAnswer sont aussi fournis', () => {
    const result = getExpectedPhraseEn({
      phrase_en: 'I like coffee.', sentence: 'I ___ coffee.', correctAnswer: 'like',
    });
    expect(result).toBe('I like coffee.');
  });

  it('reconstitue depuis sentence + correctAnswer (mode blanks)', () => {
    const result = getExpectedPhraseEn({ sentence: 'I ___ coffee.', correctAnswer: 'like' });
    expect(result).toBe('I like coffee.');
  });

  it('reconstitue depuis sentence + correct_answer (snake_case)', () => {
    const result = getExpectedPhraseEn({ sentence: 'I ___ coffee.', correct_answer: 'like' });
    expect(result).toBe('I like coffee.');
  });

  it('correctAnswer prioritaire sur correct_answer si les deux sont fournis', () => {
    const result = getExpectedPhraseEn({
      sentence: 'I ___ coffee.', correctAnswer: 'like', correct_answer: 'love',
    });
    expect(result).toBe('I like coffee.');
  });

  it('remplace tous les ___ (plusieurs trous)', () => {
    const result = getExpectedPhraseEn({ sentence: '___ like ___.', correctAnswer: 'I' });
    expect(result).toBe('I like I.');
  });

  it('aucune donnée exploitable → chaîne vide', () => {
    expect(getExpectedPhraseEn({})).toBe('');
  });

  it('sentence sans correctAnswer ni correct_answer → chaîne vide', () => {
    expect(getExpectedPhraseEn({ sentence: 'I ___ coffee.' })).toBe('');
  });
});

// ============================================
// cleanPhrase
// ============================================

describe('cleanPhrase', () => {
  it('met en minuscules', () => {
    expect(cleanPhrase('I Like Coffee')).toBe('i like coffee');
  });

  it('retire les espaces en début/fin', () => {
    expect(cleanPhrase('  hello  ')).toBe('hello');
  });

  it('retire la ponctuation', () => {
    expect(cleanPhrase('Hello, world!')).toBe('hello world');
  });

  it('normalise les apostrophes typographiques iOS/Android en apostrophe droite', () => {
    expect(cleanPhrase('I’m fine')).toBe("i'm fine");
    expect(cleanPhrase('I‘m fine')).toBe("i'm fine");
  });

  it('réduit les espaces multiples à un seul', () => {
    expect(cleanPhrase('I   like    coffee')).toBe('i like coffee');
  });

  it('combine toutes les normalisations', () => {
    expect(cleanPhrase("  I’m   Happy!!  ")).toBe("i'm happy");
  });
});

// ============================================
// tokenizePhraseForTiles
// ============================================

describe('tokenizePhraseForTiles', () => {
  it('découpe une phrase simple en tokens un par mot', () => {
    const { tokens, trailingPunctuation } = tokenizePhraseForTiles('I like coffee');
    expect(tokens.map((t) => t.text)).toEqual(['I', 'like', 'coffee']);
    expect(trailingPunctuation).toBe('');
  });

  it('extrait la ponctuation finale séparément', () => {
    const { tokens, trailingPunctuation } = tokenizePhraseForTiles('I like coffee.');
    expect(tokens.map((t) => t.text)).toEqual(['I', 'like', 'coffee']);
    expect(trailingPunctuation).toBe('.');
  });

  it('garde les contractions comme un seul token', () => {
    const { tokens } = tokenizePhraseForTiles("I don't like coffee");
    expect(tokens.map((t) => t.text)).toEqual(['I', "don't", 'like', 'coffee']);
  });

  it('extrait la ponctuation multiple finale (ex: "?!")', () => {
    const { tokens, trailingPunctuation } = tokenizePhraseForTiles('Really?!');
    expect(tokens.map((t) => t.text)).toEqual(['Really']);
    expect(trailingPunctuation).toBe('?!');
  });

  it('génère des id uniques et ordonnés', () => {
    const { tokens } = tokenizePhraseForTiles('a b c');
    expect(tokens.map((t) => t.id)).toEqual(['tile-0', 'tile-1', 'tile-2']);
  });

  it('trim les espaces superflus avant découpage', () => {
    const { tokens } = tokenizePhraseForTiles('  I  like   coffee  ');
    expect(tokens.map((t) => t.text)).toEqual(['I', 'like', 'coffee']);
  });

  it('phrase vide → aucun token', () => {
    const { tokens, trailingPunctuation } = tokenizePhraseForTiles('');
    expect(tokens).toEqual([]);
    expect(trailingPunctuation).toBe('');
  });
});

// ============================================
// shuffleTiles
// ============================================

describe('shuffleTiles', () => {
  const makeTokens = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ id: `tile-${i}`, text: `word${i}` }));

  it('tableau vide → retourne un tableau vide', () => {
    expect(shuffleTiles([])).toEqual([]);
  });

  it('un seul token → retourne tel quel', () => {
    const tokens = makeTokens(1);
    expect(shuffleTiles(tokens)).toEqual(tokens);
  });

  it('retourne le même ensemble de tokens (juste réordonné)', () => {
    const tokens = makeTokens(6);
    const shuffled = shuffleTiles(tokens);
    expect(shuffled.map((t) => t.id).sort()).toEqual(tokens.map((t) => t.id).sort());
  });

  it('ne retourne jamais l\'ordre original quand un vrai mélange est possible (Math.random réel, 2 tokens)', () => {
    // Avec 2 tokens, le garde-fou de re-tirage doit systématiquement produire l'ordre inverse.
    const tokens = makeTokens(2);
    const shuffled = shuffleTiles(tokens);
    expect(shuffled.map((t) => t.id)).toEqual(['tile-1', 'tile-0']);
  });

  it('si le mélange tombe systématiquement sur l\'ordre original, retombe sur le swap de secours', () => {
    const tokens = makeTokens(3);
    // random proche de 1 → floor(random * (i+1)) === i à chaque itération de Fisher-Yates
    // (j === i, donc swap(i, i) = no-op) → même ordre à chaque tentative → épuise les 5
    // essais → doit déclencher le swap de secours (positions 0 <-> 1 du tableau original).
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
    try {
      const shuffled = shuffleTiles(tokens);
      expect(shuffled.map((t) => t.id)).toEqual(['tile-1', 'tile-0', 'tile-2']);
    } finally {
      randomSpy.mockRestore();
    }
  });
});
