import aiService from '@/services/ai/aiService';
import type { ChatMessage } from './hooks/useChatConversation';
import type { DomainSummary } from './hooks/useGuidedDomainSummaries';

// ============================================
// FORMAT TEMPS RELATIF
// ============================================

export const formatRelativeTime = (timestamp: number): string => {
  const diff    = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1)  return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
};

// ============================================
// TYPE PARTAGÉ MESSAGE UI
// ============================================

export interface ChatUIMessage {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  source?: 'ai' | 'joud_academy' | 'ai_api';
  provider?: string;
}

/** Convertit un ChatMessage (SQLite) en message UI */
export const toUIMessage = (msg: ChatMessage): ChatUIMessage => ({
  id: msg.id.toString(),
  type: msg.role,
  content: msg.content,
  timestamp: new Date(msg.created_at),
  source: msg.source as ChatUIMessage['source'],
  provider: msg.provider,
});

// ============================================
// FREE SCREEN — HELPERS NIVEAU
// ============================================

export const getLevelWelcomeMessage = (level: number): string => {
  switch (level) {
    case 1: return "Pose-moi des questions simples sur l'anglais, je vais t'aider !";
    case 2: return 'Tu peux me poser des questions sur le vocabulaire, les phrases... Je suis là pour toi !';
    case 3: return "N'hésite pas à me demander des explications sur des concepts plus complexes. On va progresser ensemble !";
    case 4: return "Discutons en anglais ou en français, je m'adapte à ton niveau avancé. Let's chat!";
    default: return "Pose-moi n'importe quelle question sur l'anglais !";
  }
};

export const buildLevelAdaptedSystemPrompt = (
  level: number
): { role: 'system' | 'user' | 'assistant'; content: string } => {
  const baseTone: Record<number, string> = {
    1: 'Utilise un langage très simple et encourageant. Évite les termes complexes. Réponds en 2-3 phrases courtes maximum.',
    2: 'Utilise un langage clair et pédagogique. Tu peux introduire quelques termes techniques en les expliquant. Réponds en 3-4 phrases.',
    3: 'Utilise un langage précis. Tu peux donner des explications plus nuancées et des exemples variés. Réponds en 4-5 phrases.',
    4: "Utilise un langage riche et précis. Tu peux discuter de concepts avancés et donner des exemples variés. N'hésite pas à mélanger français et anglais si pertinent. Réponds en 5-6 phrases.",
  };
  const levelLabel: Record<number, string> = { 1: 'beginner', 2: 'intermediate', 3: 'advanced', 4: 'expert' };
  return aiService.buildSystemMessage(
    `Student level: ${level}/4 (${levelLabel[level] ?? 'intermediate'})

Tone adaptation:
${baseTone[level] || baseTone[2]}

IMPORTANT: If you detect that the question is about vocabulary that exists in Joud's lesson data, mention it so the student knows it's certified content.`
  );
};

// ============================================
// GUIDED SCREEN — HELPERS DOMAINE
// ============================================

export const buildOpeningMessage = (domain: DomainSummary): string => {
  const { stats } = domain;
  const errPart = stats.errorCount > 0 ? `Tu t'es trompé ${stats.errorCount} fois récemment. ` : '';

  switch (domain.domain) {
    case 'vocab': {
      const words = stats.recentWords?.slice(0, 3).map((w: { word: string }) => w.word).join(', ') || '';
      if (words) return `Salut ! Tu as vu récemment : *${words}*. ${errPart}On les travaille ensemble ? Envoie-moi un message pour commencer !`;
      return `Salut ! ${errPart}On travaille ton vocabulaire ? Envoie-moi un message !`;
    }
    case 'dialogues': {
      const f = stats.familiesWorked;
      return `Salut ! Tu as fait ${f} dialogue${f > 1 ? 's' : ''}. ${errPart}On peut approfondir un thème ou en pratiquer un nouveau. Qu'est-ce qui t'intéresse ?`;
    }
    case 'reading': {
      const f = stats.familiesWorked;
      return `Salut ! Tu as lu ${f} texte${f > 1 ? 's' : ''}. ${errPart}On peut travailler la compréhension ou découvrir un nouveau texte. Que préfères-tu ?`;
    }
    case 'phrase_types': {
      const c = stats.completedCount;
      return `Salut ! Tu as construit ${c} phrase${c > 1 ? 's' : ''}. ${errPart}On continue à s'entraîner ? Envoie-moi un message !`;
    }
    default:
      return `Salut ! On travaille ensemble sur ce domaine ? Envoie-moi un message pour commencer !`;
  }
};

export const buildDomainSystemPrompt = (
  domain: DomainSummary,
  level: number
): { role: 'system' | 'user' | 'assistant'; content: string } => {
  const errorContext = domain.stats.errorExamples.length > 0
    ? `\nErreurs récentes : ${domain.stats.errorExamples
        .slice(0, 3)
        .map((e: { question: string; userAnswer: string; correctAnswer: string }) =>
          `"${e.question}" (réponse: "${e.userAnswer}", correct: "${e.correctAnswer}")`
        )
        .join('; ')}`
    : '';

  return aiService.buildSystemMessage(
    `Tu es un coach d'anglais bienveillant et concis. L'élève est niveau ${level}/4.\n` +
    `Domaine : ${domain.label}.${errorContext}\n` +
    `Réponds en français. Sois concis (max 100 mots). Propose des exercices interactifs adaptés au domaine.`
  );
};