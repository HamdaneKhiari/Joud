/**
 * ============================================
 * MIGRATION 001: Initial Schema
 * Crée toutes les tables de base de données
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  1,
  'initial_schema',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      -- ============================================
      -- TABLES CORE
      -- ============================================

      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        is_core INTEGER DEFAULT 1,
        target_audience TEXT DEFAULT 'all',
        icon TEXT,
        order_index INTEGER,
        description TEXT,
        display_title TEXT,
        display_description TEXT,
        icon_name TEXT
      );

      CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY,
        level INTEGER NOT NULL,
        title TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT NOT NULL,
        badge TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        display_title TEXT,
        display_description TEXT,
        icon_name TEXT
      );

      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        emoji TEXT,
        description TEXT,
        order_index INTEGER,
        FOREIGN KEY (module_slug) REFERENCES modules(slug)
      );

      CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        data TEXT NOT NULL,
        difficulty TEXT,
        tags TEXT,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        last_accessed TEXT,
        UNIQUE(user_id, family_id, level),
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        family_name TEXT NOT NULL,
        icon TEXT,
        progress REAL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        UNIQUE(module_slug, family_id)
      );

      -- ============================================
      -- TABLES WHITE LABEL
      -- ============================================

      CREATE TABLE IF NOT EXISTS branding (
        id TEXT PRIMARY KEY,
        primary_color TEXT NOT NULL,
        accent_color TEXT NOT NULL,
        surface_color TEXT,
        logo_name TEXT,
        theme_mode TEXT DEFAULT 'light',
        ui_has_gradient INTEGER DEFAULT 0,
        ui_gradient_colors TEXT,
        ui_card_radius INTEGER DEFAULT 12,
        ui_show_decorative_shapes INTEGER DEFAULT 1,
        ai_accent_color TEXT,
        ai_error_color TEXT,
        ai_solution_bg TEXT,
        header_bg_color TEXT NOT NULL,
        header_accent_color TEXT NOT NULL,
        header_emoji TEXT,
        header_welcome_text TEXT,
        daily_word_bg_color TEXT,
        daily_word_gradient TEXT,
        daily_word_decoration TEXT DEFAULT 'none',
        dashboard_level_progress_color TEXT NOT NULL,
        text_on_main_color TEXT NOT NULL,
        text_primary_color TEXT,
        text_secondary_color TEXT,
        ai_tutor_title TEXT,
        ai_tutor_subtitle TEXT
      );

      CREATE TABLE IF NOT EXISTS module_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        identity_id TEXT NOT NULL,
        display_title TEXT NOT NULL,
        display_description TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        UNIQUE(module_slug, identity_id),
        FOREIGN KEY (module_slug) REFERENCES modules(slug),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      CREATE TABLE IF NOT EXISTS level_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_number INTEGER NOT NULL,
        identity_id TEXT NOT NULL,
        display_title TEXT NOT NULL,
        badge_text TEXT NOT NULL,
        display_description TEXT NOT NULL,
        UNIQUE(level_number, identity_id),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      CREATE TABLE IF NOT EXISTS identity_palettes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identity_id TEXT NOT NULL,
        color_index INTEGER NOT NULL,
        color_value TEXT NOT NULL,
        UNIQUE(identity_id, color_index),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      CREATE TABLE IF NOT EXISTS module_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        identity_id TEXT NOT NULL,
        level_number INTEGER,
        is_available INTEGER DEFAULT 1,
        UNIQUE(module_slug, identity_id, level_number),
        FOREIGN KEY (module_slug) REFERENCES modules(slug),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      -- ============================================
      -- INDEX POUR PERFORMANCE
      -- ============================================

      CREATE INDEX IF NOT EXISTS idx_modules_slug ON modules(slug);
      CREATE INDEX IF NOT EXISTS idx_modules_target_audience ON modules(target_audience);
      CREATE INDEX IF NOT EXISTS idx_levels_target_audience ON levels(target_audience);
      CREATE INDEX IF NOT EXISTS idx_families_module_slug ON families(module_slug);
      CREATE INDEX IF NOT EXISTS idx_module_labels_slug_identity ON module_labels(module_slug, identity_id);
      CREATE INDEX IF NOT EXISTS idx_level_labels_level_identity ON level_labels(level_number, identity_id);
      CREATE INDEX IF NOT EXISTS idx_module_availability_slug_identity ON module_availability(module_slug, identity_id);
      CREATE INDEX IF NOT EXISTS idx_module_availability_level ON module_availability(level_number);
    `);

    console.log('[Migration 001] ✓ Schema created successfully');
  },
  // Rollback: DROP toutes les tables
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      DROP TABLE IF EXISTS content;
      DROP TABLE IF EXISTS progress;
      DROP TABLE IF EXISTS activity_log;
      DROP TABLE IF EXISTS families;
      DROP TABLE IF EXISTS module_availability;
      DROP TABLE IF EXISTS level_labels;
      DROP TABLE IF EXISTS module_labels;
      DROP TABLE IF EXISTS identity_palettes;
      DROP TABLE IF EXISTS modules;
      DROP TABLE IF EXISTS levels;
      DROP TABLE IF EXISTS branding;
    `);

    console.log('[Migration 001] ✓ Schema dropped');
  }
);
