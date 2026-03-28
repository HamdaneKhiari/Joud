/**
 * ============================================
 * MIGRATION V2 - 002: Seed Config
 * Branding, modules, levels, families,
 * identity_palettes, module_availability
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from '../migrations/runner';

export default createMigration(
  2,
  'seed_config',
  async (db: SQLite.SQLiteDatabase) => {

    // ============================================
    // BRANDING (4 identités)
    // ============================================
    await db.execAsync(`
      INSERT OR REPLACE INTO branding (
        id, primary_color, accent_color, surface_color, theme_mode,
        header_bg_color, header_accent_color, text_on_main_color,
        text_primary_color, text_secondary_color,
        header_emoji, header_welcome_text,
        daily_word_bg_color, daily_word_gradient, daily_word_decoration,
        dashboard_level_progress_color,
        ui_card_radius, ui_show_decorative_shapes, ui_card_mood
      ) VALUES
      ('primary', '#FF5722', '#FFCE00', '#FFFFFF', 'light',
       '#FF5722', '#FFCE00', '#FFFFFF', NULL, NULL,
       '🌈', 'Hello !',
       NULL, '["#FFF3E0","#FFE0B2"]', 'circles',
       '#FF5722', 20, 1, 'bubbly'),

      ('college', '#34495E', '#FFD700', '#FFFFFF', 'light',
       '#34495E', '#FFD700', '#FFFFFF', NULL, NULL,
       '📚', 'Bonjour,',
       NULL, '["#E8EAF6","#C5CAE9"]', 'none',
       '#34495E', 14, 1, 'playful'),

      ('lycee', '#00E5FF', '#FF6B35', '#FFFFFF', 'light',
       '#00E5FF', '#FF6B35', '#FFFFFF', NULL, NULL,
       '🎓', 'Bonjour,',
       '#E0F7FA', NULL, 'none',
       '#00E5FF', 12, 0, 'minimal'),

      ('adult', '#1E3A5F', '#D97706', '#FFFFFF', 'light',
       '#1E3A5F', '#D97706', '#FFFFFF', NULL, NULL,
       '💼', 'Welcome back,',
       '#F8FAFC', NULL, 'none',
       '#1E3A5F', 10, 0, 'executive');
    `);

    // ============================================
    // IDENTITY PALETTES
    // ============================================
    await db.execAsync(`
      INSERT OR REPLACE INTO identity_palettes (identity_id, color_index, color_value) VALUES
      ('primary', 0, '#FF5722'),
      ('primary', 1, '#FFCE00'),
      ('college', 0, '#34495E'),
      ('college', 1, '#FFD700'),
      ('lycee',   0, '#00E5FF'),
      ('lycee',   1, '#FF6B35'),
      ('adult',   0, '#1E3A5F'),
      ('adult',   1, '#D97706');
    `);

    // ============================================
    // MODULES (9 modules)
    // ============================================
    await db.execAsync(`
      INSERT OR REPLACE INTO modules (slug, name, icon_name, description, order_index, is_core, target_audience) VALUES
      ('vocab',        'Vocabulaire',    'book-alphabet',         'Enrichis ton vocabulaire',  1, 1, 'all'),
      ('phrase_types', 'Phrases',        'format-quote-close',    'Structure et syntaxe',      2, 1, 'all'),
      ('grammar',      'Grammaire',      'format-list-bulleted',  'Maîtrise les règles',       3, 1, 'all'),
      ('reading',      'Lecture',        'text-box',              'Analyse de textes',         4, 1, 'all'),
      ('dialogues',    'Conversation',   'chat',                  'Pratique dialogues',        5, 1, 'all'),
      ('word_games',   'Jeux',           'gamepad-variant',       'Exercices ludiques',        6, 1, 'all'),
      ('assessment',   'Évaluation',     'clipboard-check',       'Teste ton niveau',          7, 1, 'all'),
      ('connector',    'The Connector',  'connection',            'Syntax & articulation',     8, 0, 'lycee');
    `);

    // ============================================
    // LEVELS (4 par audience = 16)
    // ============================================
    const audiences = ['primary', 'college', 'lycee', 'adult'];
    const levelData = [
      { level: 1, title: 'Les Bases',    description: 'Fondamentaux essentiels' },
      { level: 2, title: "L'Essentiel",  description: 'Connaissances intermédiaires' },
      { level: 3, title: 'Avancé',       description: 'Maîtrise approfondie' },
      { level: 4, title: 'Expert',       description: 'Niveau supérieur' },
    ];

    for (const audience of audiences) {
      const baseId = { primary: 100, college: 200, lycee: 300, adult: 400 }[audience]!;
      for (const l of levelData) {
        await db.runAsync(
          `INSERT OR REPLACE INTO levels (id, level, title, icon, description, badge, target_audience)
           VALUES (?, ?, ?, 'bridge', ?, ?, ?)`,
          [baseId + l.level, l.level, l.title, l.description, l.level.toString(), audience]
        );
      }
    }

    // ============================================
    // FAMILIES (12 familles)
    // ============================================
    await db.execAsync(`
      -- Vocab (Core 100 - 6 familles)
      INSERT OR REPLACE INTO families (slug, module_slug, name, emoji, icon, description, order_index) VALUES
      ('the-glue',      'vocab', 'The Glue',       '🔗', 'link-variant',  'Structure & Grammaire',            1),
      ('action-center', 'vocab', 'Action Center',   '⚡', 'run-fast',      'Verbes essentiels pour agir',       2),
      ('human-world',   'vocab', 'Human World',     '👥', 'account-group', 'Personnes & Émotions',             3),
      ('the-kingdom',   'vocab', 'The Kingdom',     '🏰', 'home',          'Lieux & Objets du quotidien',      4),
      ('quality-time',  'vocab', 'Quality & Time',  '⏰', 'clock',         'Nuances & Temps',                  5),
      ('social',        'vocab', 'Social',          '💬', 'comment',       'Interactions sociales',            6);

      -- Grammar
      INSERT OR REPLACE INTO families (slug, module_slug, name, icon, emoji, description, order_index) VALUES
      ('present', 'grammar', 'Present Tense', 'clock-outline', '⏰', 'Le présent simple', 1);

      -- Phrases
      INSERT OR REPLACE INTO families (slug, module_slug, name, icon, emoji, description, order_index) VALUES
      ('daily_life', 'phrase_types', 'Daily Life', 'home', '🏠', 'Phrases du quotidien', 1);

      -- Word Games (3 familles)
      INSERT OR REPLACE INTO families (slug, module_slug, name, icon, emoji, description, order_index) VALUES
      ('definition_master', 'word_games', 'Definition Master', 'book-open-variant', '📖', 'Maîtrisez les définitions', 1),
      ('grammar_detective', 'word_games', 'Grammar Detective', 'magnify', '🕵️', 'Analyse grammaticale', 2),
      ('quick_match',       'word_games', 'Quick Match',       'lightning-bolt',    '⚡', 'Reliez les mots vite', 3);

      -- Assessment
      INSERT OR REPLACE INTO families (slug, module_slug, name, icon, emoji, description, order_index) VALUES
      ('assessment_pool', 'assessment', 'Assessment Pool', 'clipboard-check', '📝', 'Évaluation globale', 1);
    `);

    // ============================================
    // MODULE AVAILABILITY (7 core × 4 audiences × 4 levels + connector)
    // ============================================
    const coreModules = ['vocab', 'phrase_types', 'grammar', 'reading', 'dialogues', 'word_games', 'assessment'];

    for (const mod of coreModules) {
      for (const aud of audiences) {
        for (let level = 1; level <= 4; level++) {
          await db.runAsync(
            `INSERT OR REPLACE INTO module_availability (module_slug, identity_id, level_number, is_available)
             VALUES (?, ?, ?, 1)`,
            [mod, aud, level]
          );
        }
      }
    }

    // Connector uniquement pour lycée
    await db.runAsync(
      `INSERT OR REPLACE INTO module_availability (module_slug, identity_id, level_number, is_available)
       VALUES ('connector', 'lycee', 1, 1)`
    );

    // ============================================
    // GLOBAL LEVEL LABELS (4 levels × 4 identités = 16)
    // ============================================
    const labelConfig: Record<string, { titles: string[]; badges: string[]; descs: string[] }> = {
      primary: {
        titles: ['Les Bases', "L'Essentiel", 'Avancé', 'Expert'],
        badges: ['1', '2', '3', '4'],
        descs:  ['Premiers pas', 'On progresse', 'On monte', 'Tu gères'],
      },
      college: {
        titles: ['Les Bases', "L'Essentiel", 'Avancé', 'Expert'],
        badges: ['1', '2', '3', '4'],
        descs:  ['Fondamentaux', 'Intermédiaire', 'Confirmé', 'Expert'],
      },
      lycee: {
        titles: ['Les Bases', "L'Essentiel", 'Avancé', 'Expert'],
        badges: ['N1', 'N2', 'N3', 'N4'],
        descs:  ['Fondamentaux', 'Consolidation', 'Approfondissement', 'Maîtrise'],
      },
      adult: {
        titles: ['Niveau 1', 'Niveau 2', 'Niveau 3', 'Niveau 4'],
        badges: ['N1', 'N2', 'N3', 'N4'],
        descs:  ['Débutant', 'Élémentaire', 'Intermédiaire', 'Avancé'],
      },
    };

    for (const [identity, cfg] of Object.entries(labelConfig)) {
      for (let i = 0; i < 4; i++) {
        await db.runAsync(
          `INSERT OR REPLACE INTO level_labels (level_number, identity_id, display_title, badge_text, display_description)
           VALUES (?, ?, ?, ?, ?)`,
          [i + 1, identity, cfg.titles[i], cfg.badges[i], cfg.descs[i]]
        );
      }
    }
  }
);
