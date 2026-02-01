/**
 * ============================================
 * MIGRATION 009: Dashboard Data
 * Crée les tables et seed les données pour le Dashboard
 * - daily_words : Mots du jour
 * - user_badges : Système de badges
 * - spaced_repetition : Système de révisions espacées
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  10,
  'seed_dashboard_data',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      -- ============================================
      -- TABLE: daily_words
      -- Mots du jour par identité et niveau
      -- ============================================
      CREATE TABLE IF NOT EXISTS daily_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identity_id TEXT NOT NULL,
        level INTEGER NOT NULL,
        english TEXT NOT NULL,
        french TEXT NOT NULL,
        emoji TEXT,
        date TEXT, -- Format YYYY-MM-DD, NULL = réutilisable
        category TEXT, -- vocabulary, idiom, expression
        difficulty TEXT, -- easy, medium, hard
        UNIQUE(identity_id, date) ON CONFLICT REPLACE
      );

      -- ============================================
      -- TABLE: user_badges
      -- Système de badges et achievements
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
      -- TABLE: spaced_repetition
      -- Système de révisions espacées (SRS)
      -- ============================================
      CREATE TABLE IF NOT EXISTS spaced_repetition (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        content_id INTEGER NOT NULL,
        content_type TEXT NOT NULL, -- word, rule, sentence
        last_review_date TEXT,
        next_review_date TEXT,
        ease_factor REAL DEFAULT 2.5,
        review_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        UNIQUE(user_id, content_id, content_type),
        FOREIGN KEY (content_id) REFERENCES content(id)
      );

      -- ============================================
      -- TABLE: user_metrics
      -- Statistiques utilisateur pré-calculées
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
      -- SEED: Daily Words - PRIMARY (Primaire)
      -- ============================================
      INSERT OR REPLACE INTO daily_words (identity_id, level, english, french, emoji, category, difficulty) VALUES
      ('primary', 1, 'Happy', 'Joyeux', '😊', 'vocabulary', 'easy'),
      ('primary', 1, 'Cat', 'Chat', '🐱', 'vocabulary', 'easy'),
      ('primary', 1, 'Sun', 'Soleil', '☀️', 'vocabulary', 'easy'),
      ('primary', 1, 'Book', 'Livre', '📚', 'vocabulary', 'easy'),
      ('primary', 2, 'Friendship', 'Amitié', '🤝', 'vocabulary', 'medium'),
      ('primary', 2, 'Rainbow', 'Arc-en-ciel', '🌈', 'vocabulary', 'medium'),
      ('primary', 3, 'Adventure', 'Aventure', '🗺️', 'vocabulary', 'medium'),
      ('primary', 3, 'Courage', 'Courage', '💪', 'vocabulary', 'medium'),

      -- ============================================
      -- SEED: Daily Words - COLLEGE (Collège)
      -- ============================================
      ('college', 1, 'Resilience', 'Résilience', '🌱', 'vocabulary', 'medium'),
      ('college', 1, 'Challenge', 'Défi', '🎯', 'vocabulary', 'medium'),
      ('college', 2, 'Opportunity', 'Opportunité', '🚪', 'vocabulary', 'medium'),
      ('college', 2, 'Achievement', 'Accomplissement', '🏆', 'vocabulary', 'medium'),
      ('college', 3, 'Determination', 'Détermination', '🔥', 'vocabulary', 'hard'),
      ('college', 3, 'Innovation', 'Innovation', '💡', 'vocabulary', 'hard'),
      ('college', 3, 'Break the ice', 'Briser la glace', '🧊', 'idiom', 'medium'),
      ('college', 4, 'Every cloud has a silver lining', 'À quelque chose malheur est bon', '☁️', 'idiom', 'hard'),

      -- ============================================
      -- SEED: Daily Words - LYCEE (Lycée)
      -- ============================================
      ('lycee', 1, 'Analysis', 'Analyse', '🔍', 'vocabulary', 'medium'),
      ('lycee', 1, 'Perspective', 'Perspective', '👁️', 'vocabulary', 'medium'),
      ('lycee', 2, 'Ambiguity', 'Ambiguïté', '❓', 'vocabulary', 'hard'),
      ('lycee', 2, 'Synthesis', 'Synthèse', '⚗️', 'vocabulary', 'hard'),
      ('lycee', 3, 'Paradigm', 'Paradigme', '🔄', 'vocabulary', 'hard'),
      ('lycee', 3, 'Dichotomy', 'Dichotomie', '⚖️', 'vocabulary', 'hard'),
      ('lycee', 4, 'Beat around the bush', 'Tourner autour du pot', '🌳', 'idiom', 'medium'),
      ('lycee', 5, 'The ball is in your court', 'C''est à toi de jouer', '🎾', 'idiom', 'hard'),

      -- ============================================
      -- SEED: Daily Words - ADULT (Adulte)
      -- ============================================
      ('adult', 1, 'Efficiency', 'Efficacité', '⚡', 'vocabulary', 'medium'),
      ('adult', 1, 'Strategy', 'Stratégie', '♟️', 'vocabulary', 'medium'),
      ('adult', 2, 'Leverage', 'Effet de levier', '🎚️', 'vocabulary', 'hard'),
      ('adult', 2, 'Stakeholder', 'Partie prenante', '🤝', 'vocabulary', 'hard'),
      ('adult', 3, 'Synergy', 'Synergie', '🔗', 'vocabulary', 'hard'),
      ('adult', 3, 'Benchmark', 'Référence', '📊', 'vocabulary', 'hard'),
      ('adult', 4, 'Think outside the box', 'Penser autrement', '📦', 'idiom', 'medium'),
      ('adult', 5, 'Get the ball rolling', 'Lancer le processus', '⚽', 'idiom', 'medium');
    `);

    console.log('✅ Migration 009: Dashboard data créées (daily_words, badges, SRS, metrics)');
  }
);
