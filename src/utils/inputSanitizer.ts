/**
 * Sanitisation des inputs utilisateur avant injection dans les prompts AI
 * Protège contre le prompt injection basique
 */

/**
 * Nettoie un texte libre avant de l'envoyer à l'IA.
 * - Supprime les caractères de contrôle (null bytes, etc.)
 * - Tronque à une longueur maximale
 * - Ne filtre PAS le contenu : les LLMs modernes gèrent le prompt injection
 *   au niveau du system prompt, pas au niveau du contenu utilisateur
 */
export function sanitizeUserInput(input: string, maxLength = 2000): string {
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // contrôle sauf \t \n \r
    .trim()
    .substring(0, maxLength);
}

/**
 * Sanitise un texte d'exercice (réponse courte)
 * Limite plus stricte — les réponses d'exercice ne dépassent pas 500 chars
 */
export function sanitizeExerciseInput(input: string): string {
  return sanitizeUserInput(input, 500);
}
