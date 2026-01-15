/**
 * Badge Helper - Gestion des badges de progression
 */

import type { Identity } from '@/themes/ThemeContext';

// ============================================
// TYPES
// ============================================

export type BadgeType = 'or' | 'argent' | 'bronze' | 'nouveau' | null;

export interface BadgeConfig {
  label: string;
  color: string;
}

// ============================================
// CONFIGURATION BADGES PAR IDENTITÉ
// ============================================

/**
 * Récupère la configuration d'un badge selon l'identité
 */
export const getBadgeConfig = (
  badge: BadgeType,
  identity: Identity
): BadgeConfig | null => {
  if (!badge) return null;

  const configs: Record<BadgeType, BadgeConfig> = {
    or: {
      label: identity.id === 'lycee' ? 'GOLD' : 'OR', // ✅ No-Media Premium
      color: '#10B981' // Vert succès
    },
    argent: {
      label: identity.id === 'lycee' ? 'SILVER' : 'ARGENT', // ✅ No-Media Premium
      color: identity.branding.accent // Couleur accent de l'identité
    },
    bronze: {
      label: 'BRONZE', // ✅ No-Media Premium (identique FR/EN)
      color: '#F59E0B' // Orange
    },
    nouveau: {
      label: identity.id === 'lycee' ? 'NEW' : 'NOUVEAU',
      color: identity.branding.main // Couleur principale
    },
    null: {
      label: '',
      color: '#6B7280'
    }
  };

  return configs[badge] || null;
};

/**
 * Détermine le badge en fonction du pourcentage de progression
 * @param progress - Pourcentage de 0 à 100
 * @returns Badge type
 */
export const getBadgeByProgress = (progress: number): BadgeType => {
  if (progress >= 100) return 'or';       // 100% = OR
  if (progress >= 70) return 'argent';    // 70-99% = ARGENT
  if (progress >= 30) return 'bronze';    // 30-69% = BRONZE
  if (progress > 0) return 'nouveau';     // 1-29% = NOUVEAU/EN COURS
  return null;                             // 0% = Rien
};

/**
 * Récupère la couleur d'un badge directement (helper rapide)
 */
export const getBadgeColor = (
  badge: BadgeType,
  identity: Identity
): string => {
  const config = getBadgeConfig(badge, identity);
  return config?.color || '#6B7280';
};

/**
 * Récupère le label d'un badge directement (helper rapide)
 */
export const getBadgeLabel = (
  badge: BadgeType,
  identity: Identity
): string => {
  const config = getBadgeConfig(badge, identity);
  return config?.label || '';
};

/**
 * Vérifie si un item est complété
 */
export const isCompleted = (progress: number): boolean => {
  return progress >= 100;
};

/**
 * Vérifie si un item est en cours
 */
export const isInProgress = (progress: number): boolean => {
  return progress > 0 && progress < 100;
};

/**
 * Vérifie si un item est nouveau/non commencé
 */
export const isNew = (progress: number): boolean => {
  return progress === 0;
};
