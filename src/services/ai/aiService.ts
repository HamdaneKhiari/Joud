import { log } from '@/utils/logUtils';

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
  provider: Provider;
  apiKey: string;
  model?: string;
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
   * Envoie un message simple à l'IA et récupère la réponse
   * Utilise sendChatMessage en interne
   */
  async sendMessage(request: AIRequest): Promise<AIResponse> {
    const messages: ChatMessage[] = [];

    if (request.context) {
      messages.push({ role: 'system', content: request.context });
    }

    messages.push({ role: 'user', content: request.message });

    const content = await this.sendChatMessage(
      request.provider,
      request.apiKey,
      messages,
      { model: request.model }
    );

    return { content };
  }

  /**
   * Construit un objet message système pour le contexte chat
   */
  buildSystemMessage(content: string): ChatMessage {
    return { role: 'system', content };
  }

  /**
   * Envoie une conversation multi-messages vers l'API IA
   */
  async sendChatMessage(
    provider: Provider,
    apiKey: string,
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    if (!apiKey) {
      throw new Error('Clé API manquante. Configure-la dans les paramètres.');
    }

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
    } catch (error: unknown) {
      log.error('[AIService] Error:', error instanceof Error ? error.message : 'Unknown error');
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
  formatAIError(error: unknown): string {
    const message = error instanceof Error ? error.message : undefined;
    if (message) {
      if (message.includes('401') || message.includes('Unauthorized')) {
        return 'Clé API invalide. Vérifie ta clé dans les paramètres.';
      }
      if (message.includes('429') || message.includes('rate limit')) {
        return 'Limite d\'utilisation atteinte. Réessaye dans quelques instants.';
      }
      if (message.includes('quota')) {
        return 'Quota API dépassé. Vérifie ton compte provider.';
      }
      if (message.includes('Clé API manquante')) {
        return message;
      }
      return message;
    }
    return 'Erreur de communication avec l\'IA. Vérifie ta connexion.';
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

const aiService = new AIService();
export default aiService;