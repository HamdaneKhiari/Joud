import { log } from '@/utils/logUtils';

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

// Certains providers (OpenAI notamment) incluent un fragment de la clé API soumise dans
// leurs messages d'erreur ("Incorrect API key provided: sk-abc...xyz") — on masque tout motif
// de ce type avant de logger ou d'afficher l'erreur, plutôt que de faire confiance au masquage
// du provider.
const redactApiKey = (text: string): string => text.replace(/\bsk-\S+/gi, '[clé masquée]');

class AIService {
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

  buildSystemMessage(content: string): ChatMessage {
    return { role: 'system', content };
  }

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
      log.error('[AIService] Error:', error instanceof Error ? redactApiKey(error.message) : 'Unknown error');
      throw new Error(this.formatAIError(error));
    }
  }

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
      return redactApiKey(message);
    }
    return 'Erreur de communication avec l\'IA. Vérifie ta connexion.';
  }
}

const aiService = new AIService();
export default aiService;