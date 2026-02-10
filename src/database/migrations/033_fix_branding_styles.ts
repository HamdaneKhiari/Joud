/**
 * ============================================
 * MIGRATION 033: Fix branding styles
 * - Adult: palette moins agressive (fond plus doux)
 * - Primary/College: DailyWord avec fond coloré au lieu de transparent
 * - Lycee/Adult: DailyWord avec fond surface subtil
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  33,
  'fix_branding_styles',
  async (db: SQLite.SQLiteDatabase) => {
    // ── Add missing column first ──
    await db.runAsync(
      `ALTER TABLE branding ADD COLUMN dashboard_level_progress_color TEXT NOT NULL DEFAULT '#34495E'`
    );

    // ── ADULT: palette plus douce ──
    // Ancien: primary=#111827 accent=#374151 surface=#1F2937 → trop noir
    // Nouveau: primary=#1E3A5F accent=#F59E0B surface=#1E293B bg=#0F172A plus subtil
    await db.runAsync(
      `UPDATE branding SET
        primary_color = '#1E3A5F',
        accent_color = '#F59E0B',
        surface_color = '#1E293B',
        header_bg_color = '#1E3A5F',
        header_accent_color = '#F59E0B',
        text_primary_color = '#F1F5F9',
        text_secondary_color = '#94A3B8',
        header_emoji = '💼',
        header_welcome_text = 'Welcome back,',
        daily_word_bg_color = '#1E293B',
        daily_word_decoration = 'none',
        dashboard_level_progress_color = '#F59E0B',
        ui_card_radius = 10,
        ui_show_decorative_shapes = 0
      WHERE id = 'adult'`
    );

    // ── PRIMARY: DailyWord coloré warm ──
    await db.runAsync(
      `UPDATE branding SET
        daily_word_gradient = '["#FFF3E0", "#FFE0B2"]',
        daily_word_decoration = 'circles',
        header_emoji = '🌈',
        header_welcome_text = 'Hello !',
        dashboard_level_progress_color = '#FF5722',
        ui_card_radius = 20,
        ui_show_decorative_shapes = 1
      WHERE id = 'primary'`
    );

    // ── COLLEGE: DailyWord bleu doux ──
    await db.runAsync(
      `UPDATE branding SET
        daily_word_gradient = '["#E8EAF6", "#C5CAE9"]',
        daily_word_decoration = 'none',
        header_emoji = '📚',
        header_welcome_text = 'Bonjour,',
        dashboard_level_progress_color = '#34495E',
        ui_card_radius = 14,
        ui_show_decorative_shapes = 1
      WHERE id = 'college'`
    );

    // ── LYCEE: DailyWord cyan subtil ──
    await db.runAsync(
      `UPDATE branding SET
        daily_word_bg_color = '#E0F7FA',
        daily_word_decoration = 'none',
        header_emoji = '🎓',
        header_welcome_text = 'Bonjour,',
        dashboard_level_progress_color = '#00E5FF',
        ui_card_radius = 12,
        ui_show_decorative_shapes = 0
      WHERE id = 'lycee'`
    );

    // ── Adult palette fixes ──
    await db.runAsync(
      `UPDATE identity_palettes SET color_value = '#1E3A5F' WHERE identity_id = 'adult' AND color_index = 0`
    );
    await db.runAsync(
      `UPDATE identity_palettes SET color_value = '#F59E0B' WHERE identity_id = 'adult' AND color_index = 1`
    );

    console.log('[Migration 033] ✓ Branding styles fixed (adult softer, DailyWord per audience)');
  }
);
