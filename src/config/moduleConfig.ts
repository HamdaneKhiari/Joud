/**
 * ============================================
 * MODULE CONFIGURATION
 * Déclare quels modules ont des sous-familles
 * ============================================
 */

export interface ModuleConfig {
  hasSubfamilies: boolean;
  requiresSubfamilyForAllFamilies?: boolean; // Si true, TOUTES les familles de ce module ont des subfamilies
}

/**
 * Configuration des modules
 * Détermine si un module utilise le système de sous-familles
 */
export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  // ✅ AVEC SOUS-FAMILLES
  vocab: {
    hasSubfamilies: true,
    requiresSubfamilyForAllFamilies: false // Certaines familles peuvent ne pas en avoir (ex: Colors)
  },

  phrase_types: {
    hasSubfamilies: true,
    requiresSubfamilyForAllFamilies: true // Toutes les familles de phrases ont des subfamilies
  },

  grammar: {
    hasSubfamilies: true,
    requiresSubfamilyForAllFamilies: true // Toutes les familles de grammaire ont des subfamilies
  },

  dialogues: {
    hasSubfamilies: true,
    requiresSubfamilyForAllFamilies: true // Toutes les conversations ont des subfamilies
  },

  reading: {
    hasSubfamilies: true,
    requiresSubfamilyForAllFamilies: false // Peut-être pas toutes les familles (si < 10 textes)
  },

  // ❌ SANS SOUS-FAMILLES
  word_games: {
    hasSubfamilies: false
  },

  connector: {
    hasSubfamilies: false
  },

  assessment: {
    hasSubfamilies: false
  },

  fastvocab: {
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

/**
 * Vérifie si une famille spécifique a des sous-familles
 * (À utiliser avec la DB pour vérifier dynamiquement)
 */
export const familyHasSubfamilies = async (
  db: any,
  familyId: number
): Promise<boolean> => {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM level_labels WHERE family_id = ?`,
      [familyId]
    );
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('[moduleConfig] Error checking subfamily:', error);
    return false;
  }
};
