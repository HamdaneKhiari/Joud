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
  IdentityPalette,
  FeedbackMessage,
  UserBadge,
  SpacedRepetition,
  UserMetrics
} from './schema';
import { log } from '@/utils/logUtils';

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
  try {
    return await db.getAllAsync<Level>(
      `SELECT * FROM levels WHERE target_audience = ? ORDER BY level`,
      [audience]
    );
  } catch (error) {
    log.warn('getLevelsByAudience error (DB might not be ready):', error);
    return [];
  }
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

export const getContentByFamilyAndLevel = async (
  db: SQLiteDatabase,
  familyId: number,
  level: number,
  audience?: string
): Promise<Content[]> => {
  if (audience) {
    // Filtre par audience spécifique OU contenu pour 'all'
    return await db.getAllAsync<Content>(
      `SELECT * FROM content
       WHERE family_id = ? AND level = ?
       AND (target_audience = ? OR target_audience = 'all')
       ORDER BY id`,
      [familyId, level, audience]
    );
  }
  // Si pas d'audience spécifiée, retourner tout
  return await db.getAllAsync<Content>(
    `SELECT * FROM content WHERE family_id = ? AND level = ? ORDER BY id`,
    [familyId, level]
  );
};

export const insertContent = async (db: SQLiteDatabase, content: Omit<Content, 'id'>): Promise<void> => {
  await db.runAsync(
    `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      content.family_id,
      content.level,
      content.content_type,
      content.data,
      content.difficulty || null,
      content.tags || null,
      content.target_audience || 'all'
    ]
  );
};

// ============================================
// QUERIES PROGRESS
// ============================================

export const upsertProgress = async (db: SQLiteDatabase, progress: Omit<Progress, 'id'>): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO progress (user_id, family_id, subfamily_id, level, completed, total, score, last_accessed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      progress.user_id,
      progress.family_id,
      progress.subfamily_id,
      progress.level,
      progress.completed,
      progress.total,
      progress.score,
      new Date().toISOString(),
    ]
  );
};

export const getProgressByFamily = async (
  db: SQLiteDatabase,
  userId: string,
  familyId: number,
  subfamilyId?: number
): Promise<Progress[]> => {
  if (subfamilyId !== undefined) {
    return await db.getAllAsync<Progress>(
      `SELECT * FROM progress WHERE user_id = ? AND family_id = ? AND subfamily_id = ? ORDER BY level`,
      [userId, familyId, subfamilyId]
    );
  }
  return await db.getAllAsync<Progress>(
    `SELECT * FROM progress WHERE user_id = ? AND family_id = ? ORDER BY level`,
    [userId, familyId]
  );
};

/**
 * Récupère la progression agrégée par famille (somme des sous-familles)
 * Utilisé par FamilySelectionScreen pour afficher le % par famille
 */
export const getAggregatedFamilyProgress = async (
  db: SQLiteDatabase,
  userId: string,
  familyId: number,
  level: number
): Promise<{ completed: number; total: number }> => {
  const result = await db.getFirstAsync<{ completed: number; total: number }>(
    `SELECT COALESCE(SUM(completed), 0) as completed, COALESCE(SUM(total), 0) as total
     FROM progress
     WHERE user_id = ? AND family_id = ? AND level = ?`,
    [userId, familyId, level]
  );
  return result || { completed: 0, total: 0 };
};

// ============================================
// QUERIES BRANDING (White Label)
// ============================================

export const getBrandingById = async (db: SQLiteDatabase, identityId: string): Promise<Branding | null> => {
  try {
    return await db.getFirstAsync<Branding>(
      `SELECT * FROM branding WHERE id = ?`,
      [identityId]
    );
  } catch (error) {
    log.warn('getBrandingById error (DB might not be ready):', error);
    return null;
  }
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
       AND m.slug != 'assessment'
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

export const getRecentActivity = async (db: SQLiteDatabase, limit: number = 10): Promise<Record<string, unknown>[]> => {
  return await db.getAllAsync(
    `SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT ?`,
    [limit]
  );
};

// ============================================
// QUERIES FEEDBACK MESSAGES (White Label)
// ============================================

/**
 * Récupère un message de feedback selon l'identité, le contexte et l'état
 */
export const getFeedbackMessage = async (
  db: SQLiteDatabase,
  identityId: string,
  context: string,
  state: string
): Promise<FeedbackMessage | null> => {
  return await db.getFirstAsync<FeedbackMessage>(
    `SELECT * FROM feedback_messages WHERE identity_id = ? AND context = ? AND state = ?`,
    [identityId, context, state]
  );
};

/**
 * Récupère tous les feedbacks pour une identité et un contexte
 */
export const getFeedbackMessagesByContext = async (
  db: SQLiteDatabase,
  identityId: string,
  context: string
): Promise<FeedbackMessage[]> => {
  return await db.getAllAsync<FeedbackMessage>(
    `SELECT * FROM feedback_messages WHERE identity_id = ? AND context = ?`,
    [identityId, context]
  );
};

// ============================================
// QUERIES DASHBOARD DATA
// ============================================

/**
 * Récupère le mot du jour depuis la table content (type 'word').
 * Utilise un seed basé sur la date pour avoir le même mot toute la journée
 * mais un mot différent chaque jour.
 */
export const getDailyWord = async (
  db: SQLiteDatabase,
  identityId: string
): Promise<{ english: string; french: string } | null> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  // Seed déterministe : somme des char codes de la date
  const seed = today.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  // 1. Mot du jour filtré par audience
  let row = await db.getFirstAsync<{ data: string }>(
    `SELECT c.data FROM content c
     INNER JOIN families f ON c.family_id = f.id
     WHERE c.content_type = 'word'
       AND (c.target_audience = ? OR c.target_audience = 'all')
     ORDER BY (c.id * ?) % 997
     LIMIT 1`,
    [identityId, seed]
  );

  // 2. Fallback : n'importe quel mot
  row ??= await db.getFirstAsync<{ data: string }>(
    `SELECT c.data FROM content c
     WHERE c.content_type = 'word'
     ORDER BY (c.id * ?) % 997
     LIMIT 1`,
    [seed]
  );

  if (!row) return null;

  try {
    const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    return {
      english: parsed.word || '',
      french: parsed.translation || '',
    };
  } catch {
    return null;
  }
};

/**
 * Récupère les badges d'un utilisateur
 */
export const getUserBadges = async (
  db: SQLiteDatabase,
  userId: string
): Promise<UserBadge[]> => {
  return await db.getAllAsync<UserBadge>(
    `SELECT * FROM user_badges WHERE user_id = ? ORDER BY earned_date DESC`,
    [userId]
  );
};

/**
 * Récupère les mots à réviser pour aujourd'hui
 */
export const getWordsToReview = async (
  db: SQLiteDatabase,
  userId: string
): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];

  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM spaced_repetition
     WHERE user_id = ? AND next_review_date <= ?`,
    [userId, today]
  );

  return result?.count || 0;
};

