/**
 * ============================================
 * MIGRATION 016: Seed Connector Content
 * Contenu Connector pour LYCÉE uniquement
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  17,
  'seed_content_connector',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer les IDs des familles Connector
    const logicalLinks = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'logical_links'`
    );
    const sentenceFusion = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'sentence_fusion'`
    );
    const rephrasing = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'rephrasing'`
    );

    const logicalLinksId = logicalLinks?.id || 1;
    const sentenceFusionId = sentenceFusion?.id || 2;
    const rephrasingId = rephrasing?.id || 3;

    // ⬇️⬇️⬇️ AJOUTE TON CONTENU ICI ⬇️⬇️⬇️
    const contentSeed: any[] = [
      // Structure : [family_id, level, content_type, JSON.stringify({...}), difficulty, tags, target_audience]

      // ===== EXEMPLE LOGICAL LINKS - LYCÉE NIVEAU 1 =====
      // [
      //   logicalLinksId,
      //   1,
      //   'logic',  // Type dépend de ConnectorCardRenderer
      //   JSON.stringify({
      //     question: 'Choose the correct connector: I studied hard, ___ I failed the exam.',
      //     options: ['therefore', 'however', 'moreover', 'furthermore'],
      //     correct_answer: 'however',
      //     explanation: '"However" exprime une opposition/contraste'
      //   }),
      //   'medium',
      //   'connectors,logic,contrast',
      //   'lycee'  // IMPORTANT : target_audience = 'lycee' uniquement
      // ],

      // ===== LOGICAL LINKS =====
      // Lycee niveau 1 : Connecteurs basiques (and, but, or, so)
      // Lycee niveau 2 : Connecteurs moyens (however, therefore, moreover)
      // Lycee niveau 3 : Connecteurs avancés (nevertheless, furthermore, whereas)
      // Lycee niveau 4 : Connecteurs complexes (notwithstanding, albeit, albeit)

      // ===== SENTENCE FUSION =====
      // Lycee niveau 1-4 : Fusionner deux phrases simples en une complexe

      // ===== REPHRASING =====
      // Lycee niveau 1-4 : Reformuler une phrase en gardant le sens
    ];

    // Nettoyage avant insertion
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "connector")'
    );

    // Insertion du contenu
    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log(`[Migration 016] ✓ Connector content seeded (${contentSeed.length} items)`);
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "connector")'
    );
    console.log('[Migration 016] ✓ Connector content cleared');
  }
);
