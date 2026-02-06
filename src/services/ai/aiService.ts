/**
 * ============================================
 * AI SERVICE
 * Service de communication avec l'IA (OpenAI/Mistral/Claude)
 * ============================================
 */

// ============================================
// TYPES
// ============================================

interface AIResponse {
  content: string;
  confidence?: number;
  suggestions?: string[];
}

interface AIRequest {
  message: string;
  context?: string;
  level?: number;
}

type Provider = 'openai' | 'mistral' | 'claude';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// ============================================
// SERVICE
// ============================================

class AIService {
  /**
   * Envoie un message à l'IA et récupère la réponse
   *
   * @param request - Le message et le contexte
   * @returns La réponse de l'IA
   */
  async sendMessage(request: AIRequest): Promise<AIResponse> {
    // TODO: Implémenter l'appel API réel
    // Pour l'instant, on simule une réponse

    await this.delay(1000); // Simule le temps de réponse

    return {
      content: `Mock AI Response for: "${request.message}"`,
      confidence: 0.95,
      suggestions: [
        'Try to ask more specific questions',
        'I can help you with English grammar',
        'Would you like to practice vocabulary?',
      ],
    };
  }

  /**
   * Analyse un texte pour des erreurs grammaticales
   *
   * @param text - Le texte à analyser
   * @returns Liste des erreurs trouvées
   */
  async analyzeGrammar(text: string): Promise<{ errors: Array<{ type: string; message: string; position: number }> }> {
    await this.delay(800);

    // Mock response
    return {
      errors: [],
    };
  }

  /**
   * Suggère des corrections pour un texte
   *
   * @param text - Le texte à corriger
   * @returns Texte corrigé avec suggestions
   */
  async suggestCorrections(text: string): Promise<{ corrected: string; changes: string[] }> {
    await this.delay(800);

    return {
      corrected: text,
      changes: [],
    };
  }

  /**
   * Construit un objet message système pour le contexte chat
   */
  buildSystemMessage(content: string): ChatMessage {
    return { role: 'system', content };
  }

  /**
   * Envoie une conversation multi-messages vers l'API IA
   * Retourne uniquement le texte de la réponse
   *
   * @param provider - Provider IA ('openai', 'mistral', 'claude')
   * @param apiKey - Clé API du provider
   * @param messages - Historique de conversation
   * @param options - Options (model, maxTokens, temperature)
   * @returns Réponse de l'IA
   */
  async sendChatMessage(
    provider: Provider,
    apiKey: string,
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    try {
      switch (provider) {
        case 'openai':
          return await this.sendToOpenAI(apiKey, messages, options);
        case 'mistral':
          return await this.sendToMistral(apiKey, messages, options);
        case 'claude':
          return await this.sendToClaude(apiKey, messages, options);
        default:
          throw new Error(`Provider non supporté : ${provider}`);
      }
    } catch (error: any) {
      console.error('[AIService] Error:', error);
      throw new Error(this.formatAIError(error));
    }
  }

  /**
   * Appel API OpenAI
   */
  private async sendToOpenAI(
    apiKey: string,
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-3.5-turbo',
        messages,
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message ||
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Pas de réponse reçue.';
  }

  /**
   * Appel API Mistral
   */
  private async sendToMistral(
    apiKey: string,
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'mistral-tiny',
        messages,
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.message ||
        `Mistral API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Pas de réponse reçue.';
  }

  /**
   * Appel API Claude (Anthropic)
   */
  private async sendToClaude(
    apiKey: string,
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    // Claude a un format différent : system séparé + messages user/assistant uniquement
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'claude-3-haiku-20240307',
        messages: conversationMessages,
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        ...(systemMessage && { system: systemMessage }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message ||
        `Claude API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.content[0]?.text || 'Pas de réponse reçue.';
  }

  /**
   * Formate une erreur AI en message lisible
   */
  formatAIError(error: any): string {
    if (error?.message) {
      // Erreurs spécifiques
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return 'Clé API invalide. Vérifie ta clé dans les paramètres.';
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return 'Limite d\'utilisation atteinte. Réessaye dans quelques instants.';
      }
      if (error.message.includes('quota')) {
        return 'Quota API dépassé. Vérifie ton compte provider.';
      }
      return error.message;
    }
    return 'Erreur de communication avec l\'IA. Vérifie ta connexion.';
  }

  /**
   * Utilitaire : Délai simulé
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

const aiService = new AIService();
export default aiService;
