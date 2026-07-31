/**
 * Tests unitaires — ragService
 * Couvre : détection de mots-clés RAG, recherche de contenu pertinent (LIKE SQLite mocké),
 * formatage du contexte, gestion des cas limites (db absente, JSON malformé, aucun mot-clé).
 */

import ragService from '@/services/ai/ragService';

const mockDb = (rows: { id: number; data: string; content_type: string; family_id: number }[]) => ({
  getAllAsync: jest.fn().mockResolvedValue(rows),
});

// ============================================
// shouldUseRAG
// ============================================

describe('ragService.shouldUseRAG', () => {
  it('détecte un mot-clé de vocabulaire (fr)', () => {
    expect(ragService.shouldUseRAG('comment on dit chat en anglais ?', 1).useRAG).toBe(true);
  });

  it('détecte un mot-clé de vocabulaire (en)', () => {
    expect(ragService.shouldUseRAG('what does this word mean?', 1).useRAG).toBe(true);
  });

  it('insensible à la casse', () => {
    expect(ragService.shouldUseRAG('TRADUCTION de house', 1).useRAG).toBe(true);
  });

  it('pas de mot-clé → useRAG=false', () => {
    expect(ragService.shouldUseRAG('Peux-tu corriger ma phrase ?', 1).useRAG).toBe(false);
  });

  it('requête vide → useRAG=false', () => {
    expect(ragService.shouldUseRAG('', 1).useRAG).toBe(false);
  });
});

// ============================================
// formatRAGContext
// ============================================

describe('ragService.formatRAGContext', () => {
  it('préfixe le contexte avec la source', () => {
    expect(ragService.formatRAGContext('cat = chat')).toBe('Source Joud Academy :\ncat = chat');
  });

  it('contexte vide → chaîne vide (pas de préfixe)', () => {
    expect(ragService.formatRAGContext('')).toBe('');
  });
});

// ============================================
// trackRAGUsage — smoke test (log dev-only)
// ============================================

describe('ragService.trackRAGUsage', () => {
  it('ne lance pas d\'exception', () => {
    expect(() => ragService.trackRAGUsage(true, 100)).not.toThrow();
    expect(() => ragService.trackRAGUsage(false)).not.toThrow();
  });
});

// ============================================
// searchRelevantContent
// ============================================

describe('ragService.searchRelevantContent', () => {
  it('db null → documents/context vides', async () => {
    const result = await ragService.searchRelevantContent(null, { query: 'word' });
    expect(result).toEqual({ documents: [], context: '' });
  });

  it('db=number (id de connexion non résolu) → vide', async () => {
    const result = await ragService.searchRelevantContent(1 as unknown as null, { query: 'word' });
    expect(result).toEqual({ documents: [], context: '' });
  });

  it('aucun mot-clé exploitable (que des stop-words) → vide, pas de requête DB', async () => {
    const db = mockDb([]);
    const result = await ragService.searchRelevantContent(db as never, { query: 'the a is' });
    expect(result).toEqual({ documents: [], context: '' });
    expect(db.getAllAsync).not.toHaveBeenCalled();
  });

  it('construit le contexte à partir des lignes trouvées (type word)', async () => {
    const db = mockDb([
      { id: 1, data: JSON.stringify({ english: 'cat', french: 'chat' }), content_type: 'word', family_id: 1 },
    ]);
    const result = await ragService.searchRelevantContent(db as never, { query: 'word cat' });
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]).toMatchObject({ id: '1', type: 'vocabulary' });
    expect(result.context).toContain('cat = chat');
  });

  it('formate une sentence (english → french)', async () => {
    const db = mockDb([
      { id: 2, data: JSON.stringify({ english: 'Hello', french: 'Bonjour' }), content_type: 'sentence', family_id: 1 },
    ]);
    const result = await ragService.searchRelevantContent(db as never, { query: 'sentence hello' });
    expect(result.context).toContain('Hello → Bonjour');
  });

  it('ignore silencieusement une ligne au JSON malformé', async () => {
    const db = mockDb([
      { id: 3, data: 'not valid json{', content_type: 'word', family_id: 1 },
    ]);
    const result = await ragService.searchRelevantContent(db as never, { query: 'word' });
    expect(result.documents).toHaveLength(0);
  });

  it('déduplique les documents par id sur plusieurs mots-clés', async () => {
    const db = {
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, data: JSON.stringify({ english: 'cat', french: 'chat' }), content_type: 'word', family_id: 1 },
      ]),
    };
    // 2 mots-clés exploitables → 2 appels DB, mais la même ligne id=1 revient à chaque fois
    const result = await ragService.searchRelevantContent(db as never, { query: 'word vocabulary' });
    expect(result.documents).toHaveLength(1);
    expect(db.getAllAsync).toHaveBeenCalledTimes(2);
  });

  it('trie par pertinence décroissante et respecte la limite', async () => {
    const db = mockDb([
      { id: 1, data: JSON.stringify({ english: 'apple', french: 'pomme' }), content_type: 'word', family_id: 1 },
      { id: 2, data: JSON.stringify({ english: 'apple pie', french: 'tarte aux pommes' }), content_type: 'word', family_id: 1 },
    ]);
    const result = await ragService.searchRelevantContent(db as never, { query: 'apple pie', limit: 1 });
    expect(result.documents).toHaveLength(1);
    // La ligne la plus pertinente (contient les 2 mots-clés) doit passer devant
    expect(result.documents[0].id).toBe('2');
  });
});

// ============================================
// getSimilarExamples
// ============================================

describe('ragService.getSimilarExamples', () => {
  it('db null → []', async () => {
    expect(await ragService.getSimilarExamples(null, 'cat')).toEqual([]);
  });

  it('aucun mot-clé exploitable → []', async () => {
    const db = mockDb([]);
    expect(await ragService.getSimilarExamples(db as never, 'the a')).toEqual([]);
  });

  it('extrait english/word/text et filtre les vides', async () => {
    const db = {
      getAllAsync: jest.fn().mockResolvedValue([
        { data: JSON.stringify({ english: 'dog' }) },
        { data: JSON.stringify({ word: 'bird' }) },
        { data: JSON.stringify({}) },
        { data: 'malformed{' },
      ]),
    };
    const examples = await ragService.getSimilarExamples(db as never, 'animal');
    expect(examples).toEqual(['dog', 'bird']);
  });
});

// ============================================
// enrichContext
// ============================================

describe('ragService.enrichContext', () => {
  it('db null → chaîne vide', async () => {
    expect(await ragService.enrichContext(null, 'word cat')).toBe('');
  });

  it('délègue à searchRelevantContent et retourne son contexte', async () => {
    const db = mockDb([
      { id: 1, data: JSON.stringify({ english: 'cat', french: 'chat' }), content_type: 'word', family_id: 1 },
    ]);
    const context = await ragService.enrichContext(db as never, 'word cat', 2);
    expect(context).toContain('cat = chat');
  });
});
