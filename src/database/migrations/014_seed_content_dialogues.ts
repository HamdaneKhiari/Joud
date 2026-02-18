/**
 * ============================================
 * MIGRATION 013: Seed Dialogues Content
 * Contenu Dialogues pour TOUS les publics
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  14,
  'seed_content_dialogues',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer les IDs des familles Dialogues
    const airport = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'at_airport'`
    );
    const interview = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'job_interview'`
    );
    const friends = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'meeting_friends'`
    );

    const airportId = airport?.id || 1;
    const interviewId = interview?.id || 2;
    const friendsId = friends?.id || 3;

    // ⬇️⬇️⬇️ AJOUTE TON CONTENU ICI ⬇️⬇️⬇️
    const contentSeed: any[] = [
      // Structure : [family_id, level, content_type, JSON.stringify({...}), difficulty, tags, target_audience]

      // ===== EXEMPLE AT AIRPORT - PRIMARY NIVEAU 1 =====
      // [
      //   airportId,
      //   1,
      //   'dialogue',
      //   JSON.stringify({
      //     title: 'At the Airport',
      //     dialogue: [
      //       { speaker: 'Agent', text: 'Good morning! Passport please.' },
      //       { speaker: 'You', text: 'Here you go.' },
      //       { speaker: 'Agent', text: 'Thank you. Where are you traveling today?' },
      //       { speaker: 'You', text: 'I\'m going to Paris.' }
      //     ],
      //     questions: [
      //       {
      //         question: 'Where is the traveler going?',
      //         options: ['Paris', 'London', 'New York', 'Berlin'],
      //         correct_answer: 'Paris'
      //       },
      //       {
      //         question: 'What does the agent ask for first?',
      //         options: ['Passport', 'Ticket', 'Money', 'Bag'],
      //         correct_answer: 'Passport'
      //       }
      //     ]
      //   }),
      //   'easy',
      //   'travel,airport',
      //   'primary'  // PUBLIC : primary, college, lycee, adult, ou 'all'
      // ],

      // ===== AT AIRPORT =====
      // Primary niveau 1-4 : Dialogues simples
      // College niveau 1-4 : Dialogues moyens
      // Lycee niveau 1-4 : Dialogues complexes
      // Adult niveau 1-7 : Dialogues professionnels

      // ===== JOB INTERVIEW =====
      // College niveau 3-4 : Entretiens basiques
      // Lycee niveau 1-4 : Entretiens standard
      // Adult niveau 1-7 : Entretiens avancés

      // ===== MEETING FRIENDS =====
      // Primary niveau 1-4 : Rencontres amicales simples
      // College niveau 1-4 : Conversations moyennes
      // Lycee niveau 1-4 : Discussions complexes
      // Adult niveau 1-7 : Networking
    ];

    // Nettoyage avant insertion
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "dialogues")'
    );

    // Insertion du contenu
    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log(`[Migration 013] ✓ Dialogues content seeded (${contentSeed.length} items)`);
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "dialogues")'
    );
    console.log('[Migration 013] ✓ Dialogues content cleared');
  }
);
