/**
 * Label Mapper - Mapping dynamique des labels depuis la base de données
 * 100% White Label - Plus aucun hardcoding
 */

import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { 
  getModuleLabelWithFallback, 
  getAvailableModules as getAvailableModulesFromDB
} from '@/database/queries';
import { useState, useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';

// ============================================
// TYPES
// ============================================

export interface ModuleLabel {
  title: string;
  description: string;
  icon: string;
}

export interface LevelLabel {
  title: string;
  badge: string;
  description: string;
}

// ============================================
// HOOKS POUR RÉCUPÉRER LES LABELS (DB)
// ============================================

/**
 * Hook pour récupérer le label d'un module depuis la DB
 */
export const useModuleLabel = (moduleSlug: string): ModuleLabel => {
  const { db } = useUser();
  const { currentApp } = useTheme();
  const [label, setLabel] = useState<ModuleLabel>({
    title: moduleSlug,
    description: 'Module',
    icon: 'book'
  });

  useEffect(() => {
    const loadLabel = async () => {
      // ✅ Sécurité : on vérifie que db est un objet valide (SharedObject)
      if (!db || typeof db === 'number' || !moduleSlug) return;

      try {
        const moduleLabel = await getModuleLabelWithFallback(db, moduleSlug, currentApp);
        setLabel({
          title: moduleLabel.display_title,
          description: moduleLabel.display_description,
          icon: moduleLabel.icon_name
        });
      } catch (error) {
        const errorMsg = String(error);
        // ✅ Silence les erreurs de DB fermée (auto-reset en DEV)
        if (!errorMsg.includes('shared object') && !errorMsg.includes('NativeStatement')) {
          console.error('Error loading module label:', error);
        }
      }
    };

    loadLabel();
  }, [db, moduleSlug, currentApp]);

  return label;
};

/**
 * Hook pour récupérer le label d'un niveau depuis la DB
 */
export const useLevelLabel = (levelNumber: number, familyId?: string): LevelLabel => {
  const { db } = useUser();
  const { currentApp } = useTheme();
  const [label, setLabel] = useState<LevelLabel>({
    title: `Niveau ${levelNumber}`,
    badge: `N${levelNumber}`,
    description: 'Niveau'
  });

  useEffect(() => {
    const loadLabel = async () => {
      // ✅ Sécurité : on vérifie que db est un objet valide (SharedObject)
      if (!db || typeof db === 'number' || !levelNumber) return;

      try {
        // Utilise la fonction getLevelLabel mise à jour qui gère le familyId
        const levelLabel = await getLevelLabel(db, levelNumber, currentApp, familyId);
        setLabel(levelLabel);
      } catch (error) {
        const errorMsg = String(error);
        // ✅ Silence les erreurs de DB fermée (auto-reset en DEV)
        if (!errorMsg.includes('shared object') && !errorMsg.includes('NativeStatement')) {
          console.error('Error loading level label:', error);
        }
      }
    };

    loadLabel();
  }, [db, levelNumber, currentApp, familyId]);

  return label;
};

// ============================================
// FONCTIONS ASYNCHRONES (CORRIGÉES : db en 1er)
// ============================================

/**
 * Récupère le label d'un module selon l'identité
 * ✅ CORRIGÉ : db est maintenant le premier argument
 */
export const getModuleLabel = async (
  db: SQLiteDatabase | null,
  moduleSlug: string,
  identityId: string
): Promise<ModuleLabel> => {
  // ✅ Protection renforcée contre les DB invalides
  if (!db || typeof db === 'number') {
    return { title: moduleSlug, description: 'Module', icon: 'book' };
  }

  try {
    const moduleLabel = await getModuleLabelWithFallback(db, moduleSlug, identityId);
    return {
      title: moduleLabel.display_title,
      description: moduleLabel.display_description,
      icon: moduleLabel.icon_name
    };
  } catch (error) {
    const errorMsg = String(error);
    // ✅ Silence les erreurs de DB fermée (auto-reset en DEV)
    if (!errorMsg.includes('shared object') && !errorMsg.includes('NativeStatement')) {
      console.error('Error in getModuleLabel:', error);
    }
    return { title: moduleSlug, description: 'Module', icon: 'book' };
  }
};

/**
 * Récupère le label d'un niveau selon l'identité
 * ✅ CORRIGÉ : db est maintenant le premier argument
 */
export const getLevelLabel = async (
  db: SQLiteDatabase | null,
  levelNumber: number,
  identityId: string,
  familyId?: string
): Promise<LevelLabel> => {
  // ✅ Protection renforcée contre les DB invalides
  if (!db || typeof db === 'number') {
    return { title: `Niveau ${levelNumber}`, badge: `N${levelNumber}`, description: 'Niveau' };
  }

  try {
    // 1. Construction de la requête pour level_labels
    // Si familyId est présent, on cherche la sous-famille (family_id = ?)
    // Sinon, on cherche le niveau global (family_id IS NULL) pour éviter les conflits
    let query = `
      SELECT display_title, badge_text, display_description 
      FROM level_labels 
      WHERE level_number = ? AND identity_id = ?
    `;
    const params: any[] = [levelNumber, identityId];

    if (familyId) {
      query += ` AND family_id = ?`;
      params.push(familyId);
    } else {
      query += ` AND family_id IS NULL`;
    }

    const label = await db.getFirstAsync<{
      display_title: string;
      badge_text: string;
      display_description: string;
    }>(query, params);

    if (label) {
      return {
        title: label.display_title,
        badge: label.badge_text,
        description: label.display_description
      };
    }

    // 2. Fallback vers la table levels (uniquement pour les niveaux globaux)
    if (!familyId) {
      const fallbackLabel = await db.getFirstAsync<{
        title: string;
        badge: string;
        description: string;
      }>(
        `SELECT title, badge, description FROM levels WHERE level = ?`,
        [levelNumber]
      );
      
      if (fallbackLabel) {
        return {
          title: fallbackLabel.title,
          badge: fallbackLabel.badge,
          description: fallbackLabel.description
        };
      }
    }

    return { title: `Niveau ${levelNumber}`, badge: `N${levelNumber}`, description: 'Niveau' };
  } catch (error) {
    const errorMsg = String(error);
    // ✅ Silence les erreurs de DB fermée (auto-reset en DEV)
    if (!errorMsg.includes('shared object') && !errorMsg.includes('NativeStatement')) {
      console.error('Error in getLevelLabel:', error);
    }
    return { title: `Niveau ${levelNumber}`, badge: `N${levelNumber}`, description: 'Niveau' };
  }
};

/**
 * Récupère la liste des modules disponibles
 * ✅ CORRIGÉ : db est maintenant le premier argument
 */
export const getAvailableModules = async (
  db: SQLiteDatabase | null,
  identityId: string,
  levelNumber: number
): Promise<string[]> => {
  // ✅ Protection renforcée contre les DB invalides
  if (!db || typeof db === 'number') return [];

  try {
    return await getAvailableModulesFromDB(db, identityId, levelNumber);
  } catch (error) {
    const errorMsg = String(error);
    // ✅ Silence les erreurs de DB fermée (auto-reset en DEV)
    if (!errorMsg.includes('shared object') && !errorMsg.includes('NativeStatement')) {
      console.error('Error in getAvailableModules:', error);
    }
    return [];
  }
};

/**
 * Vérifie si un module est disponible
 * ✅ CORRIGÉ : db est maintenant le premier argument
 */
export const isModuleAvailable = async (
  db: SQLiteDatabase | null,
  moduleSlug: string,
  identityId: string,
  levelNumber: number
): Promise<boolean> => {
  const availableModules = await getAvailableModules(db, identityId, levelNumber);
  return availableModules.includes(moduleSlug);
};