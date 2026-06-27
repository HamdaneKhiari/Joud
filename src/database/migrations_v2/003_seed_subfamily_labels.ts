/**
 * ============================================
 * MIGRATION V2 - 003: Seed Subfamily Labels
 * Labels des sous-familles pour les familles à structure prédéfinie :
 * - Vocab Core (the-glue, action-center, human-world, the-kingdom, quality-time, social)
 * - Dialogues (at_restaurant, shopping, social_conversations)
 * - Reading (short_stories, articles, professional)
 *
 * NON inclus ici (viennent du script Python via Excel) :
 * - Phrase types (Family IDs 1→10 collège, 30 sous-familles)
 * - Connector (pas de sous-familles, subfamily_id=0)
 * - Word games (pas de sous-familles, subfamily_id=0)
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from '../migrations/runner';

// ============================================
// VOCAB CORE — 6 familles, sous-familles par level
// ============================================
const VOCAB_SUBFAMILY_CONFIG: Record<string, { level: number; title: string; icon: string; desc: string }[]> = {
  'the-glue': [
    { level: 1, title: 'Pronouns',        icon: 'account-circle', desc: 'I, you, he, she...' },
    { level: 2, title: 'Questions',        icon: 'help-circle',    desc: 'Who, what, where...' },
    { level: 3, title: 'Connectors',       icon: 'link-variant',   desc: 'And, but, because...' },
    { level: 4, title: 'Determiners',      icon: 'text-box',       desc: 'A, the, this, some...' },
    { level: 5, title: 'Space & Position', icon: 'map-marker',     desc: 'In, on, at, under...' },
    { level: 6, title: 'Negation',         icon: 'close-circle',   desc: 'Yes, no, not' },
  ],
  'action-center': [
    { level: 1, title: 'Super Verbs',     icon: 'flash', desc: 'Be, have, do, go...' },
    { level: 2, title: 'Desires & Modal', icon: 'heart', desc: 'Want, like, can' },
    { level: 3, title: 'Senses & Brain',  icon: 'brain', desc: 'Know, think, see...' },
    { level: 4, title: 'Daily Actions',   icon: 'food',  desc: 'Eat, drink, sleep...' },
  ],
  'human-world': [
    { level: 1, title: 'People',            icon: 'account-group',        desc: 'Man, woman, child...' },
    { level: 2, title: 'Feelings & States', icon: 'emoticon-happy',       desc: 'Happy, sad, hungry...' },
    { level: 3, title: 'Identity',          icon: 'card-account-details', desc: 'Name, age, origin' },
  ],
  'the-kingdom': [
    { level: 1, title: 'Environment', icon: 'home-city', desc: 'School, house, water...' },
  ],
  'quality-time': [
    { level: 1, title: 'Opposites',    icon: 'compare',       desc: 'Big, small, good, bad' },
    { level: 2, title: 'Time Markers', icon: 'clock-outline', desc: 'Now, today, always...' },
  ],
  'social': [
    { level: 1, title: 'Greetings', icon: 'hand-wave', desc: 'Hello, thanks, please' },
  ],
};

// ============================================
// DIALOGUES — 3 familles, 3 sous-familles × 4 identités
// ============================================
type SubfamilySeed = [string, number, string, string, string, string];

const DIALOGUES_SUBFAMILY_SEEDS: SubfamilySeed[] = [
  // at_restaurant
  ['at_restaurant', 1, 'adult',   'Ordering',   'silverware',   'Commander un repas'],
  ['at_restaurant', 2, 'adult',   'Complaining','alert-circle', 'Faire une réclamation'],
  ['at_restaurant', 3, 'adult',   'Paying',     'cash',         "Demander et payer l'addition"],
  ['at_restaurant', 1, 'lycee',   'Ordering',   'silverware',   'Commander'],
  ['at_restaurant', 2, 'lycee',   'Issues',     'alert-circle', 'Problèmes'],
  ['at_restaurant', 3, 'lycee',   'Paying',     'cash',         'Payer'],
  ['at_restaurant', 1, 'college', 'Ordering',   'silverware',   'Commander'],
  ['at_restaurant', 2, 'college', 'Talking',    'chat',         'Discuter'],
  ['at_restaurant', 3, 'college', 'Paying',     'cash',         'Payer'],
  ['at_restaurant', 1, 'primary', 'Food',       'food',         'La nourriture'],
  ['at_restaurant', 2, 'primary', 'Drinks',     'cup',          'Les boissons'],
  ['at_restaurant', 3, 'primary', 'Thank You',  'heart',        'Dire merci'],

  // shopping
  ['shopping', 1, 'adult',   'Asking for Help', 'help-circle',       "Demander de l'aide"],
  ['shopping', 2, 'adult',   'Trying On',       'hanger',            'Essayer des vêtements'],
  ['shopping', 3, 'adult',   'Paying',          'credit-card',       'Payer ses achats'],
  ['shopping', 1, 'lycee',   'Looking Around',  'eye',               'Regarder'],
  ['shopping', 2, 'lycee',   'Asking',          'help-circle',       'Demander'],
  ['shopping', 3, 'lycee',   'Buying',          'credit-card',       'Acheter'],
  ['shopping', 1, 'college', 'Looking',         'eye',               'Regarder'],
  ['shopping', 2, 'college', 'Choosing',        'hand-pointing-up',  'Choisir'],
  ['shopping', 3, 'college', 'Buying',          'cart',              'Acheter'],
  ['shopping', 1, 'primary', 'In the Store',    'store',             'Au magasin'],
  ['shopping', 2, 'primary', 'I Want',          'hand-pointing-right','Je veux'],
  ['shopping', 3, 'primary', 'Paying',          'cash-multiple',     'Payer'],

  // social_conversations
  ['social_conversations', 1, 'adult',   'Meeting People', 'account-multiple', 'Faire connaissance'],
  ['social_conversations', 2, 'adult',   'Small Talk',     'chat',             'Discussion informelle'],
  ['social_conversations', 3, 'adult',   'Making Plans',   'calendar',         'Organiser une sortie'],
  ['social_conversations', 1, 'lycee',   'Meeting People', 'account-multiple', 'Rencontrer'],
  ['social_conversations', 2, 'lycee',   'Chatting',       'chat',             'Discuter'],
  ['social_conversations', 3, 'lycee',   'Plans',          'calendar',         'Faire des plans'],
  ['social_conversations', 1, 'college', 'New Friends',    'account-multiple', 'Nouveaux amis'],
  ['social_conversations', 2, 'college', 'Talking',        'chat-processing',  'Parler'],
  ['social_conversations', 3, 'college', 'Activities',     'basketball',       'Activités'],
  ['social_conversations', 1, 'primary', 'Hello!',         'hand-wave',        'Dire bonjour'],
  ['social_conversations', 2, 'primary', 'Playing',        'gamepad-variant',  'Jouer ensemble'],
  ['social_conversations', 3, 'primary', 'Friends',        'account-heart',    'Les amis'],
];

// ============================================
// READING — 3 familles, 3 sous-familles × 4 identités
// ============================================
const READING_SUBFAMILY_SEEDS: SubfamilySeed[] = [
  // short_stories
  ['short_stories', 1, 'adult',   'Adventure',  'compass',       "Histoires d'aventure"],
  ['short_stories', 2, 'adult',   'Family',     'home-heart',    'Histoires de famille'],
  ['short_stories', 3, 'adult',   'Friendship', 'account-heart', "Histoires d'amitié"],
  ['short_stories', 1, 'lycee',   'Adventure',  'compass',       'Aventures'],
  ['short_stories', 2, 'lycee',   'Daily Life', 'home',          'Vie quotidienne'],
  ['short_stories', 3, 'lycee',   'Emotions',   'emoticon',      'Émotions'],
  ['short_stories', 1, 'college', 'Adventure',  'treasure-chest','Aventure'],
  ['short_stories', 2, 'college', 'School',     'school',        'École'],
  ['short_stories', 3, 'college', 'Friends',    'account-group', 'Amis'],
  ['short_stories', 1, 'primary', 'Animals',    'paw',           'Les animaux'],
  ['short_stories', 2, 'primary', 'Family',     'home',          'La famille'],
  ['short_stories', 3, 'primary', 'Fun',        'star',          'Histoires drôles'],

  // articles
  ['articles', 1, 'adult',   'News',           'newspaper',  'Actualités du monde'],
  ['articles', 2, 'adult',   'Science',        'flask',      'Découvertes scientifiques'],
  ['articles', 3, 'adult',   'Culture',        'theater',    'Arts et culture'],
  ['articles', 1, 'lycee',   'Current Events', 'newspaper',  'Actualité'],
  ['articles', 2, 'lycee',   'Technology',     'cellphone',  'Technologie'],
  ['articles', 3, 'lycee',   'Sports',         'soccer',     'Sports'],
  ['articles', 1, 'college', 'News',           'earth',      'Les nouvelles'],
  ['articles', 2, 'college', 'Nature',         'tree',       'La nature'],
  ['articles', 3, 'college', 'Technology',     'robot',      'Technologie'],
  ['articles', 1, 'primary', 'Nature',         'flower',     'La nature'],
  ['articles', 2, 'primary', 'Animals',        'dog',        'Les animaux'],
  ['articles', 3, 'primary', 'Space',          'rocket',     "L'espace"],

  // professional
  ['professional', 1, 'adult',   'Emails',        'email',        'Emails professionnels'],
  ['professional', 2, 'adult',   'Reports',       'file-document','Rapports activité'],
  ['professional', 3, 'adult',   'Letters',       'text-box',     'Courriers formels'],
  ['professional', 1, 'lycee',   'Emails',        'email',        'Emails'],
  ['professional', 2, 'lycee',   'Letters',       'text-box',     'Lettres'],
  ['professional', 3, 'lycee',   'CV',            'file-account', 'CV et lettres de motivation'],
  ['professional', 1, 'college', 'Simple Emails', 'email',        'Emails simples'],
  ['professional', 2, 'college', 'Messages',      'message',      'Messages'],
  ['professional', 3, 'college', 'Notes',         'note',         'Notes'],
  ['professional', 1, 'primary', 'Messages',      'message-text', 'Messages'],
  ['professional', 2, 'primary', 'Cards',         'card-text',    'Cartes'],
  ['professional', 3, 'primary', 'Notes',         'pencil',       'Petites notes'],
];

const IDENTITIES = ['primary', 'college', 'lycee', 'adult'];

export default createMigration(
  3,
  'seed_subfamily_labels',
  async (db: SQLite.SQLiteDatabase) => {

    // ----------------------------------------
    // 1. Vocab Core subfamily labels
    // ----------------------------------------
    for (const [familySlug, subfamilies] of Object.entries(VOCAB_SUBFAMILY_CONFIG)) {
      const family = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM families WHERE slug = ?',
        [familySlug]
      );

      if (!family) {
        console.warn(`[V2-003] Family '${familySlug}' not found, skipping`);
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

    // ----------------------------------------
    // 2. Dialogues subfamily labels
    // ----------------------------------------
    for (const [famSlug, subId, identity, title, icon, desc] of DIALOGUES_SUBFAMILY_SEEDS) {
      const family = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM families WHERE slug = ?',
        [famSlug]
      );

      if (!family) {
        console.warn(`[V2-003] Dialogue family '${famSlug}' not found, skipping`);
        continue;
      }

      await db.runAsync(
        `INSERT OR REPLACE INTO level_labels
         (family_id, level_number, identity_id, display_title, icon_name, display_description, badge_text)
         VALUES (?, ?, ?, ?, ?, ?, '')`,
        [family.id, subId, identity, title, icon, desc]
      );
    }

    // ----------------------------------------
    // 3. Reading subfamily labels
    // ----------------------------------------
    for (const [famSlug, subId, identity, title, icon, desc] of READING_SUBFAMILY_SEEDS) {
      const family = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM families WHERE slug = ?',
        [famSlug]
      );

      if (!family) {
        console.warn(`[V2-003] Reading family '${famSlug}' not found, skipping`);
        continue;
      }

      await db.runAsync(
        `INSERT OR REPLACE INTO level_labels
         (family_id, level_number, identity_id, display_title, icon_name, display_description, badge_text)
         VALUES (?, ?, ?, ?, ?, ?, '')`,
        [family.id, subId, identity, title, icon, desc]
      );
    }

    // eslint-disable-next-line no-console
    console.log('[Migration V2-003] ✓ Subfamily labels seedés (vocab, dialogues, reading)');
  }
);
