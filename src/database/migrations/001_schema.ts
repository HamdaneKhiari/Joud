/**
 * Migration 001 : schéma complet, toutes les tables dans leur état final.
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  1,
  'schema',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`

      -- ============================================
      -- MODULES
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

      -- ============================================
      -- LEVELS
      -- ============================================
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

      -- ============================================
      -- FAMILIES
      -- ============================================
      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        module_slug TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        emoji TEXT,
        description TEXT,
        order_index INTEGER,
        FOREIGN KEY (module_slug) REFERENCES modules(slug)
      );

      -- ============================================
      -- CONTENT
      -- ============================================
      CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        subfamily_id INTEGER DEFAULT NULL,
        level INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        data TEXT NOT NULL,
        difficulty TEXT,
        tags TEXT,
        target_audience TEXT DEFAULT 'all',
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      -- ============================================
      -- PROGRESS
      -- ============================================
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        subfamily_id INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        last_accessed TEXT,
        UNIQUE(user_id, family_id, subfamily_id, level),
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      -- ============================================
      -- ACTIVITY LOG
      -- ============================================
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        subfamily_id INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL,
        family_name TEXT NOT NULL,
        icon TEXT,
        progress REAL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        UNIQUE(module_slug, family_id, subfamily_id)
      );

      -- ============================================
      -- BRANDING (White Label)
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
        ui_card_mood TEXT NOT NULL DEFAULT 'playful',
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
        dashboard_level_progress_color TEXT NOT NULL DEFAULT '#34495E',
        text_on_main_color TEXT NOT NULL,
        text_primary_color TEXT,
        text_secondary_color TEXT,
        ai_tutor_title TEXT,
        ai_tutor_subtitle TEXT
      );

      -- ============================================
      -- MODULE LABELS (White Label)
      -- ============================================
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

      -- ============================================
      -- LEVEL LABELS (White Label + Subfamily labels)
      -- ============================================
      CREATE TABLE IF NOT EXISTS level_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_number INTEGER NOT NULL,
        identity_id TEXT NOT NULL,
        family_id INTEGER,
        display_title TEXT NOT NULL,
        badge_text TEXT NOT NULL,
        display_description TEXT,
        icon_name TEXT,
        UNIQUE(level_number, identity_id, family_id),
        FOREIGN KEY (identity_id) REFERENCES branding(id),
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      -- ============================================
      -- IDENTITY PALETTES
      -- ============================================
      CREATE TABLE IF NOT EXISTS identity_palettes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identity_id TEXT NOT NULL,
        color_index INTEGER NOT NULL,
        color_value TEXT NOT NULL,
        UNIQUE(identity_id, color_index),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      -- ============================================
      -- MODULE AVAILABILITY
      -- ============================================
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
      -- FEEDBACK MESSAGES
      -- ============================================
      CREATE TABLE IF NOT EXISTS feedback_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identity_id TEXT NOT NULL,
        context TEXT NOT NULL,
        state TEXT NOT NULL,
        icon TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        UNIQUE(identity_id, context, state)
      );

      -- ============================================
      -- DAILY WORDS
      -- ============================================
      CREATE TABLE IF NOT EXISTS daily_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identity_id TEXT NOT NULL,
        level INTEGER NOT NULL,
        english TEXT NOT NULL,
        french TEXT NOT NULL,
        emoji TEXT,
        date TEXT,
        category TEXT,
        difficulty TEXT,
        UNIQUE(identity_id, date) ON CONFLICT REPLACE
      );

      -- ============================================
      -- USER BADGES
      -- ============================================
      CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        badge_id TEXT NOT NULL,
        badge_name TEXT NOT NULL,
        badge_icon TEXT,
        earned_date TEXT NOT NULL,
        progress INTEGER DEFAULT 100,
        UNIQUE(user_id, badge_id)
      );

      -- ============================================
      -- SPACED REPETITION (SRS)
      -- ============================================
      CREATE TABLE IF NOT EXISTS spaced_repetition (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        content_id INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        last_review_date TEXT,
        next_review_date TEXT,
        ease_factor REAL DEFAULT 2.5,
        review_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        UNIQUE(user_id, content_id, content_type),
        FOREIGN KEY (content_id) REFERENCES content(id)
      );

      -- ============================================
      -- USER METRICS
      -- ============================================
      CREATE TABLE IF NOT EXISTS user_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        words_learned INTEGER DEFAULT 0,
        exercises_completed INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date TEXT,
        total_time_minutes INTEGER DEFAULT 0,
        updated_at TEXT
      );

      -- ============================================
      -- EXERCISE ERRORS (Coach IA)
      -- ============================================
      CREATE TABLE IF NOT EXISTS exercise_errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL DEFAULT '',
        family_id INTEGER NOT NULL,
        module_slug TEXT NOT NULL,
        question TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        level INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      -- ============================================
      -- CHAT (Coach IA)
      -- ============================================
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL CHECK(mode IN ('free', 'guided')),
        title TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'ai', 'error')),
        content TEXT NOT NULL,
        source TEXT,
        provider TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
      );

      -- ============================================
      -- VOCABULARY SEEN (tracking mots vus)
      -- ============================================
      CREATE TABLE IF NOT EXISTS vocabulary_seen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        translation TEXT NOT NULL,
        family_id TEXT NOT NULL,
        seen_at INTEGER NOT NULL
      );

      -- ============================================
      -- AI SETTINGS
      -- ============================================
      CREATE TABLE IF NOT EXISTS ai_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        provider TEXT NOT NULL DEFAULT 'openai',
        model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
        max_tokens INTEGER NOT NULL DEFAULT 500,
        temperature REAL NOT NULL DEFAULT 0.7,
        max_messages_per_day INTEGER NOT NULL DEFAULT 50,
        current_usage_count INTEGER NOT NULL DEFAULT 0,
        last_reset_date INTEGER NOT NULL DEFAULT 0,
        is_configured INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      -- Default AI settings row
      INSERT OR REPLACE INTO ai_settings (id, provider, model, max_tokens, temperature, max_messages_per_day, current_usage_count, last_reset_date, is_configured, created_at, updated_at)
      VALUES (1, 'openai', 'gpt-3.5-turbo', 500, 0.7, 50, 0, 0, 0, 0, 0);

    `);
  }
);
