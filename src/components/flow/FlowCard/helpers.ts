/**
 * FlowCard Helpers - Utilitaires pour FlowCard
 */

/**
 * Détermine si une string est un emoji ou un nom d'icône
 */
export const isEmoji = (str: string): boolean => {
  const iconNamePattern = /^[a-z0-9-]+$/;
  return !iconNamePattern.test(str);
};
