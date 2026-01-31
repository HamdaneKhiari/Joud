/**
 * ============================================
 * MIGRATION 007: Seed White Label Data
 * Insère branding, palettes, labels, et availability
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  7,
  'seed_whitelabel',
  async (db: SQLite.SQLiteDatabase) => {
    // ========== BRANDING (4 identités) ==========
    const brandingSeed = [
      // [id, primary_color, accent_color, surface_color, logo_name, theme_mode, ui_has_gradient, ui_gradient_colors, ui_card_radius, ui_show_decorative_shapes, ai_accent_color, ai_error_color, ai_solution_bg, header_bg_color, header_accent_color, header_emoji, header_welcome_text, daily_word_bg_color, daily_word_gradient, daily_word_decoration, dashboard_level_progress_color, text_on_main_color, text_primary_color, text_secondary_color, ai_tutor_title, ai_tutor_subtitle]
      ['primary', '#FF5722', '#FFCE00', '#FFFFFF', null, 'light', 1, '["#FF5722", "#FFCE00", "#4CAF50"]', 16, 1, '#FF5722', '#D32F2F', '["#FFF3E0", "#FFE0B2"]', '#FF5722', '#FFCE00', '🎨', 'Bienvenue !', '#FFE0B2', '["#FFE0B2", "#FFF9C4", "#E1F5FE"]', 'circles', '#FF5722', '#000000', '#1F2937', '#6B7280', 'Coach IA', 'Ton assistant personnel'],
      ['college', '#34495E', '#FFD700', '#FFFFFF', null, 'light', 0, null, 12, 1, '#34495E', '#D32F2F', '["#ECEFF1", "#CFD8DC"]', '#34495E', '#FFD700', '📚', 'Bonjour !', '#FFF9C4', null, 'none', '#34495E', '#000000', '#1F2937', '#6B7280', 'Tuteur IA', 'Aide aux devoirs'],
      ['lycee', '#00E5FF', '#FF6B35', '#FFFFFF', null, 'light', 1, '["#00E5FF", "#7B2CBF"]', 16, 1, '#7B2CBF', '#EF5350', '["#E0F7FA", "#F3E5F5"]', '#00E5FF', '#FF6B35', '🎓', 'Hello!', '#E0F7FA', '["#E0F7FA", "#F3E5F5"]', 'water-drop', '#00E5FF', '#FFFFFF', '#1F2937', '#6B7280', 'AI Tutor', 'Your personal assistant'],
      ['adult', '#111827', '#374151', '#1F2937', null, 'dark', 0, null, 8, 0, '#4B5563', '#DC2626', '["#1F2937", "#374151"]', '#111827', '#374151', '💼', 'Welcome', '#263238', null, 'none', '#374151', '#FFFFFF', '#FFFFFF', '#9CA3AF', 'AI Assistant', 'Smart learning companion'],
    ];

    for (const brand of brandingSeed) {
      await db.runAsync(
        `INSERT OR IGNORE INTO branding VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        brand
      );
    }

    // ========== IDENTITY PALETTES ==========
    const primaryPalette = [
      ['primary', 0, '#FF5722'],
      ['primary', 1, '#FFCE00'],
      ['primary', 2, '#4CAF50'],
      ['primary', 3, '#2196F3'],
      ['primary', 4, '#9C27B0'],
      ['primary', 5, '#FF9800'],
      ['primary', 6, '#E91E63'],
    ];

    const collegePalette = [
      ['college', 0, '#34495E'],
      ['college', 1, '#FFD700'],
      ['college', 2, '#3498DB'],
      ['college', 3, '#E74C3C'],
      ['college', 4, '#9B59B6'],
      ['college', 5, '#F39C12'],
      ['college', 6, '#1ABC9C'],
    ];

    const lyceePalette = [
      ['lycee', 0, '#00E5FF'],  // Cyan électrique (signature)
      ['lycee', 1, '#FF6B35'],  // Orange vif
      ['lycee', 2, '#7B2CBF'],  // Violet moderne
      ['lycee', 3, '#00BCD4'],  // Cyan moyen
      ['lycee', 4, '#10B981'],  // Vert émeraude
      ['lycee', 5, '#EC4899'],  // Rose vif
      ['lycee', 6, '#F59E0B'],  // Ambre/Or
    ];

    const adultPalette = [
      ['adult', 0, '#111827'],
      ['adult', 1, '#374151'],
      ['adult', 2, '#4B5563'],
      ['adult', 3, '#6B7280'],
      ['adult', 4, '#9CA3AF'],
      ['adult', 5, '#D1D5DB'],
      ['adult', 6, '#1F2937'],
    ];

    const allPalettes = [...primaryPalette, ...collegePalette, ...lyceePalette, ...adultPalette];

    for (const palette of allPalettes) {
      await db.runAsync(
        `INSERT OR IGNORE INTO identity_palettes (identity_id, color_index, color_value) VALUES (?, ?, ?)`,
        palette
      );
    }

    // ========== LEVEL LABELS (par identité) ==========
    const primaryLevelLabels = [
      [1, 'primary', 'La Découverte', 'DÉCOUVERTE', "Premier pas dans l'apprentissage"],
      [2, 'primary', 'Le Démarrage', 'DÉMARRAGE', 'On commence vraiment'],
      [3, 'primary', "L'Exploration", 'EXPLORATION', 'Découvre de nouvelles choses'],
      [4, 'primary', 'La Maîtrise', 'MAÎTRISE', 'Tu deviens un expert'],
    ];

    const collegeLevelLabels = [
      [1, 'college', 'Les Bases', 'BASES', 'Fondations essentielles'],
      [2, 'college', "L'Essentiel", 'ESSENTIEL', 'Compétences clés'],
      [3, 'college', "L'Avancé", 'AVANCÉ', 'Niveau supérieur'],
      [4, 'college', "L'Expert", 'EXPERT', 'Maîtrise complète'],
    ];

    const lyceeLevelLabels = [
      [1, 'lycee', 'Foundations', 'FOUNDATIONS', 'Core principles'],
      [2, 'lycee', 'Skills', 'SKILLS', 'Practical abilities'],
      [3, 'lycee', 'Expertise', 'EXPERTISE', 'Advanced mastery'],
      [4, 'lycee', 'Mastery', 'MASTERY', 'Complete command'],
    ];

    const adultLevelLabels = [
      [1, 'adult', 'Niveau 1', 'N1', 'Débutant'],
      [2, 'adult', 'Niveau 2', 'N2', 'Élémentaire'],
      [3, 'adult', 'Niveau 3', 'N3', 'Intermédiaire'],
      [4, 'adult', 'Niveau 4', 'N4', 'Intermédiaire +'],
      [5, 'adult', 'Niveau 5', 'N5', 'Avancé'],
      [6, 'adult', 'Niveau 6', 'N6', 'Expert'],
      [7, 'adult', 'Slang & Real Life', 'BONUS', 'Langage courant et argot'],
    ];

    const allLevelLabels = [...primaryLevelLabels, ...collegeLevelLabels, ...lyceeLevelLabels, ...adultLevelLabels];

    for (const label of allLevelLabels) {
      await db.runAsync(
        `INSERT OR IGNORE INTO level_labels (level_number, identity_id, display_title, badge_text, display_description) VALUES (?, ?, ?, ?, ?)`,
        label
      );
    }

    // ========== MODULE AVAILABILITY ==========
    // PRIMARY: vocab, phrase_types, grammar, reading, dialogues, word_games, assessment
    const primaryModules = ['vocab', 'phrase_types', 'grammar', 'reading', 'dialogues', 'word_games', 'assessment'];
    for (const moduleSlug of primaryModules) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'primary', null, 1]
      );
    }

    // COLLEGE: Same as primary
    const collegeModules = [...primaryModules];
    for (const moduleSlug of collegeModules) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'college', null, 1]
      );
    }

    // LYCEE: College + connector
    const lyceeModules = [...collegeModules, 'connector'];
    for (const moduleSlug of lyceeModules) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'lycee', null, 1]
      );
    }

    // ADULT: Tous les modules pour niveaux 1-6
    const adultStandardModules = [...lyceeModules, 'fastvocab'];
    for (const moduleSlug of adultStandardModules) {
      for (let level = 1; level <= 6; level++) {
        await db.runAsync(
          `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
          [moduleSlug, 'adult', level, 1]
        );
      }
    }

    // ADULT Niveau 7: Uniquement vocab et phrase_types
    await db.runAsync(
      `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
      ['vocab', 'adult', 7, 1]
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
      ['phrase_types', 'adult', 7, 1]
    );

    console.log('[Migration 007] ✓ White Label data seeded (4 identities: primary, college, lycee, adult)');
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(`DELETE FROM module_availability`);
    await db.runAsync(`DELETE FROM level_labels`);
    await db.runAsync(`DELETE FROM module_labels`);
    await db.runAsync(`DELETE FROM identity_palettes`);
    await db.runAsync(`DELETE FROM branding`);
    console.log('[Migration 007] ✓ White Label data cleared');
  }
);
