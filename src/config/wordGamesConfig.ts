/**
 * ============================================
 * WORD GAMES CONFIG
 * Dispatch des types de jeux par public
 * ============================================
 *
 * Règle pédagogique validée :
 *   primary  → fondamentaux visuels/audio (4 jeux)
 *   college  → + analyse syntaxique et grammaire (6 jeux)
 *   lycee    → tous les 8 jeux
 *   adult    → tous les 8 jeux
 *
 * Note sur blanks/primary : doublon volontaire avec phrase_types.
 * Le blanks en word_games = contexte ludique (récré),
 * le blanks en phrase_types = contexte pédagogique (cours).
 * Contenu distinct entre les deux modules.
 */

import type { GameType } from '@/screens/WordGames/schema';

// ============================================
// TYPES
// ============================================

export type AudienceSlug = 'primary' | 'college' | 'lycee' | 'adult';

// ============================================
// DISPATCH PAR PUBLIC
// ============================================

export const WORD_GAMES_BY_AUDIENCE: Record<AudienceSlug, GameType[]> = {
  primary: [
    'definition',   // Vocabulaire visuel (emoji + définition)
    'audio_match',  // Écoute active (TTS + image) — pilier primaire
    'speed',        // Réflexe EN↔FR — engagement ludique
    'blanks',       // Phrase à trous courte — renforce phrase_types en mode jeu
  ],

  college: [
    'definition',
    'audio_match',
    'speed',
    'blanks',
    'sentence',     // Remettre les mots dans l'ordre — syntaxe
    'detective',    // Trouver l'erreur — conscience grammaticale
  ],

  lycee: [
    'definition',
    'audio_match',
    'speed',
    'blanks',
    'sentence',
    'detective',
    'transformer',  // Déclinaison morphologique (verbes, formes)
    'reply',        // Réponse situationnelle — communication quotidienne
  ],

  adult: [
    'definition',
    'audio_match',  // Prononciation — utile à tous niveaux
    'speed',
    'blanks',
    'sentence',
    'detective',
    'transformer',
    'reply',        // Communication professionnelle / quotidienne
  ],
};

// ============================================
// HELPERS
// ============================================

/**
 * Retourne les types de jeux autorisés pour un public donné
 */
export const getGameTypesForAudience = (audience: string): GameType[] => {
  return WORD_GAMES_BY_AUDIENCE[audience as AudienceSlug] ?? WORD_GAMES_BY_AUDIENCE.adult;
};

/**
 * Vérifie si un type de jeu est disponible pour un public donné
 */
export const isGameTypeAvailableFor = (gameType: GameType, audience: string): boolean => {
  return getGameTypesForAudience(audience).includes(gameType);
};

/**
 * Nombre de jeux par public (pour affichage stats)
 */
export const GAME_COUNT_BY_AUDIENCE: Record<AudienceSlug, number> = {
  primary: WORD_GAMES_BY_AUDIENCE.primary.length,
  college: WORD_GAMES_BY_AUDIENCE.college.length,
  lycee:   WORD_GAMES_BY_AUDIENCE.lycee.length,
  adult:   WORD_GAMES_BY_AUDIENCE.adult.length,
};