/**
 * Récupère ou crée les métriques utilisateur
 */
export const getUserMetrics = async (
  db: SQLiteDatabase,
  userId: string
): Promise<UserMetrics> => {
  let metrics = await db.getFirstAsync<UserMetrics>(
    `SELECT * FROM user_metrics WHERE user_id = ?`,
    [userId]
  );

  // Si pas de métriques, créer
  if (!metrics) {
    await db.runAsync(
      `INSERT INTO user_metrics (user_id, words_learned, exercises_completed, current_streak, longest_streak, total_time_minutes)
       VALUES (?, 0, 0, 0, 0, 0)`,
      [userId]
    );

    metrics = {
      user_id: userId,
      words_learned: 0,
      exercises_completed: 0,
      current_streak: 0,
      longest_streak: 0,
      total_time_minutes: 0,
    };
  }

  return metrics;
};

/**
 * Met à jour les métriques utilisateur
 */
export const updateUserMetrics = async (
  db: SQLiteDatabase,
  userId: string,
  metrics: Partial<UserMetrics>
): Promise<void> => {
  const fields = Object.keys(metrics).filter((k) => k !== 'user_id' && k !== 'id');
  const values = fields.map((k) => (metrics as Record<string, string | number | null>)[k]);

  if (fields.length === 0) return;

  const setClause = fields.map((f) => `${f} = ?`).join(', ');

  await db.runAsync(
    `UPDATE user_metrics SET ${setClause}, updated_at = ? WHERE user_id = ?`,
    [...values, new Date().toISOString(), userId]
  );
};

