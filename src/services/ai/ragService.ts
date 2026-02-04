/**
 * ============================================
 * RAG SERVICE (Retrieval-Augmented Generation)
 * Service pour récupérer du contenu pédagogique pertinent
 * ============================================
 *
 * TODO: Implémenter la vraie logique RAG avec vectorisation
 * Pour l'instant, c'est un service mock pour éviter les erreurs TypeScript
 */

import { SQLiteDatabase } from 'expo-sqlite';

// ============================================
// TYPES
// ============================================

interface RAGDocument {
  id: string;
  content: string;
  type: 'vocabulary' | 'grammar' | 'sentence' | 'rule';
  relevance: number;
}

interface RAGQuery {
  query: string;
  level?: number;
  moduleSlug?: string;
  limit?: number;
}

interface RAGResponse {
  documents: RAGDocument[];
  context: string;
}

// ============================================
// SERVICE
// ============================================

class RAGService {
  /**
   * Recherche du contenu pertinent selon une requête
   *
   * @param db - Base de données SQLite
   * @param query - Requête de recherche
   * @returns Documents pertinents et contexte
   */
  async searchRelevantContent(
    db: SQLiteDatabase | null,
    query: RAGQuery
  ): Promise<RAGResponse> {
    if (!db) {
      return { documents: [], context: '' };
    }

    // TODO: Implémenter la vraie recherche vectorielle
    // Pour l'instant, mock response

    await this.delay(600);

    return {
      documents: [],
      context: `Mock RAG context for query: "${query.query}"`,
    };
  }

  /**
   * Récupère des exemples similaires depuis la DB
   *
   * @param db - Base de données SQLite
   * @param topic - Sujet recherché
   * @returns Exemples pertinents
   */
  async getSimilarExamples(
    db: SQLiteDatabase | null,
    topic: string
  ): Promise<string[]> {
    if (!db) return [];

    await this.delay(400);

    return [];
  }

  /**
   * Génère un contexte enrichi pour l'IA
   *
   * @param db - Base de données SQLite
   * @param userQuery - Requête utilisateur
   * @param level - Niveau de l'utilisateur
   * @returns Contexte enrichi
   */
  async enrichContext(
    db: SQLiteDatabase | null,
    userQuery: string,
    level?: number
  ): Promise<string> {
    if (!db) return '';

    const result = await this.searchRelevantContent(db, {
      query: userQuery,
      level,
      limit: 5,
    });

    return result.context;
  }

  /**
   * Détermine si RAG doit être utilisé pour cette requête.
   * Retourne { useRAG, context } — context est fourni si un match local existe.
   */
  shouldUseRAG(query: string, _level: number): { useRAG: boolean; context?: string } {
    // TODO: recherche vectorielle dans la DB pédagogique
    // Pour l'instant : aucun match local, tout part vers l'API IA
    return { useRAG: false };
  }

  /**
   * Log l'utilisation du RAG pour analytics
   */
  trackRAGUsage(used: boolean, confidence?: number): void {
    console.log(`[RAG] used=${used}, confidence=${confidence ?? 'n/a'}`);
  }

  /**
   * Formate un contexte RAG (string) en texte lisible pour l'utilisateur
   */
  formatRAGContext(context: string): string {
    if (!context) return '';
    return `📚 Source Joud Academy :\n${context}`;
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

const ragService = new RAGService();
export default ragService;
