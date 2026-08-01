/**
 * Label Mapper - Mapping dynamique des labels depuis la base de données
 * 100% White Label - Plus aucun hardcoding
 */

import { log } from '@/utils/logUtils';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { 
  getModuleLabelWithFallback, 
  getAvailableModules as getAvailableModulesFromDB
} from '@/database/queries';
import { useState, useEffect } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';

// Erreurs de fermeture de DB natives lors d'un hot-reload en DEV (bénignes, jamais en prod
// puisque log.error n'est pas coupé par __DEV__ — voir logUtils.ts). En prod, on logue tout,
// même un message qui contiendrait ces mots par coïncidence : mieux vaut un faux positif
// bruyant qu'une vraie erreur avalée en silence.
const isBenignDevDbError = (error: unknown): boolean => {
  if (!__DEV__) return false;
  const errorMsg = String(error);
  return errorMsg.includes('shared object') || errorMsg.includes('NativeStatement');
};

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
      if (!db || typeof db === 'number' || !moduleSlug) return;

      try {
        const moduleLabel = await getModuleLabelWithFallback(db, moduleSlug, currentApp);
        setLabel({
          title: moduleLabel.display_title,
          description: moduleLabel.display_description,
          icon: moduleLabel.icon_name
        });
      } catch (error) {
        if (!isBenignDevDbError(error)) {
          log.error('Error loading module label:', error);
        }
      }
    };

    loadLabel();
  }, [db, moduleSlug, currentApp]);

  return label;
};

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
      if (!db || typeof db === 'number' || !levelNumber) return;

      try {
        const levelLabel = await getLevelLabel(db, levelNumber, currentApp, familyId);
        setLabel(levelLabel);
      } catch (error) {
        if (!isBenignDevDbError(error)) {
          log.error('Error loading level label:', error);
        }
      }
    };

    loadLabel();
  }, [db, levelNumber, currentApp, familyId]);

  return label;
};

export const getModuleLabel = async (
  db: SQLiteDatabase | null,
  moduleSlug: string,
  identityId: string
): Promise<ModuleLabel> => {
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
    if (!isBenignDevDbError(error)) {
      log.error('Error in getModuleLabel:', error);
    }
    return { title: moduleSlug, description: 'Module', icon: 'book' };
  }
};

export const getLevelLabel = async (
  db: SQLiteDatabase | null,
  levelNumber: number,
  identityId: string,
  familyId?: string
): Promise<LevelLabel> => {
  if (!db || typeof db === 'number') {
    return { title: `Niveau ${levelNumber}`, badge: `N${levelNumber}`, description: 'Niveau' };
  }

  try {
    // Si familyId est présent, on cherche le label de la sous-famille (family_id = ?),
    // sinon celui du niveau global (family_id IS NULL) pour éviter les conflits
    let query = `
      SELECT display_title, badge_text, display_description 
      FROM level_labels 
      WHERE level_number = ? AND identity_id = ?
    `;
    const params: (string | number)[] = [levelNumber, identityId];

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

    // Fallback vers la table levels (uniquement pour les niveaux globaux)
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
    if (!isBenignDevDbError(error)) {
      log.error('Error in getLevelLabel:', error);
    }
    return { title: `Niveau ${levelNumber}`, badge: `N${levelNumber}`, description: 'Niveau' };
  }
};

export const getAvailableModules = async (
  db: SQLiteDatabase | null,
  identityId: string,
  levelNumber: number
): Promise<string[]> => {
  if (!db || typeof db === 'number') return [];

  try {
    return await getAvailableModulesFromDB(db, identityId, levelNumber);
  } catch (error) {
    if (!isBenignDevDbError(error)) {
      log.error('Error in getAvailableModules:', error);
    }
    return [];
  }
};

export const isModuleAvailable = async (
  db: SQLiteDatabase | null,
  moduleSlug: string,
  identityId: string,
  levelNumber: number
): Promise<boolean> => {
  const availableModules = await getAvailableModules(db, identityId, levelNumber);
  return availableModules.includes(moduleSlug);
};