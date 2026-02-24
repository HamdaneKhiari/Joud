/**
 * ============================================
 * RAG SERVICE (Retrieval-Augmented Generation)
 * Recherche de contenu pédagogique pertinent dans SQLite
 * Utilise LIKE pour la recherche par mots-clés
 * ============================================
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
// KEYWORDS pour le matching local
// ============================================

const GRAMMAR_KEYWORDS = [
  'present', 'past', 'future', 'tense', 'verb', 'conjugation', 'conjugaison',
  'preterit', 'perfect', 'continuous', 'progressive', 'modal', 'auxiliary',
  'pronoun', 'pronom', 'article', 'preposition', 'adverb', 'adjective',
  'comparatif', 'superlatif', 'comparative', 'superlative',
  'conditionnel', 'conditional', 'passive', 'passif', 'gerund', 'infinitive',
  'pluriel', 'plural', 'singular', 'singulier', 'possessive', 'possessif',
];

const VOCAB_KEYWORDS = [
  'mot', 'word', 'vocabulaire', 'vocabulary', 'traduction', 'translation',
  'signifie', 'means', 'dire', 'say', 'comment on dit',
];

// ============================================
// SERVICE
// ============================================

class RAGService {
  /**
   * Recherche du contenu pertinent dans la DB selon une requête
   */
  async searchRelevantContent(
    db: SQLiteDatabase | null,
    query: RAGQuery
  ): Promise<RAGResponse> {
    if (!db || typeof db === 'number') {
      return { documents: [], context: '' };
    }

    const limit = query.limit || 5;
    const keywords = this.extractKeywords(query.query);

    if (keywords.length === 0) {
      return { documents: [], context: '' };
    }

    const documents: RAGDocument[] = [];

    // Recherche par LIKE sur le champ data (JSON) de la table content
    for (const keyword of keywords.slice(0, 3)) {
      const results = await db.getAllAsync<{
        id: number;
        data: string;
        content_type: string;
        family_id: number;
      }>(
        `SELECT c.id, c.data, c.content_type, c.family_id
         FROM content c
         WHERE c.data LIKE ?
         ${query.level ? 'AND c.level = ?' : ''}
         ${query.moduleSlug ? 'AND c.family_id IN (SELECT id FROM families WHERE module_slug = ?)' : ''}
         LIMIT ?`,
        [
          `%${keyword}%`,
          ...(query.level ? [query.level] : []),
          ...(query.moduleSlug ? [query.moduleSlug] : []),
          limit,
        ]
      );

      for (const row of results) {
        if (documents.some(d => d.id === row.id.toString())) continue;

        try {
          const parsed = JSON.parse(row.data);
          const contentText = this.extractReadableContent(parsed, row.content_type);

          documents.push({
            id: row.id.toString(),
            content: contentText,
            type: this.mapContentType(row.content_type),
            relevance: this.calculateRelevance(contentText, keywords),
          });
        } catch {
          // Skip malformed JSON
        }
      }
    }

    // Trier par pertinence décroissante
    documents.sort((a, b) => b.relevance - a.relevance);
    const topDocs = documents.slice(0, limit);

    const context = topDocs.length > 0
      ? topDocs.map(d => d.content).join('\n---\n')
      : '';

    return { documents: topDocs, context };
  }

  /**
   * Récupère des exemples similaires depuis la DB
   */
  async getSimilarExamples(
    db: SQLiteDatabase | null,
    topic: string
  ): Promise<string[]> {
    if (!db || typeof db === 'number') return [];

    const keywords = this.extractKeywords(topic);
    if (keywords.length === 0) return [];

    const results = await db.getAllAsync<{ data: string }>(
      `SELECT data FROM content WHERE data LIKE ? LIMIT 5`,
      [`%${keywords[0]}%`]
    );

    return results.map(r => {
      try {
        const parsed = JSON.parse(r.data);
        return parsed.english || parsed.word || parsed.text || '';
      } catch {
        return '';
      }
    }).filter(Boolean);
  }

  /**
   * Génère un contexte enrichi pour l'IA
   */
  async enrichContext(
    db: SQLiteDatabase | null,
    userQuery: string,
    level?: number
  ): Promise<string> {
    if (!db || typeof db === 'number') return '';

    const result = await this.searchRelevantContent(db, {
      query: userQuery,
      level,
      limit: 5,
    });

    return result.context;
  }

  /**
   * Détermine si RAG doit être utilisé pour cette requête.
   * Vérifie si la requête contient des mots-clés pédagogiques connus.
   */
  shouldUseRAG(query: string, _level: number): { useRAG: boolean; context?: string } {
    const lowerQuery = query.toLowerCase();

    // Vérifier si la requête touche un sujet couvert par la DB
    const hasGrammarKeyword = GRAMMAR_KEYWORDS.some(kw => lowerQuery.includes(kw));
    const hasVocabKeyword = VOCAB_KEYWORDS.some(kw => lowerQuery.includes(kw));

    // On ne peut pas faire de recherche SQL synchrone ici,
    // donc on indique seulement si RAG DEVRAIT être tenté.
    // Le vrai enrichissement se fait via enrichContext() appelé par le screen.
    if (hasGrammarKeyword || hasVocabKeyword) {
      return { useRAG: true };
    }

    return { useRAG: false };
  }

  /**
   * Log l'utilisation du RAG pour analytics
   */
  trackRAGUsage(used: boolean, confidence?: number): void {
    if (__DEV__) {
      console.log(`[RAG] used=${used}, confidence=${confidence ?? 'n/a'}`);
    }
  }

  /**
   * Formate un contexte RAG en texte lisible
   */
  formatRAGContext(context: string): string {
    if (!context) return '';
    return `Source Joud Academy :\n${context}`;
  }

  // ============================================
  // HELPERS PRIVÉS
  // ============================================

  /**
   * Extrait les mots-clés significatifs d'une requête
   */
  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'en',
      'est', 'a', 'au', 'aux', 'ce', 'se', 'qui', 'que', 'quoi', 'dans',
      'pour', 'par', 'sur', 'avec', 'sans', 'son', 'sa', 'ses', 'mon', 'ma',
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'and',
      'in', 'on', 'at', 'for', 'with', 'it', 'this', 'that', 'je', 'tu', 'il',
      'comment', 'how', 'what', 'why', 'quand', 'when', 'where',
    ]);

    return query
      .toLowerCase()
      .replace(/[^a-zàâéèêëïîôùûüç\s'-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  /**
   * Extrait du texte lisible depuis le JSON de contenu
   */
  private extractReadableContent(parsed: any, contentType: string): string {
    switch (contentType) {
      case 'word':
        return `${parsed.english || parsed.word} = ${parsed.french || parsed.translation}${parsed.example ? ` (ex: ${parsed.example})` : ''}`;
      case 'rule':
      case 'grammar_rule':
        return `Règle: ${parsed.title || parsed.rule || ''}\n${parsed.explanation || parsed.description || ''}${parsed.example ? `\nExemple: ${parsed.example}` : ''}`;
      case 'sentence':
        return `${parsed.english || ''} → ${parsed.french || ''}`;
      case 'dialogue':
        return parsed.text || parsed.content || JSON.stringify(parsed).substring(0, 200);
      default:
        return parsed.english || parsed.text || parsed.content || JSON.stringify(parsed).substring(0, 150);
    }
  }

  /**
   * Map content_type vers RAGDocument.type
   */
  private mapContentType(ct: string): RAGDocument['type'] {
    if (ct === 'word') return 'vocabulary';
    if (ct === 'rule' || ct === 'grammar_rule') return 'grammar';
    if (ct === 'sentence') return 'sentence';
    return 'rule';
  }

  /**
   * Score de pertinence simple basé sur le nombre de mots-clés trouvés
   */
  private calculateRelevance(text: string, keywords: string[]): number {
    const lower = text.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    return score / keywords.length;
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

const ragService = new RAGService();
export default ragService;
