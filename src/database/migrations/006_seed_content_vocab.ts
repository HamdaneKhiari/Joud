import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  6,
  'seed_content_vocab',
  async (db: SQLite.SQLiteDatabase) => {
    const foodFam = await db.getFirstAsync<{id: number}>('SELECT id FROM families WHERE slug = "food_drinks"');
    if (!foodFam) return;

    const familyId = foodFam.id;

    // Format : [family_id, subfamily_id, type, data_json]
    const contentSeed = [
      // SUBFAMILY 1 : LE SALÉ
      [familyId, 1, 'word', JSON.stringify({ word: 'Water', translation: 'Eau', image: '💧' })],
      [familyId, 1, 'word', JSON.stringify({ word: 'Bread', translation: 'Pain', image: '🍞' })],
      
      // SUBFAMILY 2 : LE SUCRÉ
      [familyId, 2, 'word', JSON.stringify({ word: 'Coffee', translation: 'Café', image: '☕' })],
      [familyId, 2, 'word', JSON.stringify({ word: 'Tea', translation: 'Thé', image: '🍵' })],
    ];

    await db.runAsync('DELETE FROM content WHERE family_id = ?', [familyId]);

    for (const [famId, subId, type, data] of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience) 
         VALUES (?, ?, ?, ?, 'easy', 'core', 'all')`,
        [famId, subId, type, data]
      );
    }
  },
  async (db: SQLite.SQLiteDatabase) => {}
);