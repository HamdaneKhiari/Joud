/**
 * ============================================
 * MIGRATION 037: Enrich Identity Palettes
 * Passe de 2 couleurs à 5 couleurs par identité
 * pour une meilleure différenciation des modules
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  37,
  'enrich_identity_palettes',
  async (db: SQLite.SQLiteDatabase) => {
    // Palettes enrichies — chaque identité garde son caractère white-label
    const palettes: [string, number, string][] = [
      // PRIMARY (enfants) — vif, chaud, ludique
      ['primary', 0, '#FF5722'], // orange vif (primary)
      ['primary', 1, '#FFCE00'], // jaune soleil (accent)
      ['primary', 2, '#4CAF50'], // vert pomme
      ['primary', 3, '#2196F3'], // bleu ciel
      ['primary', 4, '#E91E63'], // rose bonbon

      // COLLEGE (ados) — moderne, contrasté
      ['college', 0, '#34495E'], // bleu-ardoise (primary)
      ['college', 1, '#FFD700'], // or (accent)
      ['college', 2, '#1ABC9C'], // turquoise
      ['college', 3, '#E74C3C'], // rouge corail
      ['college', 4, '#8E44AD'], // violet

      // LYCEE (grands ados) — dynamique, néon
      ['lycee', 0, '#00E5FF'], // cyan électrique (primary)
      ['lycee', 1, '#FF6B35'], // orange brûlé (accent)
      ['lycee', 2, '#7C4DFF'], // violet profond
      ['lycee', 3, '#00E676'], // vert néon
      ['lycee', 4, '#FF4081'], // rose fuchsia

      // ADULT (pro) — sobre, élégant
      ['adult', 0, '#111827'], // noir profond (primary)
      ['adult', 1, '#374151'], // gris anthracite (accent)
      ['adult', 2, '#1E3A5F'], // bleu nuit
      ['adult', 3, '#4A5568'], // gris ardoise
      ['adult', 4, '#2D3748'], // gris charbon
    ];

    await db.runAsync('DELETE FROM identity_palettes');
    for (const p of palettes) {
      await db.runAsync(
        'INSERT INTO identity_palettes (identity_id, color_index, color_value) VALUES (?, ?, ?)',
        p
      );
    }

    console.log('[Migration 037] ✓ Identity palettes enriched (5 colors per identity)');
  }
);
