// src/database/queries.ts
import { SQLiteDatabase } from 'expo-sqlite';
import { Module, Family, Content, Progress, Level } from './schema';

// --- QUERIES MODULES ---
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

// --- QUERIES LEVELS ---
export const getLevelsByAudience = async (db: SQLiteDatabase, audience: string): Promise<Level[]> => {
  return await db.getAllAsync<Level>(
    `SELECT * FROM levels WHERE target_audience = ? OR target_audience = 'all' ORDER BY level`,
    [audience]
  );
};

// --- QUERIES FAMILIES ---
export const getFamiliesForModule = async (db: SQLiteDatabase, moduleId: number): Promise<Family[]> => {
  return await db.getAllAsync<Family>(
    `SELECT * FROM families WHERE module_id = ? ORDER BY order_index`,
    [moduleId]
  );
};

export const getFamiliesByModuleAndLevel = async (
  db: SQLiteDatabase,
  moduleId: number,
  level: number
): Promise<Family[]> => {
  return await db.getAllAsync<Family>(
    `SELECT DISTINCT f.* 
     FROM families f
     INNER JOIN content c ON f.id = c.family_id
     WHERE f.module_id = ? AND c.level = ?
     ORDER BY f.order_index`,
    [moduleId, level]
  );
};

export const insertFamily = async (db: SQLiteDatabase, family: Omit<Family, 'id'>): Promise<void> => {
  await db.runAsync(
    `INSERT INTO families (module_id, name, icon, emoji, description, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
    [family.module_id, family.name, family.icon || null, family.emoji || null, family.description || null, family.order_index]
  );
};

// --- QUERIES CONTENT ---
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

// --- QUERIES PROGRESS ---
export const upsertProgress = async (db: SQLiteDatabase, progress: Omit<Progress, 'id'>): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO progress (user_id, family_id, level, completed, score, last_accessed) VALUES (?, ?, ?, ?, ?, ?)`,
    [progress.user_id, progress.family_id, progress.level, progress.completed, progress.score, new Date().toISOString()]
  );
};

// --- QUERIES BRANDING (White Label) ---
export interface Branding {
  id: string;
  primary_color: string;
  accent_color: string;
  surface_color: string | null;
  logo_name: string | null;
  theme_mode: 'light' | 'dark';
  ui_has_gradient: number;
  ui_gradient_colors: string | null;
  ui_card_radius: number;
  ui_show_decorative_shapes: number;
  ai_accent_color: string | null;
  ai_error_color: string | null;
  ai_solution_bg: string | null;
  header_bg_color: string;
  header_accent_color: string;
  header_emoji: string | null;
  header_welcome_text: string | null;
  daily_word_bg_color: string | null;
  daily_word_gradient: string | null;
  daily_word_decoration: 'circles' | 'water-drop' | 'none';
  dashboard_level_progress_color: string;
  text_on_main_color: string;
}

export const getBrandingById = async (db: SQLiteDatabase, identityId: string): Promise<Branding | null> => {
  return await db.getFirstAsync<Branding>(
    `SELECT * FROM branding WHERE id = ?`,
    [identityId]
  );
};

// --- QUERIES MODULE_LABELS (White Label) ---
export interface ModuleLabel {
  module_slug: string;
  identity_id: string;
  display_title: string;
  display_description: string;
  icon_name: string;
}

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

// --- QUERIES LEVEL_LABELS (White Label) ---
export interface LevelLabel {
  level_number: number;
  identity_id: string;
  display_title: string;
  badge_text: string;
  display_description: string;
}

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

// --- QUERIES IDENTITY_PALETTES (White Label) ---
export interface IdentityPalette {
  identity_id: string;
  color_index: number;
  color_value: string;
}

export const getIdentityPalette = async (db: SQLiteDatabase, identityId: string): Promise<string[]> => {
  const palette = await db.getAllAsync<IdentityPalette>(
    `SELECT * FROM identity_palettes WHERE identity_id = ? ORDER BY color_index`,
    [identityId]
  );
  return palette.map(p => p.color_value);
};

// --- QUERIES MODULE_AVAILABILITY (White Label) ---
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