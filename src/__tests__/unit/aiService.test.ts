/**
 * Tests unitaires — aiService
 * formatAIError (pure) + sendChatMessage/sendMessage (réseau, fetch mocké)
 */

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import aiService from '@/services/ai/aiService';
import { log } from '@/utils/logUtils';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const jsonResponse = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  json: jest.fn().mockResolvedValue(body),
});

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

// ============================================
// buildSystemMessage
// ============================================

describe('aiService.buildSystemMessage', () => {
  it('retourne un ChatMessage role=system avec le contenu fourni', () => {
    expect(aiService.buildSystemMessage('contexte')).toEqual({ role: 'system', content: 'contexte' });
  });
});

// ============================================
// sendChatMessage — clé API manquante / provider inconnu
// ============================================

describe('aiService.sendChatMessage — validations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejette si la clé API est vide, sans appeler fetch', async () => {
    await expect(
      aiService.sendChatMessage('openai', '', [{ role: 'user', content: 'hi' }])
    ).rejects.toThrow('Clé API manquante');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejette un provider non supporté', async () => {
    await expect(
      // @ts-expect-error — provider volontairement invalide pour tester le default du switch
      aiService.sendChatMessage('unknown', 'sk-test', [{ role: 'user', content: 'hi' }])
    ).rejects.toThrow('Provider non supporté');
  });
});

// ============================================
// sendChatMessage — OpenAI
// ============================================

describe('aiService.sendChatMessage — openai', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne le contenu du message de la réponse', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ choices: [{ message: { content: 'Bonjour !' } }] })
    );

    const result = await aiService.sendChatMessage('openai', 'sk-test', [{ role: 'user', content: 'hi' }]);

    expect(result).toBe('Bonjour !');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer sk-test' }),
      })
    );
  });

  it('utilise le modèle/tokens/temperature fournis dans le body', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ choices: [{ message: { content: 'ok' } }] }));

    await aiService.sendChatMessage('openai', 'sk-test', [{ role: 'user', content: 'hi' }], {
      model: 'gpt-4', maxTokens: 200, temperature: 0.2,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toMatchObject({ model: 'gpt-4', max_tokens: 200, temperature: 0.2 });
  });

  it('retourne un message par défaut si la réponse n\'a pas de contenu', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ choices: [] }));
    const result = await aiService.sendChatMessage('openai', 'sk-test', [{ role: 'user', content: 'hi' }]);
    expect(result).toBe('Pas de réponse reçue.');
  });

  it('réponse non-ok → rejette avec le message d\'erreur du provider (formaté par formatAIError)', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: { message: '401 Unauthorized' } }, false, 401));

    await expect(
      aiService.sendChatMessage('openai', 'sk-test', [{ role: 'user', content: 'hi' }])
    ).rejects.toThrow('Clé API invalide');
  });

  it('réponse non-ok sans JSON parsable → message générique avec status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 500, statusText: 'Internal Server Error',
      json: jest.fn().mockRejectedValue(new Error('not json')),
    });

    await expect(
      aiService.sendChatMessage('openai', 'sk-test', [{ role: 'user', content: 'hi' }])
    ).rejects.toThrow('500');
  });

  it('masque la clé API dans les logs en cas d\'erreur', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: { message: 'Incorrect API key provided: sk-abc123secret' } }, false, 401)
    );

    await expect(
      aiService.sendChatMessage('openai', 'sk-abc123secret', [{ role: 'user', content: 'hi' }])
    ).rejects.toThrow();

    const loggedArgs = (log.error as jest.Mock).mock.calls[0];
    expect(loggedArgs.join(' ')).not.toContain('sk-abc123secret');
  });
});

// ============================================
// sendChatMessage — Mistral
// ============================================

describe('aiService.sendChatMessage — mistral', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne le contenu du message de la réponse', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ choices: [{ message: { content: 'Salut !' } }] }));

    const result = await aiService.sendChatMessage('mistral', 'key', [{ role: 'user', content: 'hi' }]);

    expect(result).toBe('Salut !');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.mistral.ai/v1/chat/completions',
      expect.anything()
    );
  });

  it('réponse non-ok → rejette avec le message d\'erreur du provider (formaté par formatAIError)', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: 'rate limit exceeded' }, false, 429));

    await expect(
      aiService.sendChatMessage('mistral', 'key', [{ role: 'user', content: 'hi' }])
    ).rejects.toThrow('Limite');
  });
});

// ============================================
// sendChatMessage — Claude
// ============================================

describe('aiService.sendChatMessage — claude', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne le texte de la réponse', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ content: [{ text: 'Bonjour depuis Claude' }] }));

    const result = await aiService.sendChatMessage('claude', 'sk-ant-test', [
      { role: 'system', content: 'tu es un coach' },
      { role: 'user', content: 'hi' },
    ]);

    expect(result).toBe('Bonjour depuis Claude');
  });

  it('envoie le message system séparément (champ `system`) et filtre des messages', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ content: [{ text: 'ok' }] }));

    await aiService.sendChatMessage('claude', 'sk-ant-test', [
      { role: 'system', content: 'tu es un coach' },
      { role: 'user', content: 'hi' },
    ]);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.system).toBe('tu es un coach');
    expect(body.messages).toEqual([{ role: 'user', content: 'hi' }]);
  });

  it('utilise le header x-api-key (pas Authorization)', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ content: [{ text: 'ok' }] }));

    await aiService.sendChatMessage('claude', 'sk-ant-test', [{ role: 'user', content: 'hi' }]);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'sk-ant-test' }) })
    );
  });

  it('réponse non-ok → rejette avec le message d\'erreur du provider', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: { message: 'overloaded' } }, false, 503));

    await expect(
      aiService.sendChatMessage('claude', 'sk-ant-test', [{ role: 'user', content: 'hi' }])
    ).rejects.toThrow('overloaded');
  });
});

// ============================================
// sendMessage — construit les messages et retourne { content }
// ============================================

describe('aiService.sendMessage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inclut le contexte comme message system quand fourni', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ choices: [{ message: { content: 'réponse' } }] }));

    const result = await aiService.sendMessage({
      message: 'question', context: 'contexte système', provider: 'openai', apiKey: 'sk-test',
    });

    expect(result).toEqual({ content: 'réponse' });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.messages[0]).toEqual({ role: 'system', content: 'contexte système' });
    expect(body.messages[1]).toEqual({ role: 'user', content: 'question' });
  });

  it('sans contexte, envoie uniquement le message user', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ choices: [{ message: { content: 'réponse' } }] }));

    await aiService.sendMessage({ message: 'question', provider: 'openai', apiKey: 'sk-test' });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.messages).toEqual([{ role: 'user', content: 'question' }]);
  });
});
