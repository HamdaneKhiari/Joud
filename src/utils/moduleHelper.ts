/**
 * Module Helper - Gestion des modules via la base de données
 * 100% White Label - Plus aucun hardcoding
 */

import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { getIdentityPalette } from '@/database/queries';
import { useState, useEffect } from 'react';

// ============================================
// HOOKS POUR RÉCUPÉRER LES DONNÉES (DB)
// ============================================

/**
 * Hook pour récupérer la palette de couleurs d'une identité
 */
export const useIdentityPalette = (): string[] => {
  const { db } = useUser();
  const { currentApp } = useTheme();
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    const loadPalette = async () => {
      if (!db) return;

      try {
        const colors = await getIdentityPalette(db, currentApp);
        setPalette(colors);
      } catch (error) {
        console.error('Error loading identity palette:', error);
        setPalette([]);
      }
    };

    loadPalette();
  }, [db, currentApp]);

  return palette;
};

/**
 * Récupère la couleur d'un module selon l'identité
 * Utilise la palette de couleurs de la DB basée sur l'ordre du module
 */
export const getModuleColor = async (
  moduleSlug: string,
  identityId: string,
  db: any,
  availableModules: string[]
): Promise<string> => {
  if (!db) {
    return '#34495E'; // Fallback
  }

  try {
    const palette = await getIdentityPalette(db, identityId);
    
    if (palette.length === 0) {
      return '#34495E'; // Fallback
    }

    // Mapping des modules vers un index basé sur leur ordre dans availableModules
    const moduleIndex = availableModules.indexOf(moduleSlug);
    const colorIndex = moduleIndex >= 0 ? moduleIndex % palette.length : 0;

    return palette[colorIndex] || palette[0];
  } catch (error) {
    console.error('Error in getModuleColor:', error);
    return '#34495E';
  }
};

/**
 * Récupère l'icône d'un module depuis la DB
 * Utilise module_labels ou fallback vers modules.icon_name
 */
export const getModuleIcon = async (
  moduleSlug: string,
  identityId: string,
  db: any
): Promise<string> => {
  if (!db) {
    return 'book';
  }

  try {
    const { getModuleLabelWithFallback } = await import('@/database/queries');
    const moduleLabel = await getModuleLabelWithFallback(db, moduleSlug, identityId);
    return moduleLabel.icon_name;
  } catch (error) {
    console.error('Error in getModuleIcon:', error);
    return 'book';
  }
};

/**
 * Vérifie si un niveau existe pour une identité
 * Basé sur les niveaux dans la table levels avec target_audience
 */
export const isValidLevel = async (
  levelNumber: number,
  identityId: string,
  db: any
): Promise<boolean> => {
  if (!db) {
    return levelNumber >= 1 && levelNumber <= 4; // Fallback conservateur
  }

  try {
    const levels = await db.getAllAsync<{ level: number }>(
      `SELECT level FROM levels WHERE level = ? AND (target_audience = ? OR target_audience = 'all')`,
      [levelNumber, identityId]
    );
    return levels.length > 0;
  } catch (error) {
    console.error('Error in isValidLevel:', error);
    return levelNumber >= 1 && levelNumber <= 4;
  }
};

/**
 * Récupère le nombre maximum de niveaux pour une identité
 */
export const getMaxLevels = async (
  identityId: string,
  db: any
): Promise<number> => {
  if (!db) {
    return 4; // Fallback
  }

  try {
    const levels = await db.getAllAsync<{ level: number }>(
      `SELECT DISTINCT level FROM levels WHERE target_audience = ? OR target_audience = 'all' ORDER BY level DESC LIMIT 1`,
      [identityId]
    );
    return levels.length > 0 ? levels[0].level : 4;
  } catch (error) {
    console.error('Error in getMaxLevels:', error);
    return 4;
  }
};
