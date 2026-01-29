// src/database/init.ts
import * as SQLite from 'expo-sqlite';

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('janacore.db');

    // ✅ FIX: Activation du mode WAL pour éviter les erreurs "database is locked"
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // ✅ FIX: Augmentation du timeout (10s) pour attendre si la DB est occupée par une autre requête
    await db.execAsync('PRAGMA busy_timeout = 10000;');

    // ✅ FIX: Délai pour laisser les connexions fantômes se fermer et éviter les race conditions
    await new Promise(resolve => setTimeout(resolve, 200));

    // Activation des contraintes d'intégrité
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // ============================================
    // 1. CRÉATION DES TABLES
    // ============================================
    
    await db.execAsync(`
      -- Nettoyage complet pour forcer la mise à jour du schéma (Ordre important pour les FK)
      DROP TABLE IF EXISTS content;
      DROP TABLE IF EXISTS progress;
      DROP TABLE IF EXISTS families;
      DROP TABLE IF EXISTS activity_log;
      DROP TABLE IF EXISTS module_availability;
      DROP TABLE IF EXISTS level_labels;
      DROP TABLE IF EXISTS module_labels;
      DROP TABLE IF EXISTS identity_palettes;
      DROP TABLE IF EXISTS modules;
      DROP TABLE IF EXISTS levels;
      DROP TABLE IF EXISTS branding;
      
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        is_core INTEGER DEFAULT 1,
        target_audience TEXT DEFAULT 'all',
        icon TEXT, 
        order_index INTEGER, 
        description TEXT,
        display_title TEXT,
        display_description TEXT,
        icon_name TEXT
      );

      CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY,
        level INTEGER NOT NULL,
        title TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT NOT NULL,
        badge TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        display_title TEXT,
        display_description TEXT,
        icon_name TEXT
      );

      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT, 
        emoji TEXT, 
        description TEXT, 
        order_index INTEGER,
        FOREIGN KEY (module_slug) REFERENCES modules(slug)
      );

      CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        data TEXT NOT NULL,
        difficulty TEXT,
        tags TEXT,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        last_accessed TEXT,
        UNIQUE(user_id, family_id, level),
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        family_name TEXT NOT NULL,
        icon TEXT,
        progress REAL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        UNIQUE(module_slug, family_id)
      );

      -- ============================================
      -- TABLES WHITE LABEL
      -- ============================================

      CREATE TABLE IF NOT EXISTS branding (
        id TEXT PRIMARY KEY,
        primary_color TEXT NOT NULL,
        accent_color TEXT NOT NULL,
        surface_color TEXT,
        logo_name TEXT,
        theme_mode TEXT DEFAULT 'light',
        ui_has_gradient INTEGER DEFAULT 0,
        ui_gradient_colors TEXT,
        ui_card_radius INTEGER DEFAULT 12,
        ui_show_decorative_shapes INTEGER DEFAULT 1,
        ai_accent_color TEXT,
        ai_error_color TEXT,
        ai_solution_bg TEXT,
        header_bg_color TEXT NOT NULL,
        header_accent_color TEXT NOT NULL,
        header_emoji TEXT,
        header_welcome_text TEXT,
        daily_word_bg_color TEXT,
        daily_word_gradient TEXT,
        daily_word_decoration TEXT DEFAULT 'none',
        dashboard_level_progress_color TEXT NOT NULL,
        text_on_main_color TEXT NOT NULL,
        text_primary_color TEXT,
        text_secondary_color TEXT,
        ai_tutor_title TEXT,
        ai_tutor_subtitle TEXT
      );

      CREATE TABLE IF NOT EXISTS module_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        identity_id TEXT NOT NULL,
        display_title TEXT NOT NULL,
        display_description TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        UNIQUE(module_slug, identity_id),
        FOREIGN KEY (module_slug) REFERENCES modules(slug),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      CREATE TABLE IF NOT EXISTS level_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_number INTEGER NOT NULL,
        identity_id TEXT NOT NULL,
        display_title TEXT NOT NULL,
        badge_text TEXT NOT NULL,
        display_description TEXT NOT NULL,
        UNIQUE(level_number, identity_id),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      CREATE TABLE IF NOT EXISTS identity_palettes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identity_id TEXT NOT NULL,
        color_index INTEGER NOT NULL,
        color_value TEXT NOT NULL,
        UNIQUE(identity_id, color_index),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      CREATE TABLE IF NOT EXISTS module_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        identity_id TEXT NOT NULL,
        level_number INTEGER,
        is_available INTEGER DEFAULT 1,
        UNIQUE(module_slug, identity_id, level_number),
        FOREIGN KEY (module_slug) REFERENCES modules(slug),
        FOREIGN KEY (identity_id) REFERENCES branding(id)
      );

      -- ============================================
      -- INDEX POUR PERFORMANCE
      -- ============================================
      
      CREATE INDEX IF NOT EXISTS idx_modules_slug ON modules(slug);
      CREATE INDEX IF NOT EXISTS idx_modules_target_audience ON modules(target_audience);
      CREATE INDEX IF NOT EXISTS idx_levels_target_audience ON levels(target_audience);
      CREATE INDEX IF NOT EXISTS idx_families_module_slug ON families(module_slug);
      CREATE INDEX IF NOT EXISTS idx_module_labels_slug_identity ON module_labels(module_slug, identity_id);
      CREATE INDEX IF NOT EXISTS idx_level_labels_level_identity ON level_labels(level_number, identity_id);
      CREATE INDEX IF NOT EXISTS idx_module_availability_slug_identity ON module_availability(module_slug, identity_id);
      CREATE INDEX IF NOT EXISTS idx_module_availability_level ON module_availability(level_number);
    `);

    // ============================================
    // 2. SEED DES MODULES (UNIQUE ET CORRIGÉ)
    // ============================================
    const modulesSeed = [
      // [slug, name, icon_name, description, order_index, is_core, target_audience]
      ['vocab', 'Vocabulaire', 'book-alphabet', 'Enrichis ton vocabulaire', 1, 1, 'all'],
      ['phrase_types', 'Phrases', 'format-quote-close', 'Structure et syntaxe', 2, 1, 'all'],
      ['grammar', 'Grammaire', 'format-list-bulleted', 'Maîtrise les règles', 3, 1, 'all'],
      ['reading', 'Lecture', 'text-box', 'Analyse de textes', 4, 1, 'all'],
      ['dialogues', 'Conversation', 'chat', 'Pratique dialogues', 5, 1, 'all'],
      ['word_games', 'Jeux', 'gamepad-variant', 'Exercices ludiques', 6, 1, 'all'],
      ['assessment', 'Évaluation', 'clipboard-check', 'Teste tes connaissances', 7, 1, 'all'],
      // NOTE: AI Tutor n'est PAS un module d'exercice, c'est un outil du Dashboard
      // Il est codé en dur dans le composant Dashboard comme une carte spéciale
      ['connector', 'The Connector', 'connection', 'Syntax & articulation', 8, 0, 'lycee'],
      ['fastvocab', 'Fast Vocab', 'flash', '500 mots essentiels', 9, 0, 'adult']
    ];

    for (const mod of modulesSeed) {
      await db.runAsync(
        `INSERT INTO modules (slug, name, icon_name, description, order_index, is_core, target_audience) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        mod
      );
    }

    // ============================================
    // 3. SEED DES NIVEAUX (Harmonisé avec nomenclature White Label)
    // ============================================
    const levelsSeed = [
      // PRIMARY
      [101, 1, 'Foundations', '🌉', 'Démarre ton apprentissage', 'Niveau 1', 'primary', 'Foundations', 'Démarre ton apprentissage', 'bridge'],
      [102, 2, 'Skills', '🔑', 'Développe tes compétences', 'Niveau 2', 'primary', 'Skills', 'Développe tes compétences', 'key'],
      [103, 3, 'Expertise', '🔬', 'Renforce ton niveau', 'Niveau 3', 'primary', 'Expertise', 'Renforce ton niveau', 'microscope'],
      [104, 4, 'Mastery', '🖋️', "Maîtrise l'anglais", 'Niveau 4', 'primary', 'Mastery', "Maîtrise l'anglais", 'pen'],

      // COLLEGE
      [201, 1, 'Foundations', '🌉', 'Démarre ton apprentissage', 'Niveau 1', 'college', 'Foundations', 'Démarre ton apprentissage', 'bridge'],
      [202, 2, 'Skills', '🔑', 'Développe tes compétences', 'Niveau 2', 'college', 'Skills', 'Développe tes compétences', 'key'],
      [203, 3, 'Expertise', '🔬', 'Renforce ton niveau', 'Niveau 3', 'college', 'Expertise', 'Renforce ton niveau', 'microscope'],
      [204, 4, 'Mastery', '🖋️', "Maîtrise l'anglais", 'Niveau 4', 'college', 'Mastery', "Maîtrise l'anglais", 'pen'],

      // LYCEE
      [301, 1, 'Foundations', '🌉', 'Démarre ton apprentissage', 'Niveau 1', 'lycee', 'Foundations', 'Démarre ton apprentissage', 'bridge'],
      [302, 2, 'Skills', '🔑', 'Développe tes compétences', 'Niveau 2', 'lycee', 'Skills', 'Développe tes compétences', 'key'],
      [303, 3, 'Expertise', '🔬', 'Renforce ton niveau', 'Niveau 3', 'lycee', 'Expertise', 'Renforce ton niveau', 'microscope'],
      [304, 4, 'Mastery', '🖋️', "Maîtrise l'anglais", 'Niveau 4', 'lycee', 'Mastery', "Maîtrise l'anglais", 'pen'],

      // ADULT (7 niveaux spécifiques)
      [401, 1, 'Foundations', '🌉', 'Les bases essentielles', 'Niveau 1', 'adult', 'Foundations', 'Les bases essentielles', 'bridge'],
      [402, 2, 'Skills', '🔑', 'Pratique et quotidien', 'Niveau 2', 'adult', 'Skills', 'Pratique et quotidien', 'key'],
      [403, 3, 'Expertise', '🔬', 'Approfondissement', 'Niveau 3', 'adult', 'Expertise', 'Approfondissement', 'microscope'],
      [404, 4, 'Mastery', '🖋️', 'Maîtrise complète', 'Niveau 4', 'adult', 'Mastery', 'Maîtrise complète', 'pen'],
      [405, 5, 'Niveau 5', '🔥', 'Avancé', 'Niveau 5', 'adult', 'Niveau 5', 'Avancé', 'fire'],
      [406, 6, 'Niveau 6', '💎', 'Expert', 'Niveau 6', 'adult', 'Niveau 6', 'Expert', 'diamond'],
      [407, 7, 'Real Life', '🔥', 'Anglais réel & Slang', 'SPECIAL', 'adult', 'Real Life', 'Langage courant et argot', 'rocket']
    ];

    for (const lvl of levelsSeed) {
      await db.runAsync(`INSERT INTO levels VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, lvl);
    }

    // ============================================
    // 4. SEED BRANDING (CRITIQUE : AVANT les tables qui référencent identity_id)
    // ============================================
    
    const brandingSeed = [
      // [id, primary_color, accent_color, surface_color, logo_name, theme_mode, ui_has_gradient, ui_gradient_colors, ui_card_radius, ui_show_decorative_shapes, ai_accent_color, ai_error_color, ai_solution_bg, header_bg_color, header_accent_color, header_emoji, header_welcome_text, daily_word_bg_color, daily_word_gradient, daily_word_decoration, dashboard_level_progress_color, text_on_main_color, text_primary_color, text_secondary_color, ai_tutor_title, ai_tutor_subtitle]
      ['primary', '#FF5722', '#FFCE00', '#FFFFFF', null, 'light', 0, null, 12, 1, '#FF5722', '#D32F2F', '["#FFF3E0", "#FFE0B2"]', '#FF5722', '#FFCE00', '🎨', 'Bienvenue !', '#FFE0B2', null, 'none', '#FF5722', '#000000', '#1F2937', '#6B7280', 'Coach IA', 'Ton assistant personnel'],
      ['college', '#34495E', '#FFD700', '#FFFFFF', null, 'light', 0, null, 12, 1, '#34495E', '#D32F2F', '["#ECEFF1", "#CFD8DC"]', '#34495E', '#FFD700', '📚', 'Bonjour !', '#FFF9C4', null, 'none', '#34495E', '#000000', '#1F2937', '#6B7280', 'Tuteur IA', 'Aide aux devoirs'],
      ['lycee', '#00E5FF', '#1A1A1A', '#212121', null, 'dark', 1, '["#00E5FF", "#00BCD4"]', 16, 1, '#00E5FF', '#EF5350', '["#263238", "#37474F"]', '#00E5FF', '#1A1A1A', '🎓', 'Hello!', '#E0F7FA', null, 'water-drop', '#00E5FF', '#000000', '#FFFFFF', '#9CA3AF', 'AI Tutor', 'Your personal assistant'],
      ['adult', '#111827', '#374151', '#1F2937', null, 'dark', 0, null, 8, 0, '#4B5563', '#DC2626', '["#1F2937", "#374151"]', '#111827', '#374151', '💼', 'Welcome', '#263238', null, 'none', '#374151', '#FFFFFF', '#FFFFFF', '#9CA3AF', 'AI Assistant', 'Smart learning companion']
    ];

    for (const brand of brandingSeed) {
      await db.runAsync(
        `INSERT INTO branding VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        brand
      );
    }

    // ============================================
    // 5. SEED FAMILIES (Avec module_slug au lieu de module_id)
    // ============================================
    const familiesSeed = [
      // [module_slug, name, icon, emoji, description, order_index]
      ['vocab', 'Salutations', 'hand-wave', '👋', 'Apprends à dire bonjour', 1],
      ['vocab', 'Famille', 'account-group', '👨‍👩‍👧‍👦', 'Les membres de la famille', 2],
      ['vocab', 'Couleurs', 'palette', '🎨', 'Toutes les couleurs', 3],
      ['vocab', 'Food & Drinks', 'food', '🍽️', 'Nourriture et boissons', 4],
      ['grammar', 'Présent', 'clock-outline', '⏰', 'Le temps présent', 1],
      ['grammar', 'Futur', 'rocket', '🚀', "Parler de l'avenir", 2],
      ['phrase_types', 'Au Restaurant', 'silverware-fork-knife', '🍽️', 'Commander et payer', 1],
      ['connector', 'Logical Links', 'link-variant', '🔗', 'Connecteurs logiques', 1],
      ['connector', 'Sentence Fusion', 'merge', '🔀', 'Fusionner des phrases', 2],
      ['connector', 'Rephrasing', 'refresh', '♻️', 'Reformulation', 3],
      // WordGames families
      ['word_games', 'Quick Match', 'lightning-bolt', '⚡', 'Associe rapidement les mots', 1],
      ['word_games', 'Grammar Detective', 'magnify', '🔍', 'Trouve les erreurs', 2],
      ['word_games', 'Definition Master', 'book-open-variant', '📖', 'Maîtrise les définitions', 3],
      // Assessment family
      ['assessment', 'Assessment Pool', 'chart-box', '🎯', 'Pool de questions pour évaluation', 1]
    ];

    for (const fam of familiesSeed) {
      await db.runAsync(
        `INSERT INTO families (module_slug, name, icon, emoji, description, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
        fam
      );
    }

    // ============================================
    // 6. SEED CONTENT (Exercices de démonstration)
    // ============================================
    const contentSeed = [
      // Vocabulaire - Food & Drinks (family_id sera auto-généré = 4)
      [
        4, 1, 'word',
        JSON.stringify({
          word: 'Croissant',
          translation: 'Croissant',
          example: 'I love eating a fresh croissant for breakfast.',
          image: '🥐',
          audio: null
        }),
        'easy', 'food,breakfast'
      ],
      [
        4, 1, 'word',
        JSON.stringify({
          word: 'Book',
          translation: 'Livre',
          example: 'She is reading a fascinating book about history.',
          image: '📚',
          audio: null
        }),
        'easy', 'objects,learning'
      ],
      [
        4, 1, 'word',
        JSON.stringify({
          word: 'Cat',
          translation: 'Chat',
          example: 'The cat is sleeping on the sofa.',
          image: '🐱',
          audio: null
        }),
        'easy', 'animals,pets'
      ],
      // Grammar - Présent (family_id = 5)
      [
        5, 1, 'logic',
        JSON.stringify({
          sentence: "He _____ football every Sunday.",
          translation: "Il joue au football tous les dimanches.",
          options: ["play", "plays", "playing", "played"],
          correctAnswer: "plays"
        }),
        'easy', 'grammar,present_simple'
      ],
      // Phrases - Au Restaurant (family_id = 7)
      [
        7, 1, 'sentence',
        JSON.stringify({
          phrase_fr: "Je voudrais un café, s'il vous plaît.",
          phrase_en: "I would like a coffee, please.",
          concretement: "Formule standard pour commander poliment n'importe où.",
          build: "I would like (Je voudrais) + [objet] + please"
        }),
        'easy', 'restaurant,politeness'
      ],
      // Connector - Logical Links (family_id = 8)
      [
        8, 1, 'logic',
        JSON.stringify({
          sentence: "I wanted to go for a walk, _____ it started raining.",
          translation: "Je voulais aller me promener, mais il a commencé à pleuvoir.",
          options: ["and", "but", "so", "because"],
          correctAnswer: "but"
        }),
        'medium', 'grammar,connectors'
      ],
      // Connector - Sentence Fusion (family_id = 9)
      [
        9, 1, 'fusion',
        JSON.stringify({
          phrase1: "It was raining.",
          phrase2: "We stayed inside.",
          hint: "Use 'so'",
          correctAnswer: "It was raining so we stayed inside.",
          translation: "Il pleuvait donc nous sommes restés à l'intérieur."
        }),
        'hard', 'grammar,fusion'
      ],
      // Connector - Rephrasing (family_id = 10)
      [
        10, 1, 'rephrasing',
        JSON.stringify({
          baseSentence: "It is necessary for you to study.",
          instruction: "Start with 'You must'",
          correctAnswer: "You must study.",
          translation: "Tu dois étudier."
        }),
        'hard', 'grammar,rephrasing'
      ],

      // ============================================
      // WORDGAMES - Definition Master (family_id = 11)
      // ============================================
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Happy',
          definition: 'Feeling or showing pleasure or contentment',
          options: ['Sad', 'Feeling pleased', 'Angry', 'Tired'],
          correctAnswer: 'Feeling pleased',
          image: '😊',
          difficulty: 'easy'
        }),
        'easy', 'emotions,basic'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Library',
          definition: 'A building where books are kept for reading',
          options: ['A place to buy food', 'A building for books', 'A school', 'A hospital'],
          correctAnswer: 'A building for books',
          image: '📚',
          difficulty: 'easy'
        }),
        'easy', 'places,education'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Bicycle',
          definition: 'A vehicle with two wheels powered by pedals',
          options: ['A car', 'A two-wheeled vehicle', 'A bus', 'A train'],
          correctAnswer: 'A two-wheeled vehicle',
          image: '🚲',
          difficulty: 'easy'
        }),
        'easy', 'transport,sports'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Courage',
          definition: 'The ability to face danger or difficulty without fear',
          options: ['Fear', 'Bravery in danger', 'Happiness', 'Intelligence'],
          correctAnswer: 'Bravery in danger',
          image: '🦁',
          difficulty: 'medium'
        }),
        'medium', 'emotions,abstract'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Ancient',
          definition: 'Belonging to the very distant past',
          options: ['Modern', 'Very old', 'New', 'Recent'],
          correctAnswer: 'Very old',
          image: '🏛️',
          difficulty: 'medium'
        }),
        'medium', 'time,history'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Generous',
          definition: 'Willing to give more than necessary',
          options: ['Selfish', 'Kind and giving', 'Angry', 'Lazy'],
          correctAnswer: 'Kind and giving',
          image: '🎁',
          difficulty: 'medium'
        }),
        'medium', 'personality,values'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Magnificent',
          definition: 'Extremely beautiful, impressive or grand',
          options: ['Ugly', 'Impressively beautiful', 'Small', 'Ordinary'],
          correctAnswer: 'Impressively beautiful',
          image: '✨',
          difficulty: 'hard'
        }),
        'hard', 'adjectives,advanced'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Perseverance',
          definition: 'Continued effort despite difficulties',
          options: ['Giving up', 'Persistent effort', 'Laziness', 'Luck'],
          correctAnswer: 'Persistent effort',
          image: '💪',
          difficulty: 'hard'
        }),
        'hard', 'values,abstract'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Diligent',
          definition: 'Showing care and effort in work',
          options: ['Lazy', 'Hardworking', 'Careless', 'Slow'],
          correctAnswer: 'Hardworking',
          image: '📝',
          difficulty: 'hard'
        }),
        'hard', 'personality,work'
      ],
      [
        11, 1, 'definition',
        JSON.stringify({
          type: 'definition',
          word: 'Harmony',
          definition: 'A state of peaceful agreement',
          options: ['Conflict', 'Peaceful agreement', 'Noise', 'Chaos'],
          correctAnswer: 'Peaceful agreement',
          image: '☮️',
          difficulty: 'hard'
        }),
        'hard', 'abstract,social'
      ],

      // ============================================
      // WORDGAMES - Grammar Detective (family_id = 12)
      // ============================================
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'She go to school every day.',
          errorWordIndex: 1,
          correctWord: 'goes',
          explanation: 'Avec "she", le verbe doit prendre un "s" au présent simple',
          difficulty: 'easy'
        }),
        'easy', 'grammar,present_simple'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'I has a new book.',
          errorWordIndex: 1,
          correctWord: 'have',
          explanation: 'Avec "I", on utilise "have" et non "has"',
          difficulty: 'easy'
        }),
        'easy', 'grammar,have'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'They is playing football.',
          errorWordIndex: 1,
          correctWord: 'are',
          explanation: 'Avec "they" (pluriel), on utilise "are" et non "is"',
          difficulty: 'easy'
        }),
        'easy', 'grammar,to_be'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'He dont like pizza.',
          errorWordIndex: 1,
          correctWord: "doesn't",
          explanation: 'Avec "he", on utilise "doesn\'t" (does not) à la forme négative',
          difficulty: 'medium'
        }),
        'medium', 'grammar,negation'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'She have been waiting for an hour.',
          errorWordIndex: 1,
          correctWord: 'has',
          explanation: 'Avec "she", on utilise "has" au present perfect',
          difficulty: 'medium'
        }),
        'medium', 'grammar,present_perfect'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'I will going to the cinema tomorrow.',
          errorWordIndex: 2,
          correctWord: 'go',
          explanation: 'Après "will", on utilise la base verbale (go) sans "ing"',
          difficulty: 'medium'
        }),
        'medium', 'grammar,future'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'If I would have known, I would have come.',
          errorWordIndex: 2,
          correctWord: 'had',
          explanation: 'Dans une conditionnelle passée, on utilise "had" et non "would have"',
          difficulty: 'hard'
        }),
        'hard', 'grammar,conditionals'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'She told me that she will come tomorrow.',
          errorWordIndex: 4,
          correctWord: 'would',
          explanation: 'En discours indirect, "will" devient "would" (concordance des temps)',
          difficulty: 'hard'
        }),
        'hard', 'grammar,reported_speech'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'Neither of them are ready.',
          errorWordIndex: 3,
          correctWord: 'is',
          explanation: '"Neither" est singulier et nécessite le verbe au singulier ("is")',
          difficulty: 'hard'
        }),
        'hard', 'grammar,agreement'
      ],
      [
        12, 1, 'detective',
        JSON.stringify({
          type: 'detective',
          sentence: 'The informations you gave me were helpful.',
          errorWordIndex: 1,
          correctWord: 'information',
          explanation: '"Information" est indénombrable et n\'a pas de pluriel en anglais',
          difficulty: 'hard'
        }),
        'hard', 'grammar,uncountable'
      ],

      // ============================================
      // WORDGAMES - Quick Match (family_id = 13)
      // ============================================
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Hello', french: 'Bonjour' },
            { english: 'Goodbye', french: 'Au revoir' },
            { english: 'Thank you', french: 'Merci' },
            { english: 'Please', french: 'S\'il vous plaît' },
            { english: 'Sorry', french: 'Désolé' }
          ],
          timeLimit: 30,
          difficulty: 'easy'
        }),
        'easy', 'greetings,basic'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Monday', french: 'Lundi' },
            { english: 'Tuesday', french: 'Mardi' },
            { english: 'Wednesday', french: 'Mercredi' },
            { english: 'Thursday', french: 'Jeudi' },
            { english: 'Friday', french: 'Vendredi' }
          ],
          timeLimit: 25,
          difficulty: 'easy'
        }),
        'easy', 'days,time'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Red', french: 'Rouge' },
            { english: 'Blue', french: 'Bleu' },
            { english: 'Green', french: 'Vert' },
            { english: 'Yellow', french: 'Jaune' },
            { english: 'Black', french: 'Noir' }
          ],
          timeLimit: 20,
          difficulty: 'easy'
        }),
        'easy', 'colors,basic'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Happy', french: 'Heureux' },
            { english: 'Sad', french: 'Triste' },
            { english: 'Angry', french: 'En colère' },
            { english: 'Excited', french: 'Excité' },
            { english: 'Tired', french: 'Fatigué' }
          ],
          timeLimit: 25,
          difficulty: 'medium'
        }),
        'medium', 'emotions,feelings'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Kitchen', french: 'Cuisine' },
            { english: 'Bedroom', french: 'Chambre' },
            { english: 'Bathroom', french: 'Salle de bain' },
            { english: 'Living room', french: 'Salon' },
            { english: 'Garden', french: 'Jardin' }
          ],
          timeLimit: 30,
          difficulty: 'medium'
        }),
        'medium', 'house,places'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Breakfast', french: 'Petit-déjeuner' },
            { english: 'Lunch', french: 'Déjeuner' },
            { english: 'Dinner', french: 'Dîner' },
            { english: 'Snack', french: 'Goûter' },
            { english: 'Dessert', french: 'Dessert' }
          ],
          timeLimit: 25,
          difficulty: 'medium'
        }),
        'medium', 'food,meals'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Achievement', french: 'Réussite' },
            { english: 'Challenge', french: 'Défi' },
            { english: 'Opportunity', french: 'Opportunité' },
            { english: 'Perseverance', french: 'Persévérance' },
            { english: 'Wisdom', french: 'Sagesse' }
          ],
          timeLimit: 35,
          difficulty: 'hard'
        }),
        'hard', 'abstract,values'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Assess', french: 'Évaluer' },
            { english: 'Dedicate', french: 'Consacrer' },
            { english: 'Enhance', french: 'Améliorer' },
            { english: 'Implement', french: 'Mettre en œuvre' },
            { english: 'Optimize', french: 'Optimiser' }
          ],
          timeLimit: 40,
          difficulty: 'hard'
        }),
        'hard', 'verbs,professional'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Conscientious', french: 'Consciencieux' },
            { english: 'Diligent', french: 'Assidu' },
            { english: 'Meticulous', french: 'Méticuleux' },
            { english: 'Resilient', french: 'Résilient' },
            { english: 'Versatile', french: 'Polyvalent' }
          ],
          timeLimit: 40,
          difficulty: 'hard'
        }),
        'hard', 'adjectives,personality'
      ],
      [
        13, 1, 'speed',
        JSON.stringify({
          type: 'speed',
          pairs: [
            { english: 'Acknowledge', french: 'Reconnaître' },
            { english: 'Anticipate', french: 'Anticiper' },
            { english: 'Comprehend', french: 'Comprendre' },
            { english: 'Demonstrate', french: 'Démontrer' },
            { english: 'Elaborate', french: 'Élaborer' }
          ],
          timeLimit: 45,
          difficulty: 'hard'
        }),
        'hard', 'verbs,academic'
      ],

      // =================== ASSESSMENT POOL (20 questions) ===================
      // Assessment Definition Questions (7)
      [
        14, 1, 'assessment_definition',
        JSON.stringify({
          type: 'assessment_definition',
          theme: 'vocabulary',
          question: 'What does "grateful" mean?',
          questionFr: 'Que signifie "grateful" ?',
          options: ['Thankful', 'Angry', 'Sad', 'Confused'],
          correctAnswer: 'Thankful',
          explanation: '"Grateful" means thankful or appreciative.',
          explanationFr: '"Grateful" signifie reconnaissant ou appréciatif.'
        }),
        'easy', 'vocabulary,emotions'
      ],
      [
        14, 1, 'assessment_definition',
        JSON.stringify({
          type: 'assessment_definition',
          theme: 'vocabulary',
          question: 'What is the meaning of "examine"?',
          questionFr: 'Quelle est la signification de "examine" ?',
          options: ['To look at closely', 'To ignore', 'To break', 'To throw away'],
          correctAnswer: 'To look at closely',
          explanation: '"Examine" means to look at something closely and carefully.',
          explanationFr: '"Examine" signifie regarder quelque chose de près et avec attention.'
        }),
        'easy', 'vocabulary,actions'
      ],
      [
        14, 1, 'assessment_definition',
        JSON.stringify({
          type: 'assessment_definition',
          theme: 'vocabulary',
          question: 'What does "ancient" mean?',
          questionFr: 'Que signifie "ancient" ?',
          options: ['Very old', 'New', 'Modern', 'Future'],
          correctAnswer: 'Very old',
          explanation: '"Ancient" means very old, from a long time ago.',
          explanationFr: '"Ancient" signifie très vieux, d\'il y a longtemps.'
        }),
        'easy', 'vocabulary,time'
      ],
      [
        14, 1, 'assessment_definition',
        JSON.stringify({
          type: 'assessment_definition',
          theme: 'vocabulary',
          question: 'What is a "journey"?',
          questionFr: 'Qu\'est-ce qu\'un "journey" ?',
          options: ['A trip', 'A house', 'A book', 'A color'],
          correctAnswer: 'A trip',
          explanation: 'A "journey" is a trip from one place to another.',
          explanationFr: 'Un "journey" est un voyage d\'un endroit à un autre.'
        }),
        'easy', 'vocabulary,travel'
      ],
      [
        14, 1, 'assessment_definition',
        JSON.stringify({
          type: 'assessment_definition',
          theme: 'vocabulary',
          question: 'What does "beneath" mean?',
          questionFr: 'Que signifie "beneath" ?',
          options: ['Under', 'Above', 'Beside', 'Inside'],
          correctAnswer: 'Under',
          explanation: '"Beneath" means under or below something.',
          explanationFr: '"Beneath" signifie sous ou en dessous de quelque chose.'
        }),
        'medium', 'vocabulary,position'
      ],
      [
        14, 1, 'assessment_definition',
        JSON.stringify({
          type: 'assessment_definition',
          theme: 'vocabulary',
          question: 'What is "courage"?',
          questionFr: 'Qu\'est-ce que "courage" ?',
          options: ['Bravery', 'Fear', 'Weakness', 'Laziness'],
          correctAnswer: 'Bravery',
          explanation: '"Courage" is the quality of being brave.',
          explanationFr: '"Courage" est la qualité d\'être courageux.'
        }),
        'medium', 'vocabulary,character'
      ],
      [
        14, 1, 'assessment_definition',
        JSON.stringify({
          type: 'assessment_definition',
          theme: 'vocabulary',
          question: 'What does "accomplish" mean?',
          questionFr: 'Que signifie "accomplish" ?',
          options: ['To achieve', 'To fail', 'To forget', 'To delay'],
          correctAnswer: 'To achieve',
          explanation: '"Accomplish" means to achieve or complete something successfully.',
          explanationFr: '"Accomplish" signifie réaliser ou compléter quelque chose avec succès.'
        }),
        'medium', 'vocabulary,achievement'
      ],

      // Assessment Blanks Questions (7)
      [
        14, 1, 'assessment_blanks',
        JSON.stringify({
          type: 'assessment_blanks',
          theme: 'grammar',
          question: 'I ___ to school every day.',
          questionFr: 'Je ___ à l\'école tous les jours.',
          correctAnswer: 'go',
          options: ['go', 'goes', 'going', 'went'],
          explanation: 'Use "go" with "I" in present tense.',
          explanationFr: 'Utilise "go" avec "I" au présent.'
        }),
        'easy', 'grammar,present'
      ],
      [
        14, 1, 'assessment_blanks',
        JSON.stringify({
          type: 'assessment_blanks',
          theme: 'grammar',
          question: 'She ___ a teacher.',
          questionFr: 'Elle ___ professeur.',
          correctAnswer: 'is',
          options: ['is', 'are', 'am', 'be'],
          explanation: 'Use "is" with "she".',
          explanationFr: 'Utilise "is" avec "she".'
        }),
        'easy', 'grammar,to-be'
      ],
      [
        14, 1, 'assessment_blanks',
        JSON.stringify({
          type: 'assessment_blanks',
          theme: 'grammar',
          question: 'They ___ playing football yesterday.',
          questionFr: 'Ils ___ au football hier.',
          correctAnswer: 'were',
          options: ['were', 'was', 'are', 'is'],
          explanation: 'Use "were" with "they" in past tense.',
          explanationFr: 'Utilise "were" avec "they" au passé.'
        }),
        'medium', 'grammar,past'
      ],
      [
        14, 1, 'assessment_blanks',
        JSON.stringify({
          type: 'assessment_blanks',
          theme: 'grammar',
          question: 'I have ___ this movie before.',
          questionFr: 'J\'ai ___ ce film avant.',
          correctAnswer: 'seen',
          options: ['seen', 'saw', 'see', 'seeing'],
          explanation: 'Use "seen" after "have" (present perfect).',
          explanationFr: 'Utilise "seen" après "have" (present perfect).'
        }),
        'medium', 'grammar,perfect'
      ],
      [
        14, 1, 'assessment_blanks',
        JSON.stringify({
          type: 'assessment_blanks',
          theme: 'grammar',
          question: 'She will ___ tomorrow.',
          questionFr: 'Elle ___ demain.',
          correctAnswer: 'arrive',
          options: ['arrive', 'arrives', 'arriving', 'arrived'],
          explanation: 'Use base form after "will".',
          explanationFr: 'Utilise la forme de base après "will".'
        }),
        'medium', 'grammar,future'
      ],
      [
        14, 1, 'assessment_blanks',
        JSON.stringify({
          type: 'assessment_blanks',
          theme: 'grammar',
          question: 'This is ___ interesting book.',
          questionFr: 'Ceci est ___ livre intéressant.',
          correctAnswer: 'an',
          options: ['an', 'a', 'the', 'some'],
          explanation: 'Use "an" before words starting with a vowel sound.',
          explanationFr: 'Utilise "an" avant les mots commençant par une voyelle.'
        }),
        'easy', 'grammar,articles'
      ],
      [
        14, 1, 'assessment_blanks',
        JSON.stringify({
          type: 'assessment_blanks',
          theme: 'grammar',
          question: 'If I ___ rich, I would travel the world.',
          questionFr: 'Si j\'___ riche, je voyagerais dans le monde.',
          correctAnswer: 'were',
          options: ['were', 'was', 'am', 'be'],
          explanation: 'Use "were" in hypothetical situations (second conditional).',
          explanationFr: 'Utilise "were" dans les situations hypothétiques.'
        }),
        'hard', 'grammar,conditional'
      ],

      // Assessment Sentence Questions (6)
      [
        14, 1, 'assessment_sentence',
        JSON.stringify({
          type: 'assessment_sentence',
          theme: 'conversations',
          passage: 'John: Hi Mary, how are you?\nMary: I am fine, thanks! How about you?\nJohn: I am great. Do you want to go to the cinema tonight?',
          passageFr: 'John: Salut Mary, comment vas-tu ?\nMary: Je vais bien, merci ! Et toi ?\nJohn: Je vais très bien. Tu veux aller au cinéma ce soir ?',
          question: 'What does John ask Mary?',
          questionFr: 'Que demande John à Mary ?',
          options: [
            'If she wants to go to the cinema',
            'If she is hungry',
            'If she likes movies',
            'If she has money'
          ],
          correctAnswer: 'If she wants to go to the cinema',
          explanation: 'John asks if Mary wants to go to the cinema tonight.',
          explanationFr: 'John demande si Mary veut aller au cinéma ce soir.'
        }),
        'easy', 'conversations,invitation'
      ],
      [
        14, 1, 'assessment_sentence',
        JSON.stringify({
          type: 'assessment_sentence',
          theme: 'reading',
          passage: 'The sun rises in the east and sets in the west. It provides light and warmth to the Earth.',
          passageFr: 'Le soleil se lève à l\'est et se couche à l\'ouest. Il fournit lumière et chaleur à la Terre.',
          question: 'Where does the sun rise?',
          questionFr: 'Où se lève le soleil ?',
          options: ['In the east', 'In the west', 'In the north', 'In the south'],
          correctAnswer: 'In the east',
          explanation: 'The sun rises in the east.',
          explanationFr: 'Le soleil se lève à l\'est.'
        }),
        'easy', 'reading,nature'
      ],
      [
        14, 1, 'assessment_sentence',
        JSON.stringify({
          type: 'assessment_sentence',
          theme: 'reading',
          passage: 'Emma loves to read books. She visits the library every week to borrow new ones. Her favorite genre is mystery.',
          passageFr: 'Emma adore lire des livres. Elle visite la bibliothèque chaque semaine pour en emprunter de nouveaux. Son genre préféré est le mystère.',
          question: 'How often does Emma visit the library?',
          questionFr: 'À quelle fréquence Emma visite-t-elle la bibliothèque ?',
          options: ['Every week', 'Every day', 'Every month', 'Every year'],
          correctAnswer: 'Every week',
          explanation: 'Emma visits the library every week.',
          explanationFr: 'Emma visite la bibliothèque chaque semaine.'
        }),
        'easy', 'reading,hobbies'
      ],
      [
        14, 1, 'assessment_sentence',
        JSON.stringify({
          type: 'assessment_sentence',
          theme: 'conversations',
          passage: 'Teacher: Please open your books to page 45.\nStudents: Yes, teacher.\nTeacher: Now, let us read the first paragraph together.',
          passageFr: 'Professeur: Ouvrez vos livres à la page 45 s\'il vous plaît.\nÉlèves: Oui, professeur.\nProfesseur: Maintenant, lisons le premier paragraphe ensemble.',
          question: 'What page should the students open?',
          questionFr: 'À quelle page les élèves doivent-ils ouvrir ?',
          options: ['Page 45', 'Page 54', 'Page 44', 'Page 50'],
          correctAnswer: 'Page 45',
          explanation: 'The teacher asks students to open page 45.',
          explanationFr: 'Le professeur demande aux élèves d\'ouvrir la page 45.'
        }),
        'easy', 'conversations,classroom'
      ],
      [
        14, 1, 'assessment_sentence',
        JSON.stringify({
          type: 'assessment_sentence',
          theme: 'reading',
          passage: 'Climate change is a global issue that affects everyone. Rising temperatures cause ice caps to melt, leading to higher sea levels.',
          passageFr: 'Le changement climatique est un problème mondial qui affecte tout le monde. L\'augmentation des températures fait fondre les calottes glaciaires, entraînant une élévation du niveau de la mer.',
          question: 'What causes sea levels to rise?',
          questionFr: 'Qu\'est-ce qui cause l\'élévation du niveau de la mer ?',
          options: [
            'Melting ice caps',
            'Heavy rain',
            'Ocean waves',
            'Strong winds'
          ],
          correctAnswer: 'Melting ice caps',
          explanation: 'Melting ice caps cause sea levels to rise.',
          explanationFr: 'La fonte des calottes glaciaires fait monter le niveau de la mer.'
        }),
        'medium', 'reading,science'
      ],
      [
        14, 1, 'assessment_sentence',
        JSON.stringify({
          type: 'assessment_sentence',
          theme: 'reading',
          passage: 'Shakespeare was a famous playwright who lived in England during the 16th century. His works include tragedies like Hamlet and comedies like A Midsummer Night\'s Dream.',
          passageFr: 'Shakespeare était un dramaturge célèbre qui vivait en Angleterre au 16ème siècle. Ses œuvres incluent des tragédies comme Hamlet et des comédies comme Le Songe d\'une nuit d\'été.',
          question: 'When did Shakespeare live?',
          questionFr: 'Quand Shakespeare a-t-il vécu ?',
          options: [
            'In the 16th century',
            'In the 17th century',
            'In the 18th century',
            'In the 19th century'
          ],
          correctAnswer: 'In the 16th century',
          explanation: 'Shakespeare lived in the 16th century.',
          explanationFr: 'Shakespeare vivait au 16ème siècle.'
        }),
        'medium', 'reading,history'
      ]
    ];

    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    // ============================================
    // 7. SEED LEVEL_LABELS (Labels par Identité)
    // ============================================
    
    const primaryLevelLabels = [
      [1, 'primary', 'La Découverte', 'DÉCOUVERTE', "Premier pas dans l'apprentissage"],
      [2, 'primary', 'Le Démarrage', 'DÉMARRAGE', 'On commence vraiment'],
      [3, 'primary', "L'Exploration", 'EXPLORATION', 'Découvre de nouvelles choses'],
      [4, 'primary', 'La Maîtrise', 'MAÎTRISE', 'Tu deviens un expert']
    ];

    const collegeLevelLabels = [
      [1, 'college', 'Les Bases', 'BASES', 'Fondations essentielles'],
      [2, 'college', "L'Essentiel", 'ESSENTIEL', 'Compétences clés'],
      [3, 'college', "L'Avancé", 'AVANCÉ', 'Niveau supérieur'],
      [4, 'college', "L'Expert", 'EXPERT', 'Maîtrise complète']
    ];

    const lyceeLevelLabels = [
      [1, 'lycee', 'Foundations', 'FOUNDATIONS', 'Core principles'],
      [2, 'lycee', 'Skills', 'SKILLS', 'Practical abilities'],
      [3, 'lycee', 'Expertise', 'EXPERTISE', 'Advanced mastery'],
      [4, 'lycee', 'Mastery', 'MASTERY', 'Complete command']
    ];

    const adultLevelLabels = [
      [1, 'adult', 'Niveau 1', 'N1', 'Débutant'],
      [2, 'adult', 'Niveau 2', 'N2', 'Élémentaire'],
      [3, 'adult', 'Niveau 3', 'N3', 'Intermédiaire'],
      [4, 'adult', 'Niveau 4', 'N4', 'Intermédiaire +'],
      [5, 'adult', 'Niveau 5', 'N5', 'Avancé'],
      [6, 'adult', 'Niveau 6', 'N6', 'Expert'],
      [7, 'adult', 'Slang & Real Life', 'BONUS', 'Langage courant et argot']
    ];

    const allLevelLabels = [
      ...primaryLevelLabels,
      ...collegeLevelLabels,
      ...lyceeLevelLabels,
      ...adultLevelLabels
    ];

    for (const label of allLevelLabels) {
      await db.runAsync(
        `INSERT INTO level_labels (level_number, identity_id, display_title, badge_text, display_description) VALUES (?, ?, ?, ?, ?)`,
        label
      );
    }

    // ============================================
    // 8. SEED IDENTITY_PALETTES (Palettes de Couleurs)
    // ============================================
    
    const primaryPalette = [
      ['primary', 0, '#FF5722'],
      ['primary', 1, '#FFCE00'],
      ['primary', 2, '#4CAF50'],
      ['primary', 3, '#2196F3'],
      ['primary', 4, '#9C27B0'],
      ['primary', 5, '#FF9800'],
      ['primary', 6, '#E91E63']
    ];

    const collegePalette = [
      ['college', 0, '#34495E'],
      ['college', 1, '#FFD700'],
      ['college', 2, '#3498DB'],
      ['college', 3, '#E74C3C'],
      ['college', 4, '#9B59B6'],
      ['college', 5, '#F39C12'],
      ['college', 6, '#1ABC9C']
    ];

    const lyceePalette = [
      ['lycee', 0, '#00E5FF'],
      ['lycee', 1, '#1A1A1A'],
      ['lycee', 2, '#2C3E50'],
      ['lycee', 3, '#00BCD4'],
      ['lycee', 4, '#0097A7'],
      ['lycee', 5, '#006064'],
      ['lycee', 6, '#00ACC1']
    ];

    const adultPalette = [
      ['adult', 0, '#111827'],
      ['adult', 1, '#374151'],
      ['adult', 2, '#4B5563'],
      ['adult', 3, '#6B7280'],
      ['adult', 4, '#9CA3AF'],
      ['adult', 5, '#D1D5DB'],
      ['adult', 6, '#1F2937']
    ];

    const allPalettes = [
      ...primaryPalette,
      ...collegePalette,
      ...lyceePalette,
      ...adultPalette
    ];

    for (const palette of allPalettes) {
      await db.runAsync(
        `INSERT INTO identity_palettes (identity_id, color_index, color_value) VALUES (?, ?, ?)`,
        palette
      );
    }

    // ============================================
    // 9. SEED MODULE_AVAILABILITY (MATRICE DE RÉFÉRENCE)
    // ============================================
    
    // PRIMARY: vocab, phrase_types, grammar, reading, dialogues, word_games, assessment
    const primaryModules = ['vocab', 'phrase_types', 'grammar', 'reading', 'dialogues', 'word_games', 'assessment'];
    for (const moduleSlug of primaryModules) {
      await db.runAsync(
        `INSERT INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'primary', null, 1]
      );
    }

    // COLLEGE: Primary modules (ai_tutor retiré car c'est un outil Dashboard, pas un module)
    const collegeModules = [...primaryModules];
    for (const moduleSlug of collegeModules) {
      await db.runAsync(
        `INSERT INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'college', null, 1]
      );
    }

    // LYCEE: College + connector
    const lyceeModules = [...collegeModules, 'connector'];
    for (const moduleSlug of lyceeModules) {
      await db.runAsync(
        `INSERT INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'lycee', null, 1]
      );
    }

    // ADULT: Tous les 10 modules pour niveaux 1-6
    const adultStandardModules = [...lyceeModules, 'fastvocab'];
    for (const moduleSlug of adultStandardModules) {
      for (let level = 1; level <= 6; level++) {
        await db.runAsync(
          `INSERT INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
          [moduleSlug, 'adult', level, 1]
        );
      }
    }

    // ADULT Niveau 7: Uniquement vocab et phrase_types
    await db.runAsync(
      `INSERT INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
      ['vocab', 'adult', 7, 1]
    );
    await db.runAsync(
      `INSERT INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
      ['phrase_types', 'adult', 7, 1]
    );

    console.log('✅ JanaCore Engine Initialized - White Label Architecture');
    return db;
  } catch (error) {
    console.error('❌ Init Database Error:', error);
    throw error;
  }
};