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
      // Sécurité : on vérifie que db est un objet valide (SharedObject)
      if (!db || typeof db === 'number' || !moduleSlug) return;

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
      if (!db || typeof db === 'number' || !levelNumber) return;

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
    console.error('Error in getModuleLabel:', error);
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
  identityId: string
): Promise<LevelLabel> => {
  if (!db || typeof db === 'number') {
    return { title: `Niveau ${levelNumber}`, badge: `N${levelNumber}`, description: 'Niveau' };
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
  if (!db || typeof db === 'number') return [];

  try {
    return await getAvailableModulesFromDB(db, identityId, levelNumber);
  } catch (error) {
    console.error('Error in getAvailableModules:', error);
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