/**
 * ============================================
 * MIGRATION 002: Seed White Label Data
 * Version Nettoyée : Suppression de progress_color
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  2,
  'seed_whitelabel',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. Désactivation des contraintes pour permettre un seed propre
    await db.execAsync('PRAGMA foreign_keys = OFF;');

    try {
      // ========== 1. BRANDING ==========
      // On a supprimé dashboard_level_progress_color (9 colonnes -> 8 colonnes)
      const brandingSeed = [
        // Format: [id, primary, accent, surface, theme, header_bg, header_accent, text_on_main]
        ['primary', '#FF5722', '#FFCE00', '#FFFFFF', 'light', '#FF5722', '#FFCE00', '#FFFFFF'],
        ['college', '#34495E', '#FFD700', '#FFFFFF', 'light', '#34495E', '#FFD700', '#FFFFFF'],
        ['lycee',   '#00E5FF', '#FF6B35', '#FFFFFF', 'light', '#00E5FF', '#FF6B35', '#FFFFFF'],
        ['adult',   '#111827', '#374151', '#1F2937', 'dark',  '#111827', '#374151', '#FFFFFF'],
      ];

      await db.runAsync('DELETE FROM branding');
      for (const brand of brandingSeed) {
        await db.runAsync(
          `INSERT INTO branding (
            id, primary_color, accent_color, surface_color, theme_mode, 
            header_bg_color, header_accent_color, text_on_main_color
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          brand
        );
      }

      // ========== 2. IDENTITY PALETTES ==========
      const palettes = [
        ['primary', 0, '#FF5722'], ['primary', 1, '#FFCE00'],
        ['college', 0, '#34495E'], ['college', 1, '#FFD700'],
        ['lycee',   0, '#00E5FF'], ['lycee',   1, '#FF6B35'],
        ['adult',   0, '#111827'], ['adult',   1, '#374151'],
      ];

      await db.runAsync('DELETE FROM identity_palettes');
      for (const p of palettes) {
        await db.runAsync(
          `INSERT INTO identity_palettes (identity_id, color_index, color_value) VALUES (?, ?, ?)`,
          p
        );
      }

      // ========== 3. LEVEL LABELS (Génériques) ==========
      const adultLevelLabels = [
        [1, 'adult', 'Niveau 1', 'N1', 'Débutant'],
        [2, 'adult', 'Niveau 2', 'N2', 'Élémentaire'],
        [3, 'adult', 'Niveau 3', 'N3', 'Intermédiaire'],
        [4, 'adult', 'Niveau 4', 'N4', 'Avancé'],
      ];

      // On ne supprime que les labels globaux (ceux qui n'ont pas de family_id)
      await db.runAsync('DELETE FROM level_labels WHERE family_id IS NULL');
      
      for (const label of adultLevelLabels) {
        await db.runAsync(
          `INSERT INTO level_labels (level_number, identity_id, display_title, badge_text, display_description) 
           VALUES (?, ?, ?, ?, ?)`,
          label
        );
      }

      console.log('[Migration 002] ✓ Whitelabel data seeded (No progress_color)');

    } catch (error) {
      console.error('[Migration 002] ✗ Critical Seed Error:', error);
      throw error;
    } finally {
      // 2. Réactivation impérative des contraintes
      await db.execAsync('PRAGMA foreign_keys = ON;');
    }
  }
);