/**
 * Helper privé pour calculer le streak actuel
 */
const _calculateCurrentStreak = (days: { day: string }[]): number => {
  if (days.length === 0) return 0;

  let tempStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days.length; i++) {
    const dayDate = new Date(days[i].day + 'T00:00:00');
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    // Tolérer un décalage de 1 jour (si l'utilisateur n'a pas encore joué aujourd'hui)
    const diffMs = Math.abs(dayDate.getTime() - expectedDate.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (i === 0 && diffDays > 1) return 0;

    if (diffDays <= 1) {
      tempStreak++;
    } else {
      break;
    }
  }
  return tempStreak;
};

/**
 * Helper privé pour calculer le meilleur streak historique
 */
const _calculateLongestStreak = (days: { day: string }[], currentStreak: number): number => {
  if (days.length === 0) return 0;

  let tempStreak = 1;
  let longestStreak = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1].day + 'T00:00:00');
    const curr = new Date(days[i].day + 'T00:00:00');
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

    if (Math.abs(diff - 1) < 0.1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  return Math.max(longestStreak, currentStreak);
};

/**
 * Helper principal pour les streaks (Complexité réduite)
 */
const _calculateStreak = (days: { day: string }[]): { currentStreak: number; longestStreak: number } => {
  const currentStreak = _calculateCurrentStreak(days);
  const longestStreak = _calculateLongestStreak(days, currentStreak);
  return { currentStreak, longestStreak };
};

/**
 * Calcule les métriques utilisateur depuis les données réelles
 */
export const calculateUserMetrics = async (
  db: SQLiteDatabase,
  userId: string
): Promise<UserMetrics> => {
  // Mots appris = nombre de contenus de type 'word' complétés
  const wordsResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT c.id) as count
     FROM content c
     INNER JOIN progress p ON c.family_id = p.family_id
     WHERE p.user_id = ? AND p.completed > 0 AND c.content_type = 'word'`,
    [userId]
  );

  // Exercices complétés = total de progress.completed
  const exercisesResult = await db.getFirstAsync<{ total: number }>(
    `SELECT SUM(completed) as total FROM progress WHERE user_id = ?`,
    [userId]
  );

  // Streak = jours consécutifs depuis activity_log
  const days = await db.getAllAsync<{ day: string }>(
    `SELECT DISTINCT DATE(timestamp / 1000, 'unixepoch') as day
     FROM activity_log
     ORDER BY day DESC
     LIMIT 60`
  );

  const { currentStreak, longestStreak } = _calculateStreak(days);

  // Total time : estimer depuis le nombre d'entrées activity_log (env. 2 min par activité)
  const activityCount = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM activity_log`
  );
  const estimatedMinutes = (activityCount?.count || 0) * 2;

  const metrics: UserMetrics = {
    user_id: userId,
    words_learned: wordsResult?.count || 0,
    exercises_completed: exercisesResult?.total || 0,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    total_time_minutes: estimatedMinutes,
    updated_at: new Date().toISOString(),
  };

  // Mettre à jour en DB
  await updateUserMetrics(db, userId, metrics);

  return metrics;
};

// ============================================
// QUERIES RÉVISIONS (SPACED REPETITION)
// ============================================

/**
 * Configuration du nombre de mots quotidiens selon l'audience
 */
export const DAILY_WORDS_COUNT: Record<string, number> = {
  primary: 5,
  college: 10,
  lycee: 15,
  adult: 15,
};

/**
 * Récupère les mots pour la révision quotidienne
 * Prend des mots aléatoires depuis le contenu jusqu'au niveau actuel
 * Priorise les mots pas encore dans le SRS
 */
export const getDailyReviewWords = async (
  db: SQLiteDatabase,
  userId: string,
  audience: string,
  level: number
): Promise<Content[]> => {
  const limit = DAILY_WORDS_COUNT[audience] || 10;

  // Priorise les mots pas encore vus (pas dans spaced_repetition)
  const words = await db.getAllAsync<Content>(
    `SELECT c.* FROM content c
     INNER JOIN families f ON c.family_id = f.id
     INNER JOIN modules m ON f.module_slug = m.slug
     LEFT JOIN spaced_repetition sr ON sr.content_id = c.id AND sr.user_id = ?
     WHERE c.content_type = 'word'
       AND c.level <= ?
       AND (m.target_audience = ? OR m.target_audience = 'all')
       AND (c.target_audience = ? OR c.target_audience = 'all')
     ORDER BY CASE WHEN sr.id IS NULL THEN 0 ELSE 1 END, RANDOM()
     LIMIT ?`,
    [userId, level, audience, audience, limit]
  );

  return words;
};

