/**
 * Tests unitaires — src/screens/AITutor/helpers.ts (fonctions pures)
 */

import {
  formatRelativeTime,
  toUIMessage,
  getLevelWelcomeMessage,
  buildLevelAdaptedSystemPrompt,
  buildOpeningMessage,
  buildDomainSystemPrompt,
} from '@/screens/AITutor/helpers';
import type { ChatMessage } from '@/screens/AITutor/hooks/useChatConversation';
import type { DomainSummary } from '@/screens/AITutor/hooks/useGuidedDomainSummaries';

// ============================================
// formatRelativeTime
// ============================================

describe('formatRelativeTime', () => {
  it('moins d\'une minute → "À l\'instant"', () => {
    expect(formatRelativeTime(Date.now())).toBe("À l'instant");
  });

  it('quelques minutes → "Il y a N min"', () => {
    expect(formatRelativeTime(Date.now() - 5 * 60 * 1000)).toBe('Il y a 5 min');
  });

  it('quelques heures → "Il y a Nh"', () => {
    expect(formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000)).toBe('Il y a 3h');
  });

  it('exactement 1 jour → "Hier"', () => {
    expect(formatRelativeTime(Date.now() - 25 * 60 * 60 * 1000)).toBe('Hier');
  });

  it('plusieurs jours → "Il y a N jours"', () => {
    expect(formatRelativeTime(Date.now() - 3 * 24 * 60 * 60 * 1000)).toBe('Il y a 3 jours');
  });
});

// ============================================
// toUIMessage
// ============================================

describe('toUIMessage', () => {
  it('convertit un ChatMessage SQLite en ChatUIMessage', () => {
    const msg: ChatMessage = {
      id: 42, role: 'ai', content: 'salut', source: 'ai_api', provider: 'openai', created_at: 1700000000000,
    };

    const result = toUIMessage(msg);

    expect(result).toEqual({
      id: '42',
      type: 'ai',
      content: 'salut',
      timestamp: new Date(1700000000000),
      source: 'ai_api',
      provider: 'openai',
    });
  });
});

// ============================================
// getLevelWelcomeMessage
// ============================================

describe('getLevelWelcomeMessage', () => {
  it('retourne un message différent pour chaque niveau 1-4', () => {
    const messages = [1, 2, 3, 4].map(getLevelWelcomeMessage);
    expect(new Set(messages).size).toBe(4);
  });

  it('niveau inconnu → message générique par défaut', () => {
    expect(getLevelWelcomeMessage(99)).toBe("Pose-moi n'importe quelle question sur l'anglais !");
  });
});

// ============================================
// buildLevelAdaptedSystemPrompt
// ============================================

describe('buildLevelAdaptedSystemPrompt', () => {
  it('retourne un message role=system', () => {
    const result = buildLevelAdaptedSystemPrompt(1);
    expect(result.role).toBe('system');
    expect(result.content).toContain('Student level: 1/4');
  });

  it('adapte le ton par niveau (contenu différent)', () => {
    const level1 = buildLevelAdaptedSystemPrompt(1).content;
    const level4 = buildLevelAdaptedSystemPrompt(4).content;
    expect(level1).not.toBe(level4);
  });

  it('niveau hors plage → retombe sur le ton intermédiaire', () => {
    const result = buildLevelAdaptedSystemPrompt(99);
    expect(result.content).toContain('intermediate');
  });

  it('contient la clause de cadrage/sécurité (redirection sur sujet hors anglais)', () => {
    const result = buildLevelAdaptedSystemPrompt(2);
    expect(result.content).toContain('mineur');
    expect(result.content).toContain('sensible');
    expect(result.content.toLowerCase()).toContain('redirige');
  });
});

// ============================================
// buildOpeningMessage
// ============================================

const baseDomain = (overrides: Partial<DomainSummary>): DomainSummary => ({
  domain: 'vocab',
  label: 'Vocabulaire',
  emoji: '📝',
  subtitle: '',
  hasActivity: true,
  stats: { errorCount: 0, errorExamples: [], familiesWorked: 0, completedCount: 0 },
  ...overrides,
});

describe('buildOpeningMessage', () => {
  it('domaine vocab avec mots récents → les mentionne', () => {
    const domain = baseDomain({
      domain: 'vocab',
      stats: { errorCount: 0, errorExamples: [], familiesWorked: 0, completedCount: 0, recentWords: [{ word: 'house', translation: 'maison' }] },
    });
    expect(buildOpeningMessage(domain)).toContain('house');
  });

  it('domaine vocab sans mots récents → message générique', () => {
    const domain = baseDomain({ domain: 'vocab' });
    expect(buildOpeningMessage(domain)).toContain('vocabulaire');
  });

  it('mentionne les erreurs récentes quand errorCount > 0', () => {
    const domain = baseDomain({
      domain: 'vocab',
      stats: { errorCount: 2, errorExamples: [], familiesWorked: 0, completedCount: 0 },
    });
    expect(buildOpeningMessage(domain)).toContain('trompé 2 fois');
  });

  it('domaine dialogues → mentionne le nombre de dialogues faits', () => {
    const domain = baseDomain({
      domain: 'dialogues', label: 'Dialogues',
      stats: { errorCount: 0, errorExamples: [], familiesWorked: 3, completedCount: 0 },
    });
    expect(buildOpeningMessage(domain)).toContain('3 dialogues');
  });

  it('domaine reading → mentionne le nombre de textes lus (singulier si 1)', () => {
    const domain = baseDomain({
      domain: 'reading', label: 'Lecture',
      stats: { errorCount: 0, errorExamples: [], familiesWorked: 1, completedCount: 0 },
    });
    expect(buildOpeningMessage(domain)).toContain('lu 1 texte');
  });

  it('domaine phrase_types → mentionne le nombre de phrases construites', () => {
    const domain = baseDomain({
      domain: 'phrase_types', label: 'Phrases',
      stats: { errorCount: 0, errorExamples: [], familiesWorked: 0, completedCount: 5 },
    });
    expect(buildOpeningMessage(domain)).toContain('construit 5 phrases');
  });
});

// ============================================
// buildDomainSystemPrompt
// ============================================

describe('buildDomainSystemPrompt', () => {
  it('retourne un message role=system mentionnant le niveau et le domaine', () => {
    const domain = baseDomain({ label: 'Vocabulaire' });
    const result = buildDomainSystemPrompt(domain, 2);

    expect(result.role).toBe('system');
    expect(result.content).toContain('niveau 2/4');
    expect(result.content).toContain('Vocabulaire');
  });

  it('inclut les erreurs récentes quand présentes', () => {
    const domain = baseDomain({
      stats: {
        errorCount: 1, familiesWorked: 0, completedCount: 0,
        errorExamples: [{ question: 'Q1', userAnswer: 'A', correctAnswer: 'B', familyName: 'Food' }],
      },
    });

    const result = buildDomainSystemPrompt(domain, 1);
    expect(result.content).toContain('Q1');
    expect(result.content).toContain('Erreurs récentes');
  });

  it('sans erreurs → pas de section "Erreurs récentes"', () => {
    const domain = baseDomain({});
    const result = buildDomainSystemPrompt(domain, 1);
    expect(result.content).not.toContain('Erreurs récentes');
  });

  it('contient la clause de cadrage/sécurité (redirection sur sujet hors anglais)', () => {
    const domain = baseDomain({});
    const result = buildDomainSystemPrompt(domain, 1);
    expect(result.content).toContain('mineur');
    expect(result.content).toContain('sensible');
    expect(result.content.toLowerCase()).toContain('redirige');
  });
});
