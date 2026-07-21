/**
 * ============================================
 * PHRASE MODES CONFIG
 * Dispatch du mode d'exercice phrase_types par public
 * ============================================
 *
 * primary  → blanks (QCM à trou, guidé)
 * college  → tiles  (reconstruction de phrase par tuiles)
 * lycee    → free   (saisie libre FR→EN)
 * adult    → free
 */

export type PhraseMode = 'blanks' | 'tiles' | 'free';
export type AudienceSlug = 'primary' | 'college' | 'lycee' | 'adult';

export const PHRASE_MODE_BY_AUDIENCE: Record<AudienceSlug, PhraseMode> = {
  primary: 'blanks',
  college: 'tiles',
  lycee: 'free',
  adult: 'free',
};

/**
 * Retourne le mode d'exercice demandé pour un public donné.
 * Le fallback vers 'free' est appliqué au niveau de l'écran selon
 * la disponibilité des données (voir SentenceExerciceScreen).
 */
export const getPhraseModeForAudience = (audience: string): PhraseMode => {
  return PHRASE_MODE_BY_AUDIENCE[audience as AudienceSlug] ?? 'free';
};
