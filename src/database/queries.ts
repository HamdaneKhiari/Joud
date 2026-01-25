// src/database/queries.ts
import { SQLiteDatabase } from 'expo-sqlite';
import {
  Module,
  Family,
  Content,
  Progress,
  Level,
  Branding,
  ModuleLabel,
  LevelLabel,
  IdentityPalette
} from './schema';

// ============================================
// QUERIES MODULES
// ============================================

export const getModulesByAudience = async (db: SQLiteDatabase, audience: string): Promise<Module[]> => {
  return await db.getAllAsync<Module>(
    `SELECT * FROM modules WHERE target_audience = ? OR target_audience = 'all' ORDER BY order_index`,
    [audience]
  );
};

export const getModuleBySlug = async (db: SQLiteDatabase, slug: string): Promise<Module | null> => {
  return await db.getFirstAsync<Module>(
    `SELECT * FROM modules WHERE slug = ?`,
    [slug]
  );
};

// ============================================
// QUERIES LEVELS
// ============================================

export const getLevelsByAudience = async (db: SQLiteDatabase, audience: string): Promise<Level[]> => {
  return await db.getAllAsync<Level>(
    `SELECT * FROM levels WHERE target_audience = ? ORDER BY level`,
    [audience]
  );
};

// ============================================
// QUERIES FAMILIES
// ============================================

/**
 * ✅ CORRIGÉ : Utilise moduleSlug (TEXT) au lieu de moduleId (INTEGER)
 */
export const getFamiliesForModule = async (db: SQLiteDatabase, moduleSlug: string): Promise<Family[]> => {
  return await db.getAllAsync<Family>(
    `SELECT * FROM families WHERE module_slug = ? ORDER BY order_index`,
    [moduleSlug]
  );
};

/**
 * ✅ CORRIGÉ : Utilise moduleSlug (TEXT) au lieu de moduleId (INTEGER)
 */
export const getFamiliesByModuleAndLevel = async (
  db: SQLiteDatabase,
  moduleSlug: string,
  level: number
): Promise<Family[]> => {
  return await db.getAllAsync<Family>(
    `SELECT DISTINCT f.* 
     FROM families f
     INNER JOIN content c ON f.id = c.family_id
     WHERE f.module_slug = ? AND c.level = ?
     ORDER BY f.order_index`,
    [moduleSlug, level]
  );
};

/**
 * ✅ CORRIGÉ : Utilise module_slug (TEXT) au lieu de module_id (INTEGER)
 */
export const insertFamily = async (db: SQLiteDatabase, family: Omit<Family, 'id'>): Promise<void> => {
  await db.runAsync(
    `INSERT INTO families (module_slug, name, icon, emoji, description, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
    [family.module_slug, family.name, family.icon || null, family.emoji || null, family.description || null, family.order_index]
  );
};

// ============================================
// QUERIES CONTENT
// ============================================

export const getContentByFamilyAndLevel = async (db: SQLiteDatabase, familyId: number, level: number): Promise<Content[]> => {
  return await db.getAllAsync<Content>(
    `SELECT * FROM content WHERE family_id = ? AND level = ? ORDER BY id`,
    [familyId, level]
  );
};

export const insertContent = async (db: SQLiteDatabase, content: Omit<Content, 'id'>): Promise<void> => {
  await db.runAsync(
    `INSERT INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
    [content.family_id, content.level, content.content_type, content.data, content.difficulty || null, content.tags || null]
  );
};

// ============================================
// QUERIES PROGRESS
// ============================================

