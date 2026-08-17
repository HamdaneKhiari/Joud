/**
 * Migration 002 : seed de la config, état consolidé final (incorpore
 * l'ensemble des anciennes migrations 002→039 relatives à la config).
 * - Branding 4 identités, palettes 5 couleurs
 * - Modules (sans fastvocab), levels (4 par audience)
 * - Families (vocab core + dialogues + reading + word_games)
 * - Module availability (connector lycee 1-4 + adult 1-4)
 * - Feedback messages, daily words
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  2,
  'seed_config',
  async (db: SQLite.SQLiteDatabase) => {

    // ============================================
    // BRANDING (4 identités — état final migration 035)
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
       '#FF5722', '#FFFFFF', '#FFFFFF', NULL, NULL,
       '🌈', 'Salut,',
       NULL, '["#FFF3E0","#FFE0B2"]', 'circles',
       '#FF5722', 20, 1, 'bubbly'),

      ('college', '#34495E', '#FFD700', '#FFFFFF', 'light',
       '#34495E', '#FFD700', '#FFFFFF', NULL, NULL,
       '📚', 'Bonjour,',
       NULL, '["#E8EAF6","#C5CAE9"]', 'none',
       '#34495E', 14, 1, 'playful'),

      ('lycee', '#5C35E8', '#FF6B35', '#FFFFFF', 'light',
       '#5C35E8', '#FFFFFF', '#FFFFFF', NULL, NULL,
       '🎓', 'Bonjour,',
       '#E0F7FA', NULL, 'none',
       '#5C35E8', 12, 0, 'minimal'),

      ('adult', '#1E3A5F', '#D97706', '#FFFFFF', 'light',
       '#1E3A5F', '#D97706', '#FFFFFF', NULL, NULL,
       '💼', 'Bon retour,',
       '#F8FAFC', NULL, 'none',
       '#1E3A5F', 10, 0, 'executive');
    `);

    // ============================================
    // IDENTITY PALETTES (5 couleurs — état final migration 038)
    // ============================================
    await db.execAsync(`
      INSERT OR REPLACE INTO identity_palettes (identity_id, color_index, color_value) VALUES
      -- PRIMARY (enfants) — vif, chaud, ludique
      ('primary', 0, '#FF5722'),
      ('primary', 1, '#FFCE00'),
      ('primary', 2, '#4CAF50'),
      ('primary', 3, '#2196F3'),
      ('primary', 4, '#E91E63'),

      -- COLLEGE (ados) — moderne, contrasté
      ('college', 0, '#34495E'),
      ('college', 1, '#FFD700'),
      ('college', 2, '#1ABC9C'),
      ('college', 3, '#E74C3C'),
      ('college', 4, '#8E44AD'),

      -- LYCEE (grands ados) — violet électrique accessible (contrast 10.5:1)
      ('lycee', 0, '#5C35E8'),
      ('lycee', 1, '#FF6B35'),
      ('lycee', 2, '#00BCD4'),
      ('lycee', 3, '#E91E63'),
      ('lycee', 4, '#FDD835'),

      -- ADULT (pro) — blue/bronze/emerald/violet distinctifs
      ('adult', 0, '#111827'),
      ('adult', 1, '#1D4ED8'),
      ('adult', 2, '#B45309'),
      ('adult', 3, '#047857'),
      ('adult', 4, '#6D28D9');
    `);

    // ============================================
    // MODULES (6 modules — sans fastvocab, sans grammar, sans assessment)
    // ============================================
    await db.execAsync(`
      INSERT OR REPLACE INTO modules (slug, name, icon_name, description, order_index, is_core, target_audience) VALUES
      ('vocab',        'Vocabulaire',    'book-alphabet',         'Enrichis ton vocabulaire',  1, 1, 'all'),
      ('phrase_types', 'Phrases',        'format-quote-close',    'Structure et syntaxe',      2, 1, 'all'),
      ('reading',      'Lecture',        'text-box',              'Analyse de textes',         3, 1, 'all'),
      ('dialogues',    'Conversation',   'chat',                  'Pratique dialogues',        4, 1, 'all'),
      ('word_games',   'Jeux',           'gamepad-variant',       'Exercices ludiques',        5, 1, 'all'),
      ('connector',    'The Connector',  'connection',            'Syntax & articulation',     6, 0, 'lycee');
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
    // FAMILIES
    // Seules les familles à structure prédéfinie sont ici.
    // Les familles phrase_types, connector
    // sont créées par le script Python (source : Excel).
    // ============================================
    await db.execAsync(`
      -- Vocab Core (6 familles — état final migration 030)
      INSERT OR REPLACE INTO families (slug, module_slug, name, emoji, icon, description, order_index) VALUES
      ('the-glue',      'vocab', 'The Glue',       '🔗', 'link-variant',  'Structure & Grammaire',         1),
      ('action-center', 'vocab', 'Action Center',   '⚡', 'run-fast',      'Verbes essentiels pour agir',   2),
      ('human-world',   'vocab', 'Human World',     '👥', 'account-group', 'Personnes & Émotions',          3),
      ('the-kingdom',   'vocab', 'The Kingdom',     '🏰', 'home',          'Lieux & Objets du quotidien',   4),
      ('quality-time',  'vocab', 'Quality & Time',  '⏰', 'clock',         'Nuances & Temps',               5),
      ('social',        'vocab', 'Social',          '💬', 'comment',       'Interactions sociales',         6);

      -- Dialogues (3 familles prédéfinies)
      INSERT OR REPLACE INTO families (slug, module_slug, name, icon, emoji, description, order_index) VALUES
      ('at_restaurant',       'dialogues', 'At the Restaurant',    'silverware',     '🍽️', 'Commander et payer',         1),
      ('shopping',            'dialogues', 'Shopping',             'cart',           '🛍️', 'Achats et magasins',         2),
      ('social_conversations','dialogues', 'Social Conversations', 'account-multiple','💬', 'Rencontres et discussions',  3);

      -- Reading (3 familles prédéfinies)
      INSERT OR REPLACE INTO families (slug, module_slug, name, icon, emoji, description, order_index) VALUES
      ('short_stories',  'reading', 'Short Stories', 'book-open-variant', '📖', 'Histoires courtes',       1),
      ('articles',       'reading', 'Articles',      'newspaper',         '📰', 'Articles et actualités',  2),
      ('professional',   'reading', 'Professional',  'briefcase',         '💼', 'Lecture professionnelle', 3);

      -- Word Games (2 familles — grammar_detective supprimé)
      INSERT OR REPLACE INTO families (slug, module_slug, name, icon, emoji, description, order_index) VALUES
      ('definition_master', 'word_games', 'Definition Master', 'book-open-variant', '📖', 'Maîtrisez les définitions', 1),
      ('quick_match',       'word_games', 'Quick Match',       'lightning-bolt',    '⚡', 'Reliez les mots vite',      2);
    `);

    // ============================================
    // MODULE AVAILABILITY
    // 5 core modules × 4 audiences × 4 levels
    // + connector lycee 1-4 + adult 1-4 (migration 039)
    // ============================================
    const coreModules = ['vocab', 'phrase_types', 'reading', 'dialogues', 'word_games'];

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

    // Connector : lycee + adult, niveaux 1-4
    for (const aud of ['lycee', 'adult']) {
      for (let level = 1; level <= 4; level++) {
        await db.runAsync(
          `INSERT OR REPLACE INTO module_availability (module_slug, identity_id, level_number, is_available)
           VALUES ('connector', ?, ?, 1)`,
          [aud, level]
        );
      }
    }

    // ============================================
    // GLOBAL LEVEL LABELS (4 levels × 4 identités)
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

    // ============================================
    // FEEDBACK MESSAGES (migration 009 — config UI)
    // ============================================
    await db.execAsync(`
      INSERT OR REPLACE INTO feedback_messages (identity_id, context, state, icon, title, message) VALUES
      -- PRIMARY
      ('primary', 'exercise',   'correct',            '🌟', 'Bravo !',          'Tu as trouvé la bonne réponse !'),
      ('primary', 'wordgames',  'correct',            '⭐', 'Super !',           'Bonne réponse, continue comme ça !'),
      ('primary', 'vocabulary', 'correct',            '✨', 'Excellent !',       'Tu connais bien ce mot !'),
      ('primary', 'exercise',   'incorrect_attempt_1','💪', 'Pas encore...',     'Essaie encore, tu peux le faire !'),
      ('primary', 'wordgames',  'incorrect_attempt_1','🤔', 'Oups !',            'Réfléchis bien et réessaie !'),
      ('primary', 'exercise',   'incorrect_attempt_2','🎯', 'Dernier essai !', 'Prends ton temps pour répondre.'),
      ('primary', 'wordgames',  'incorrect_attempt_2','🎯', 'Dernier essai !', 'Concentre-toi bien et tente ta chance !'),
      ('primary', 'exercise',   'skip',               '📖', 'Réponse',           'Voici la bonne réponse pour t''aider.'),
      ('primary', 'wordgames',  'skip',               '💡', 'La réponse',        'Ne t''inquiète pas, tu feras mieux la prochaine fois !'),

      -- COLLEGE
      ('college', 'exercise',   'correct',            '✓', 'Correct !',          'Bonne réponse, bien joué !'),
      ('college', 'wordgames',  'correct',            '✓', 'Exact !',            'Tu maîtrises bien, continue !'),
      ('college', 'vocabulary', 'correct',            '✓', 'Parfait !',          'Excellente réponse !'),
      ('college', 'exercise',   'incorrect_attempt_1','→', 'Pas tout à fait',    'Essaie à nouveau, tu y es presque.'),
      ('college', 'wordgames',  'incorrect_attempt_1','?', 'Incorrect',          'Réfléchis bien et réessaie.'),
      ('college', 'exercise',   'incorrect_attempt_2','!', 'Dernière tentative', 'Concentre-toi bien.'),
      ('college', 'wordgames',  'incorrect_attempt_2','!', 'Dernier essai',  'Analyse bien les indices avant de répondre.'),
      ('college', 'exercise',   'skip',               'ℹ', 'Réponse',            'Voici la bonne réponse.'),
      ('college', 'wordgames',  'skip',               'ℹ', 'Solution',           'Pas de problème, tu progresseras !'),

      -- LYCEE
      ('lycee', 'exercise',   'correct',            '✓', 'Correct',          'Réponse exacte, bon travail.'),
      ('lycee', 'wordgames',  'correct',            '✓', 'Juste',            'Bonne maîtrise du concept.'),
      ('lycee', 'vocabulary', 'correct',            '✓', 'Excellent',        'Vocabulaire bien assimilé.'),
      ('lycee', 'exercise',   'incorrect_attempt_1','×', 'Incorrect',        'Revois ta réponse.'),
      ('lycee', 'wordgames',  'incorrect_attempt_1','×', 'Faux',             'Réessaie avec attention.'),
      ('lycee', 'exercise',   'incorrect_attempt_2','!', 'Dernier essai',  'Analyse bien la question.'),
      ('lycee', 'wordgames',  'incorrect_attempt_2','!', 'Dernier essai',  'Observe bien la question et tente ta chance.'),
      ('lycee', 'exercise',   'skip',               'ℹ', 'Réponse correcte', 'Étudie cette solution.'),
      ('lycee', 'wordgames',  'skip',               'ℹ', 'Solution',         'Retiens bien pour la prochaine fois.'),

      -- ADULT (vouvoiement — seul public professionnel, se distingue du tutoiement étudiant)
      ('adult', 'exercise',   'correct',            '✓', 'Correct',            'Exact, bien joué.'),
      ('adult', 'wordgames',  'correct',            '✓', 'Exact',              'Bonne réponse.'),
      ('adult', 'vocabulary', 'correct',            '✓', 'Parfait',            'Bien joué.'),
      ('adult', 'exercise',   'incorrect_attempt_1','×', 'Incorrect',          'Réessayez.'),
      ('adult', 'wordgames',  'incorrect_attempt_1','×', 'Incorrect',          'Prenez le temps de réfléchir.'),
      ('adult', 'exercise',   'incorrect_attempt_2','!', 'Dernière tentative', 'Concentrez-vous.'),
      ('adult', 'wordgames',  'incorrect_attempt_2','!', 'Dernier essai',  'Prenez le temps de bien vérifier.'),
      ('adult', 'exercise',   'skip',               'ℹ', 'Réponse',            'Voici la bonne réponse.'),
      ('adult', 'wordgames',  'skip',               'ℹ', 'Solution',           'À retenir pour la prochaine fois.');
    `);

    // ============================================
    // DAILY WORDS (migration 010 — config UI)
    // ============================================
    await db.execAsync(`
      INSERT OR REPLACE INTO daily_words (identity_id, level, english, french, emoji, category, difficulty) VALUES
      -- PRIMARY
      ('primary', 1, 'Happy',      'Joyeux',      '😊', 'vocabulary', 'easy'),
      ('primary', 1, 'Cat',        'Chat',         '🐱', 'vocabulary', 'easy'),
      ('primary', 1, 'Sun',        'Soleil',       '☀️', 'vocabulary', 'easy'),
      ('primary', 1, 'Book',       'Livre',        '📚', 'vocabulary', 'easy'),
      ('primary', 2, 'Friendship', 'Amitié',       '🤝', 'vocabulary', 'medium'),
      ('primary', 2, 'Rainbow',    'Arc-en-ciel',  '🌈', 'vocabulary', 'medium'),
      ('primary', 3, 'Adventure',  'Aventure',     '🗺️', 'vocabulary', 'medium'),
      ('primary', 3, 'Courage',    'Courage',      '💪', 'vocabulary', 'medium'),

      -- COLLEGE
      ('college', 1, 'Resilience',     'Résilience',     '🌱', 'vocabulary', 'medium'),
      ('college', 1, 'Challenge',      'Défi',           '🎯', 'vocabulary', 'medium'),
      ('college', 2, 'Opportunity',    'Opportunité',    '🚪', 'vocabulary', 'medium'),
      ('college', 2, 'Achievement',    'Accomplissement','🏆', 'vocabulary', 'medium'),
      ('college', 3, 'Determination',  'Détermination',  '🔥', 'vocabulary', 'hard'),
      ('college', 3, 'Innovation',     'Innovation',     '💡', 'vocabulary', 'hard'),
      ('college', 3, 'Break the ice',  'Briser la glace','🧊', 'idiom',      'medium'),
      ('college', 4, 'Every cloud has a silver lining', 'À quelque chose malheur est bon', '☁️', 'idiom', 'hard'),

      -- LYCEE
      ('lycee', 1, 'Analysis',    'Analyse',       '🔍', 'vocabulary', 'medium'),
      ('lycee', 1, 'Perspective', 'Perspective',   '👁️', 'vocabulary', 'medium'),
      ('lycee', 2, 'Ambiguity',   'Ambiguïté',     '❓', 'vocabulary', 'hard'),
      ('lycee', 2, 'Synthesis',   'Synthèse',      '⚗️', 'vocabulary', 'hard'),
      ('lycee', 3, 'Paradigm',    'Paradigme',     '🔄', 'vocabulary', 'hard'),
      ('lycee', 3, 'Dichotomy',   'Dichotomie',    '⚖️', 'vocabulary', 'hard'),
      ('lycee', 4, 'Beat around the bush',      'Tourner autour du pot', '🌳', 'idiom', 'medium'),
      ('lycee', 5, 'The ball is in your court', 'C''est à toi de jouer', '🎾', 'idiom', 'hard'),

      -- ADULT
      ('adult', 1, 'Efficiency',   'Efficacité',       '⚡', 'vocabulary', 'medium'),
      ('adult', 1, 'Strategy',     'Stratégie',        '♟️', 'vocabulary', 'medium'),
      ('adult', 2, 'Leverage',     'Effet de levier',  '🎚️', 'vocabulary', 'hard'),
      ('adult', 2, 'Stakeholder',  'Partie prenante',  '🤝', 'vocabulary', 'hard'),
      ('adult', 3, 'Synergy',      'Synergie',         '🔗', 'vocabulary', 'hard'),
      ('adult', 3, 'Benchmark',    'Référence',        '📊', 'vocabulary', 'hard'),
      ('adult', 4, 'Think outside the box', 'Penser autrement',  '📦', 'idiom', 'medium'),
      ('adult', 5, 'Get the ball rolling',  'Lancer le processus','⚽', 'idiom', 'medium');
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration 002] ✓ Config complète seedée');
  }
);