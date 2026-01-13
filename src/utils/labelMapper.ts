/**
 * Label Mapper - Mapping dynamique des labels depuis la base de données
 * 100% White Label - Plus aucun hardcoding
 */

import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { 
  getModuleLabelWithFallback, 
  getLevelLabelWithFallback,
  getAvailableModules as getAvailableModulesFromDB
} from '@/database/queries';
import { useState, useEffect } from 'react';

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
      if (!db || !moduleSlug) return;

      try {
        const moduleLabel = await getModuleLabelWithFallback(db, moduleSlug, currentApp);
        setLabel({
          title: moduleLabel.display_title,
          description: moduleLabel.display_description,
          icon: moduleLabel.icon_name
        });
      } catch (error) {
        console.error('Error loading module label:', error);
      }
    };

    loadLabel();
  }, [db, moduleSlug, currentApp]);

  return label;
};

/**
 * Hook pour récupérer le label d'un niveau depuis la DB
 */
export const useLevelLabel = (levelNumber: number): LevelLabel => {
  const { db } = useUser();
  const { currentApp } = useTheme();
  const [label, setLabel] = useState<LevelLabel>({
    title: `Niveau ${levelNumber}`,
    badge: `N${levelNumber}`,
    description: 'Niveau'
  });

  useEffect(() => {
    const loadLabel = async () => {
      if (!db || !levelNumber) return;

      try {
        const levelLabel = await getLevelLabelWithFallback(db, levelNumber, currentApp);
        setLabel({
          title: levelLabel.display_title,
          badge: levelLabel.badge_text,
          description: levelLabel.display_description
        });
      } catch (error) {
        console.error('Error loading level label:', error);
      }
    };

    loadLabel();
  }, [db, levelNumber, currentApp]);

  return label;
};

// ============================================
// FONCTIONS SYNCHRONES (pour compatibilité)
// ============================================

/**
 * Récupère le label d'un module selon l'identité (synchronisé)
 * ⚠️ Utilise useModuleLabel dans les composants React pour la réactivité
 */
export const getModuleLabel = async (
  moduleSlug: string,
  identityId: string,
  db: any
): Promise<ModuleLabel> => {
  if (!db) {
    return {
      title: moduleSlug,
      description: 'Module',
      icon: 'book'
    };
  }

  try {
    const moduleLabel = await getModuleLabelWithFallback(db, moduleSlug, identityId);
    return {
      title: moduleLabel.display_title,
      description: moduleLabel.display_description,
      icon: moduleLabel.icon_name
    };
  } catch (error) {
    console.error('Error in getModuleLabel:', error);
    return {
      title: moduleSlug,
      description: 'Module',
      icon: 'book'
    };
  }
};

/**
 * Récupère le label d'un niveau selon l'identité (synchronisé)
 * ⚠️ Utilise useLevelLabel dans les composants React pour la réactivité
 */
export const getLevelLabel = async (
  levelNumber: number,
  identityId: string,
  db: any
): Promise<LevelLabel> => {
  if (!db) {
    return {
      title: `Niveau ${levelNumber}`,
      badge: `N${levelNumber}`,
      description: 'Niveau'
    };
  }

  try {
    const levelLabel = await getLevelLabelWithFallback(db, levelNumber, identityId);
    return {
      title: levelLabel.display_title,
      badge: levelLabel.badge_text,
      description: levelLabel.display_description
    };
  } catch (error) {
    console.error('Error in getLevelLabel:', error);
    return {
      title: `Niveau ${levelNumber}`,
      badge: `N${levelNumber}`,
      description: 'Niveau'
    };
  }
};

/**
 * Récupère la liste des modules disponibles pour une identité et un niveau
 * 100% SQL - Plus de hardcoding
 */
export const getAvailableModules = async (
  identityId: string,
  levelNumber: number,
  db: any
): Promise<string[]> => {
  if (!db) {
    return [];
  }

  try {
    return await getAvailableModulesFromDB(db, identityId, levelNumber);
  } catch (error) {
    console.error('Error in getAvailableModules:', error);
    return [];
  }
};

/**
 * Vérifie si un module est disponible pour une identité/niveau
 */
export const isModuleAvailable = async (
  moduleSlug: string,
  identityId: string,
  levelNumber: number,
  db: any
): Promise<boolean> => {
  const availableModules = await getAvailableModules(identityId, levelNumber, db);
  return availableModules.includes(moduleSlug);
};
