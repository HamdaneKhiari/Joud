/**
 * Module Helper - Gestion des modules via la base de données
 * 100% White Label - Plus aucun hardcoding
 */

import { log } from '@/utils/logUtils';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { getIdentityPalette } from '@/database/queries';
import { useState, useEffect } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

type DB = SQLiteDatabase | number | null | undefined;

// Cache simple pour éviter les requêtes SQL répétitives sur les palettes
const globalPaletteCache: Record<string, string[]> = {};

const getCachedPalette = async (db: DB, identityId: string): Promise<string[]> => {
  if (globalPaletteCache[identityId]) {
    return globalPaletteCache[identityId];
  }
  if (!db || typeof db === 'number') return [];
  const palette = await getIdentityPalette(db, identityId);
  if (palette && palette.length > 0) {
    globalPaletteCache[identityId] = palette;
  }
  return palette;
};

export const useIdentityPalette = (): string[] => {
  const { db } = useUser();
  const { currentApp } = useTheme();
  // Init avec le cache si dispo pour éviter le flash
  const [palette, setPalette] = useState<string[]>(globalPaletteCache[currentApp] || []);

  useEffect(() => {
    const loadPalette = async () => {
      if (!db || typeof db === 'number') return;

      try {
        const colors = await getCachedPalette(db, currentApp);
        setPalette(colors);
      } catch (error) {
        log.error('Error loading identity palette:', error);
        setPalette([]);
      }
    };

    loadPalette();
  }, [db, currentApp]);

  return palette;
};

// Couleur d'un module dérivée de son index dans availableModules, mappé sur la palette de l'identité
export const getModuleColor = async (
  moduleSlug: string,
  identityId: string,
  db: DB,
  availableModules: string[]
): Promise<string> => {
  if (!db || typeof db === 'number') {
    return '#34495E'; // Fallback
  }

  try {
    const palette = await getCachedPalette(db, identityId);
    
    if (palette.length === 0) {
      return '#34495E'; // Fallback
    }

    const moduleIndex = availableModules.indexOf(moduleSlug);
    const colorIndex = moduleIndex >= 0 ? moduleIndex % palette.length : 0;

    return palette[colorIndex] || palette[0];
  } catch (error) {
    log.error('Error in getModuleColor:', error);
    return '#34495E';
  }
};

export const getModuleIcon = async (
  moduleSlug: string,
  identityId: string,
  db: DB
): Promise<string> => {
  if (!db || typeof db === 'number') {
    return 'book';
  }

  try {
    const { getModuleLabelWithFallback } = await import('@/database/queries');
    const moduleLabel = await getModuleLabelWithFallback(db, moduleSlug, identityId);
    return moduleLabel.icon_name;
  } catch (error) {
    log.error('Error in getModuleIcon:', error);
    return 'book';
  }
};

export const isValidLevel = async (
  levelNumber: number,
  identityId: string,
  db: DB
): Promise<boolean> => {
  if (!db || typeof db === 'number') {
    return levelNumber >= 1 && levelNumber <= 4; // Fallback conservateur
  }

  try {
    const levels = (await db.getAllAsync(
      `SELECT level FROM levels WHERE level = ? AND (target_audience = ? OR target_audience = 'all')`,
      [levelNumber, identityId]
    )) as { level: number }[];
    return levels.length > 0;
  } catch (error) {
    log.error('Error in isValidLevel:', error);
    return levelNumber >= 1 && levelNumber <= 4;
  }
};

export const getMaxLevels = async (
  identityId: string,
  db: DB
): Promise<number> => {
  if (!db || typeof db === 'number') {
    return 4; // Fallback
  }

  try {
    const levels = (await db.getAllAsync(
      `SELECT DISTINCT level FROM levels WHERE target_audience = ? OR target_audience = 'all' ORDER BY level DESC LIMIT 1`,
      [identityId]
    )) as { level: number }[];
    return levels.length > 0 ? levels[0].level : 4;
  } catch (error) {
    log.error('Error in getMaxLevels:', error);
    return 4;
  }
};