/**
 * Récupère les mots à réviser selon le système SRS (spaced repetition)
 */
export const getSpacedReviewWords = async (
  db: SQLiteDatabase,
  userId: string,
  audience?: string
): Promise<Array<Content & { sr_id: number; ease_factor: number; review_count: number }>> => {
  const today = new Date().toISOString().split('T')[0];

  let query = `SELECT c.*, sr.id as sr_id, sr.ease_factor, sr.review_count
     FROM spaced_repetition sr
     INNER JOIN content c ON sr.content_id = c.id
     WHERE sr.user_id = ?
       AND sr.next_review_date <= ?
       AND c.content_type = 'word'`;

  const params: (string | number)[] = [userId, today];

  if (audience) {
    query += ` AND (c.target_audience = ? OR c.target_audience = 'all')`;
    params.push(audience);
  }

  query += ` ORDER BY sr.next_review_date ASC LIMIT 50`;

  const words = await db.getAllAsync<Content & { sr_id: number; ease_factor: number; review_count: number }>(
    query,
    params
  );

  return words;
};

/**
 * Ajoute un mot au système de révisions espacées
 */
export const addWordToSRS = async (
  db: SQLiteDatabase,
  userId: string,
  contentId: number
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];

  await db.runAsync(
    `INSERT OR IGNORE INTO spaced_repetition
     (user_id, content_id, content_type, last_review_date, next_review_date, ease_factor, review_count, correct_count)
     VALUES (?, ?, 'word', ?, ?, 2.5, 0, 0)`,
    [userId, contentId, today, today]
  );
};

/**
 * Met à jour le résultat d'une révision (algorithme SM-2)
 * @param wasCorrect - true si l'utilisateur a réussi, false sinon
 */
export const updateSpacedRepetitionResult = async (
  db: SQLiteDatabase,
  userId: string,
  contentId: number,
  wasCorrect: boolean
): Promise<void> => {
  // Récupérer les données actuelles
  const current = await db.getFirstAsync<SpacedRepetition>(
    `SELECT * FROM spaced_repetition WHERE user_id = ? AND content_id = ?`,
    [userId, contentId]
  );

  if (!current) {
    // Si pas encore dans le système, l'ajouter
    await addWordToSRS(db, userId, contentId);
    return;
  }

  // Algorithme SM-2 simplifié
  let newEaseFactor: number;
  let intervalDays: number;

  if (wasCorrect) {
    // Augmenter la difficulté
    newEaseFactor = Math.min(3, current.ease_factor + 0.1);

    // Calculer l'intervalle selon le nombre de révisions
    if (current.review_count === 0) {
      intervalDays = 1;
    } else if (current.review_count === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.round(current.review_count * newEaseFactor);
    }
  } else {
    // Diminuer la difficulté et recommencer
    newEaseFactor = Math.max(1.3, current.ease_factor - 0.2);
    intervalDays = 1;
  }

  // Calculer la prochaine date de révision
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
  const nextReviewDateStr = nextReviewDate.toISOString().split('T')[0];

  const today = new Date().toISOString().split('T')[0];

  // Mettre à jour
  await db.runAsync(
    `UPDATE spaced_repetition
     SET ease_factor = ?,
         review_count = review_count + 1,
         correct_count = correct_count + ?,
         last_review_date = ?,
         next_review_date = ?
     WHERE user_id = ? AND content_id = ?`,
    [
      newEaseFactor,
      wasCorrect ? 1 : 0,
      today,
      nextReviewDateStr,
      userId,
      contentId
    ]
  );
};

/**
 * Compte le nombre de mots à réviser pour l'espacée
 */
export const getSpacedReviewCount = async (
  db: SQLiteDatabase,
  userId: string
): Promise<number> => {
  // Évite la duplication de code avec getWordsToReview
  return getWordsToReview(db, userId);
};

export type { Branding, FeedbackMessage, DailyWord, UserBadge, SpacedRepetition, UserMetrics } from './schema';