// Helpers partagés entre les modes free et tiles du module phrase_types (traduction / reconstruction)

import type { SentenceData } from '@/hooks/exercises/useExerciseContent';

export interface TileToken {
  id: string;
  text: string;
}

const TRAILING_PUNCTUATION_REGEX = /[.,!?;]+$/;

/**
 * Reconstitue la phrase anglaise attendue : phrase_en direct,
 * ou reconstituée depuis sentence + correct_answer (mode blanks -> free/tiles).
 */
export const getExpectedPhraseEn = (
  data: Pick<SentenceData, 'phrase_en' | 'sentence' | 'correctAnswer' | 'correct_answer'>
): string => {
  if (data.phrase_en) return data.phrase_en;
  if (data.sentence && (data.correctAnswer || data.correct_answer)) {
    return data.sentence.replaceAll('___', data.correctAnswer || data.correct_answer || '');
  }
  return '';
};

/**
 * Normalise une phrase pour comparaison : casse, ponctuation, espaces
 * et apostrophes typographiques iOS/Android (’ / ‘) ramenées à l'apostrophe droite (').
 */
export const cleanPhrase = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replaceAll(/[’‘]/g, "'")
    .replaceAll(/[.,!?;]/g, '')
    .replaceAll(/\s+/g, ' ');

/**
 * Découpe une phrase anglaise en tuiles pour le mode tiles.
 * Les contractions (don't, I'm, it's) restent des tokens uniques.
 * La ponctuation finale est extraite séparément (affichage décoratif).
 */
export const tokenizePhraseForTiles = (
  phraseEn: string
): { tokens: TileToken[]; trailingPunctuation: string } => {
  const trimmed = phraseEn.trim();
  const match = trimmed.match(TRAILING_PUNCTUATION_REGEX);
  const trailingPunctuation = match ? match[0] : '';
  const withoutPunctuation = trailingPunctuation
    ? trimmed.slice(0, trimmed.length - trailingPunctuation.length)
    : trimmed;

  const tokens = withoutPunctuation
    .split(/\s+/)
    .filter(Boolean)
    .map((text, index) => ({ id: `tile-${index}`, text }));

  return { tokens, trailingPunctuation };
};

/**
 * Mélange les tuiles, avec garde-fou : si l'ordre mélangé égale
 * l'ordre correct, re-mélange (max 5 essais) puis inverse deux
 * tuiles en dernier recours.
 */
export const shuffleTiles = (tokens: TileToken[]): TileToken[] => {
  if (tokens.length < 2) return [...tokens];

  const originalOrder = tokens.map((t) => t.id).join('|');
  let shuffled = tokens;

  for (let attempt = 0; attempt < 5; attempt++) {
    shuffled = [...tokens];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.map((t) => t.id).join('|') !== originalOrder) {
      return shuffled;
    }
  }

  shuffled = [...tokens];
  [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  return shuffled;
};
