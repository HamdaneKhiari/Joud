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
      ['connector', 'Rephrasing', 'refresh', '♻️', 'Reformulation', 3]
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