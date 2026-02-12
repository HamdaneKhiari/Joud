/**
 * ============================================
 * MIGRATION V2 - 003: Seed Subfamily Labels
 * Labels des sous-familles pour les familles vocab Core 100
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from '../migrations/runner';

// Définition des sous-familles par famille
const SUBFAMILY_CONFIG: Record<string, { level: number; title: string; icon: string; desc: string }[]> = {
  'the-glue': [
    { level: 1, title: 'Pronouns',         icon: 'account-circle', desc: 'I, you, he, she...' },
    { level: 2, title: 'Questions',         icon: 'help-circle',    desc: 'Who, what, where...' },
    { level: 3, title: 'Connectors',        icon: 'link-variant',   desc: 'And, but, because...' },
    { level: 4, title: 'Determiners',       icon: 'text-box',       desc: 'A, the, this, some...' },
    { level: 5, title: 'Space & Position',  icon: 'map-marker',     desc: 'In, on, at, under...' },
    { level: 6, title: 'Negation',          icon: 'close-circle',   desc: 'Yes, no, not' },
  ],
  'action-center': [
    { level: 1, title: 'Super Verbs',     icon: 'flash',  desc: 'Be, have, do, go...' },
    { level: 2, title: 'Desires & Modal', icon: 'heart',  desc: 'Want, like, can' },
    { level: 3, title: 'Senses & Brain',  icon: 'brain',  desc: 'Know, think, see...' },
    { level: 4, title: 'Daily Actions',   icon: 'food',   desc: 'Eat, drink, sleep...' },
  ],
  'human-world': [
    { level: 1, title: 'People',             icon: 'account-group',        desc: 'Man, woman, child...' },
    { level: 2, title: 'Feelings & States',  icon: 'emoticon-happy',       desc: 'Happy, sad, hungry...' },
    { level: 3, title: 'Identity',           icon: 'card-account-details', desc: 'Name' },
  ],
  'the-kingdom': [
    { level: 1, title: 'Environment', icon: 'home-city', desc: 'School, house, water...' },
  ],
  'quality-time': [
    { level: 1, title: 'Opposites',     icon: 'compare',       desc: 'Big, small, good, bad' },
    { level: 2, title: 'Time Markers',  icon: 'clock-outline', desc: 'Now, today, always...' },
  ],
  'social': [
    { level: 1, title: 'Greetings', icon: 'hand-wave', desc: 'Hello, thanks, please' },
  ],
};

const IDENTITIES = ['primary', 'college', 'lycee', 'adult'];

export default createMigration(
  3,
  'seed_subfamily_labels',
  async (db: SQLite.SQLiteDatabase) => {
    for (const [familySlug, subfamilies] of Object.entries(SUBFAMILY_CONFIG)) {
      // Résoudre le family_id depuis le slug
      const family = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM families WHERE slug = ?',
        [familySlug]
      );

      if (!family) {
        console.warn(`[Migration 003] Family '${familySlug}' not found, skipping labels`);
        continue;
      }

      for (const identity of IDENTITIES) {
        for (const sub of subfamilies) {
          await db.runAsync(
            `INSERT OR REPLACE INTO level_labels
             (family_id, level_number, identity_id, display_title, icon_name, display_description, badge_text)
             VALUES (?, ?, ?, ?, ?, ?, '')`,
            [family.id, sub.level, identity, sub.title, sub.icon, sub.desc]
          );
        }
      }
    }
  }
);
