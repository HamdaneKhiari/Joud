/**
 * ============================================
 * MODULE CONFIGURATION
 * Déclare quels modules ont des sous-familles
 * ============================================
 */

export interface ModuleConfig {
  hasSubfamilies: boolean;
}

/**
 * Configuration des modules
 * Détermine si un module utilise le système de sous-familles
 */
export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  // ✅ AVEC SOUS-FAMILLES
  vocab: {
    hasSubfamilies: true,
  },

  phrase_types: {
    hasSubfamilies: true,
  },

  dialogues: {
    hasSubfamilies: true,
  },

  reading: {
    hasSubfamilies: true,
  },

  // ❌ SANS SOUS-FAMILLES
  word_games: {
    hasSubfamilies: false
  },

  connector: {
    hasSubfamilies: false
  }
};

/**
 * Vérifie si un module a des sous-familles
 */
export const moduleHasSubfamilies = (moduleSlug: string): boolean => {
  const config = MODULE_CONFIG[moduleSlug];
  return config?.hasSubfamilies ?? false;
};
