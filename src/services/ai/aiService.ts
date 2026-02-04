/**
 * ============================================
 * AI SERVICE
 * Service de communication avec l'IA (Claude/GPT)
 * ============================================
 *
 * TODO: Implémenter l'intégration réelle avec une API IA
 * Pour l'instant, c'est un service mock pour éviter les erreurs TypeScript
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
  buildSystemMessage(content: string): { role: string; content: string } {
    return { role: 'system', content };
  }

  /**
   * Envoie une conversation multi-messages vers l'API IA
   * Retourne uniquement le texte de la réponse
   */
  async sendChatMessage(
    _provider: string,
    _apiKey: string,
    messages: Array<{ role: string; content: string }>,
    _options?: { model?: string }
  ): Promise<string> {
    // TODO: Implémenter l'appel vers provider réel (OpenAI / Mistral / Claude)
    await this.delay(1200);

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    return `(Mock) En réponse à : "${lastUserMsg?.content || '...'}" — Je suis ton tuteur anglais. Pose-moi une vraie question et je te répondrai !`;
  }

  /**
   * Formate une erreur AI en message lisible
   */
  formatAIError(error: any): string {
    if (error?.message) {
      return `AI Error: ${error.message}`;
    }
    return 'An error occurred while communicating with the AI.';
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
