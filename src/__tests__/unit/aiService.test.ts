/**
 * Tests unitaires — aiService.formatAIError
 * Teste uniquement la méthode pure formatAIError (pas les appels réseau)
 */

import aiService from '@/services/ai/aiService';

// ============================================
// formatAIError
// ============================================

describe('aiService.formatAIError', () => {
  // Erreurs d'authentification
  it('erreur 401 → message clé API invalide', () => {
    const result = aiService.formatAIError(new Error('401 Unauthorized'));
    expect(result).toBe('Clé API invalide. Vérifie ta clé dans les paramètres.');
  });

  it('erreur Unauthorized → message clé API invalide', () => {
    const result = aiService.formatAIError(new Error('Unauthorized access'));
    expect(result).toBe('Clé API invalide. Vérifie ta clé dans les paramètres.');
  });

  // Rate limiting
  it('erreur 429 → message limite atteinte', () => {
    const result = aiService.formatAIError(new Error('429 Too Many Requests'));
    expect(result).toContain('Limite');
  });

  it('erreur rate limit → message limite atteinte', () => {
    const result = aiService.formatAIError(new Error('rate limit exceeded'));
    expect(result).toContain('Limite');
  });

  // Quota
  it('erreur quota → message quota dépassé', () => {
    const result = aiService.formatAIError(new Error('You have exceeded your quota'));
    expect(result).toContain('Quota');
  });

  // Clé API manquante
  it('erreur "Clé API manquante" → retourne le message tel quel', () => {
    const msg = 'Clé API manquante pour openai';
    const result = aiService.formatAIError(new Error(msg));
    expect(result).toBe(msg);
  });

  // Erreur générique
  it('erreur inconnue avec message → retourne le message', () => {
    const result = aiService.formatAIError(new Error('Connection refused'));
    expect(result).toBe('Connection refused');
  });

  // Erreur non-Error
  it('string → message de connexion par défaut', () => {
    const result = aiService.formatAIError('some string error');
    expect(result).toBe("Erreur de communication avec l'IA. Vérifie ta connexion.");
  });

  it('null → message de connexion par défaut', () => {
    const result = aiService.formatAIError(null);
    expect(result).toBe("Erreur de communication avec l'IA. Vérifie ta connexion.");
  });

  it('undefined → message de connexion par défaut', () => {
    const result = aiService.formatAIError(undefined);
    expect(result).toBe("Erreur de communication avec l'IA. Vérifie ta connexion.");
  });

  // Fragment de clé API dans le message brut d'un provider (format OpenAI)
  it('message contenant un fragment de clé API → clé masquée', () => {
    const result = aiService.formatAIError(new Error('Incorrect API key provided: sk-abc123...xyz789. You can find your key at...'));
    expect(result).not.toContain('sk-abc123');
    expect(result).toContain('[clé masquée]');
  });

  it('objet sans message → message de connexion par défaut', () => {
    const result = aiService.formatAIError({ code: 500 });
    expect(result).toBe("Erreur de communication avec l'IA. Vérifie ta connexion.");
  });

  // Retourne toujours une string
  it('retourne toujours une chaîne non vide', () => {
    const cases = [
      new Error('401'),
      new Error('429'),
      new Error('random error'),
      null,
      undefined,
      '',
    ];
    cases.forEach(c => {
      const result = aiService.formatAIError(c);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
