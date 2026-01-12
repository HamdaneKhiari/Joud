/**
 * FlowCard Helpers - Couleurs dynamiques des badges
 */

import type { Identity } from '@/themes/identities';
import type { BadgeType } from '@/utils/badgeHelper';

/**
 * Détermine la couleur de fond du badge en fonction de son contenu
 */
export const getBadgeColor = (badge: string | null, identity: Identity): string => {
  if (!badge) return identity.branding.main;

  const lowerCaseBadge = badge.toLowerCase();

  // Badge doré/terminé - Vert succès
  if (lowerCaseBadge.includes('⭐') || lowerCaseBadge.includes('terminé') || lowerCaseBadge.includes('or') || lowerCaseBadge.includes('gold')) {
    return '#10B981';
  }

  // Badge en cours/nouveau - Couleur principale
  if (lowerCaseBadge.includes('nouveau') || lowerCaseBadge.includes('new') || lowerCaseBadge.includes('en cours')) {
    return identity.branding.main;
  }

  // Badge bloqué - Gris
  if (lowerCaseBadge.includes('bloqué') || lowerCaseBadge.includes('verrouillé') || lowerCaseBadge.includes('locked')) {
    return '#6B7280';
  }

  // Badge argent - Couleur accent
  if (lowerCaseBadge.includes('argent') || lowerCaseBadge.includes('silver')) {
    return identity.branding.accent;
  }

  // Badge bronze - Orange
  if (lowerCaseBadge.includes('bronze')) {
    return '#F59E0B';
  }

  // Par défaut - Couleur principale
  return identity.branding.main;
};