export const upsertProgress = async (db: SQLiteDatabase, progress: Omit<Progress, 'id'>): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO progress (user_id, family_id, level, completed, score, last_accessed) VALUES (?, ?, ?, ?, ?, ?)`,
    [progress.user_id, progress.family_id, progress.level, progress.completed, progress.score, new Date().toISOString()]
  );
};

export const getProgressByFamily = async (db: SQLiteDatabase, userId: string, familyId: number): Promise<Progress[]> => {
  return await db.getAllAsync<Progress>(
    `SELECT * FROM progress WHERE user_id = ? AND family_id = ? ORDER BY level`,
    [userId, familyId]
  );
};

// ============================================
// QUERIES BRANDING (White Label)
// ============================================

export const getBrandingById = async (db: SQLiteDatabase, identityId: string): Promise<Branding | null> => {
  return await db.getFirstAsync<Branding>(
    `SELECT * FROM branding WHERE id = ?`,
    [identityId]
  );
};

// ============================================
// QUERIES MODULE_LABELS (White Label)
// ============================================

export const getModuleLabel = async (
  db: SQLiteDatabase,
  moduleSlug: string,
  identityId: string
): Promise<ModuleLabel | null> => {
  return await db.getFirstAsync<ModuleLabel>(
    `SELECT * FROM module_labels WHERE module_slug = ? AND identity_id = ?`,
    [moduleSlug, identityId]
  );
};

export const getModuleLabelWithFallback = async (
  db: SQLiteDatabase,
  moduleSlug: string,
  identityId: string
): Promise<{ display_title: string; display_description: string; icon_name: string }> => {
  // Essayer d'abord le label spécifique
  const label = await getModuleLabel(db, moduleSlug, identityId);
  if (label) {
    return {
      display_title: label.display_title,
      display_description: label.display_description,
      icon_name: label.icon_name
    };
  }
  
  // Fallback vers les colonnes par défaut du module
  const module = await getModuleBySlug(db, moduleSlug);
  if (module) {
    return {
      display_title: module.display_title || module.name,
      display_description: module.display_description || module.description,
      icon_name: module.icon_name || module.icon || 'book'
    };
  }
  
  // Fallback ultime
  return {
    display_title: moduleSlug,
    display_description: 'Module',
    icon_name: 'book'
  };
};

// ============================================
// QUERIES LEVEL_LABELS (White Label)
// ============================================

export const getLevelLabel = async (
  db: SQLiteDatabase,
  levelNumber: number,
  identityId: string
): Promise<LevelLabel | null> => {
  return await db.getFirstAsync<LevelLabel>(
    `SELECT * FROM level_labels WHERE level_number = ? AND identity_id = ?`,
    [levelNumber, identityId]
  );
};

export const getLevelLabelWithFallback = async (
  db: SQLiteDatabase,
  levelNumber: number,
  identityId: string
): Promise<{ display_title: string; badge_text: string; display_description: string }> => {
  // Essayer d'abord le label spécifique
  const label = await getLevelLabel(db, levelNumber, identityId);
  if (label) {
    return {
      display_title: label.display_title,
      badge_text: label.badge_text,
      display_description: label.display_description
    };
  }
  
  // Fallback vers les colonnes par défaut du niveau
  const levels = await db.getAllAsync<Level>(
    `SELECT * FROM levels WHERE level = ? AND (target_audience = ? OR target_audience = 'all') LIMIT 1`,
    [levelNumber, identityId]
  );
  
  if (levels.length > 0) {
    const level = levels[0];
    return {
      display_title: level.display_title || level.title,
      badge_text: level.badge,
      display_description: level.display_description || level.description
    };
  }
  
  // Fallback ultime
  return {
    display_title: `Niveau ${levelNumber}`,
    badge_text: `N${levelNumber}`,
    display_description: 'Niveau'
  };
};

// ============================================
// QUERIES IDENTITY_PALETTES (White Label)
// ============================================

export const getIdentityPalette = async (db: SQLiteDatabase, identityId: string): Promise<string[]> => {
  const palette = await db.getAllAsync<IdentityPalette>(
    `SELECT * FROM identity_palettes WHERE identity_id = ? ORDER BY color_index`,
    [identityId]
  );
  return palette.map(p => p.color_value);
};

// ============================================
// QUERIES MODULE_AVAILABILITY (White Label)
// ============================================

/**
 * Récupère les slugs des modules disponibles pour une identité et un niveau donnés
 */
export const getAvailableModules = async (
  db: SQLiteDatabase,
  identityId: string,
  levelNumber: number
): Promise<string[]> => {
  const modules = await db.getAllAsync<{ slug: string }>(
    `SELECT DISTINCT m.slug
     FROM modules m
     INNER JOIN module_availability ma ON m.slug = ma.module_slug
     WHERE ma.identity_id = ?
       AND ma.is_available = 1
       AND (ma.level_number = ? OR ma.level_number IS NULL)
     ORDER BY m.order_index`,
    [identityId, levelNumber]
  );
  return modules.map(m => m.slug);
};

/**
 * Vérifie si un module est disponible pour une identité et un niveau donnés
 */
export const isModuleAvailable = async (
  db: SQLiteDatabase,
  moduleSlug: string,
  identityId: string,
  levelNumber: number
): Promise<boolean> => {
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM module_availability
     WHERE module_slug = ?
       AND identity_id = ?
       AND is_available = 1
       AND (level_number = ? OR level_number IS NULL)`,
    [moduleSlug, identityId, levelNumber]
  );
  return (result?.count || 0) > 0;
};

// ============================================
// QUERIES ACTIVITY_LOG (Dashboard)
// ============================================

export const logActivity = async (
  db: SQLiteDatabase,
  moduleSlug: string,
  familyId: number,
  level: number,
  familyName: string,
  icon: string | null,
  progress: number
): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO activity_log (module_slug, family_id, level, family_name, icon, progress, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [moduleSlug, familyId, level, familyName, icon, progress, Date.now()]
  );
};

export const getRecentActivity = async (db: SQLiteDatabase, limit: number = 10): Promise<any[]> => {
  return await db.getAllAsync(
    `SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT ?`,
    [limit]
  );
};

export type { Branding } from './schema';