import { moduleHasSubfamilies, MODULE_CONFIG } from '@/config/moduleConfig';

describe('moduleHasSubfamilies', () => {
  it('returns true for modules with subfamilies', () => {
    expect(moduleHasSubfamilies('vocab')).toBe(true);
    expect(moduleHasSubfamilies('grammar')).toBe(true);
    expect(moduleHasSubfamilies('phrase_types')).toBe(true);
    expect(moduleHasSubfamilies('reading')).toBe(true);
    expect(moduleHasSubfamilies('dialogues')).toBe(true);
  });

  it('returns false for modules without subfamilies', () => {
    expect(moduleHasSubfamilies('word_games')).toBe(false);
    expect(moduleHasSubfamilies('connector')).toBe(false);
  });

  it('returns false for unknown slugs (safe default)', () => {
    expect(moduleHasSubfamilies('unknown_module')).toBe(false);
    expect(moduleHasSubfamilies('')).toBe(false);
  });
});

describe('MODULE_CONFIG', () => {
  const ALL_MODULES = [
    'vocab', 'grammar', 'phrase_types', 'reading', 'dialogues',
    'word_games', 'connector',
  ];

  it('has entries for all 7 modules', () => {
    ALL_MODULES.forEach(slug => {
      expect(MODULE_CONFIG[slug]).toBeDefined();
    });
  });

  it('phrase_types requires subfamily for ALL families', () => {
    expect(MODULE_CONFIG.phrase_types.requiresSubfamilyForAllFamilies).toBe(true);
  });

  it('grammar requires subfamily for ALL families', () => {
    expect(MODULE_CONFIG.grammar.requiresSubfamilyForAllFamilies).toBe(true);
  });

  it('dialogues requires subfamily for ALL families', () => {
    expect(MODULE_CONFIG.dialogues.requiresSubfamilyForAllFamilies).toBe(true);
  });

  it('vocab does NOT require subfamily for all families (some families have no sub)', () => {
    expect(MODULE_CONFIG.vocab.requiresSubfamilyForAllFamilies).toBe(false);
  });

  it('modules without subfamilies have hasSubfamilies=false', () => {
    ['word_games', 'connector'].forEach(slug => {
      expect(MODULE_CONFIG[slug].hasSubfamilies).toBe(false);
    });
  });
});
