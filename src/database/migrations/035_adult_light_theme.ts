/**
 * ============================================
 * MIGRATION 035: Adult → Light theme sobre
 * - Fond clair, header navy, accent ambre
 * - Look corporate/LinkedIn, pas gloomy
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  35,
  'adult_light_theme',
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      `UPDATE branding SET
        theme_mode = 'light',
        primary_color = '#1E3A5F',
        accent_color = '#D97706',
        surface_color = '#FFFFFF',
        header_bg_color = '#1E3A5F',
        header_accent_color = '#D97706',
        text_primary_color = NULL,
        text_secondary_color = NULL,
        daily_word_bg_color = '#F8FAFC',
        daily_word_decoration = 'none',
        dashboard_level_progress_color = '#1E3A5F'
      WHERE id = 'adult'`
    );

    console.log('[Migration 035] ✓ Adult switched to sober light theme');
  }
);
