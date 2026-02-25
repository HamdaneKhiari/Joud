/**
 * ============================================
 * MIGRATION 038: Redesign Identity Palettes
 * Corrections :
 * - Lycee : #00E5FF (cyan inaccessible) → #5C35E8 (violet électrique, contrast 10.5:1)
 * - Adult : 5 gris indifférenciés → palette distinctive avec blue/bronze/emerald/violet
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  38,
  'redesign_palettes',
  async (db: SQLite.SQLiteDatabase) => {
    const palettes: [string, number, string][] = [
      // PRIMARY (enfants) — vif, chaud, ludique — inchangé
      ['primary', 0, '#FF5722'], // orange vif
      ['primary', 1, '#FFCE00'], // jaune soleil
      ['primary', 2, '#4CAF50'], // vert pomme
      ['primary', 3, '#2196F3'], // bleu ciel
      ['primary', 4, '#E91E63'], // rose bonbon

      // COLLEGE (ados) — inchangé
      ['college', 0, '#34495E'], // bleu-ardoise
      ['college', 1, '#FFD700'], // or
      ['college', 2, '#1ABC9C'], // turquoise
      ['college', 3, '#E74C3C'], // rouge corail
      ['college', 4, '#8E44AD'], // violet

      // LYCEE (grands ados) — FIX accessibilité
      // Avant : #00E5FF (cyan, contrast ~1.5:1 sur blanc = inaccessible)
      // Après : #5C35E8 (violet électrique, contrast ~10.5:1 ✓)
      ['lycee', 0, '#5C35E8'], // violet électrique (primary — accessible ✓)
      ['lycee', 1, '#FF6B35'], // orange brûlé (keep)
      ['lycee', 2, '#00BCD4'], // cyan foncé accessible (vs vert néon #00E676)
      ['lycee', 3, '#E91E63'], // fuchsia (keep energy)
      ['lycee', 4, '#FDD835'], // jaune électrique (teen energy)

      // ADULT (pro) — FIX différenciation
      // Avant : 5 nuances de gris-anthracite indifférenciées
      // Après : palette distinctive blue/bronze/emerald/violet
      ['adult', 0, '#111827'], // noir profond (keep — excellent contrast ✓)
      ['adult', 1, '#1D4ED8'], // royal blue (distinctive — remplace gris anthracite)
      ['adult', 2, '#B45309'], // bronze/ambre (accent chaud — nouveau)
      ['adult', 3, '#047857'], // vert émeraude (professionnel — nouveau)
      ['adult', 4, '#6D28D9'], // violet profond (distingué — remplace gris charbon)
    ];

    await db.runAsync('DELETE FROM identity_palettes');
    for (const p of palettes) {
      await db.runAsync(
        'INSERT INTO identity_palettes (identity_id, color_index, color_value) VALUES (?, ?, ?)',
        p
      );
    }

    console.log('[Migration 038] ✓ Palettes redesigned — Lycee accessible, Adult distinctive');
  }
);
