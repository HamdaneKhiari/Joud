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