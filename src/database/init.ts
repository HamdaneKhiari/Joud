// src/database/init.ts
import * as SQLite from 'expo-sqlite';

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('janacore.db');

    // Activation des contraintes d'intégrité
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // ============================================
    // 1. CRÉATION DES TABLES EXISTANTES (MODIFIÉES)
    // ============================================
    
    await db.execAsync(`
      DROP TABLE IF EXISTS levels;
      DROP TABLE IF EXISTS module_availability;
      DROP TABLE IF EXISTS identity_palettes;
      DROP TABLE IF EXISTS level_labels;
      DROP TABLE IF EXISTS module_labels;
      DROP TABLE IF EXISTS branding;
      
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
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
        module_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        icon TEXT, 
        emoji TEXT, 
        description TEXT, 
        order_index INTEGER,
        FOREIGN KEY (module_id) REFERENCES modules(id)
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
        text_on_main_color TEXT NOT NULL
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
      CREATE INDEX IF NOT EXISTS idx_module_labels_slug_identity ON module_labels(module_slug, identity_id);
      CREATE INDEX IF NOT EXISTS idx_level_labels_level_identity ON level_labels(level_number, identity_id);
      CREATE INDEX IF NOT EXISTS idx_module_availability_slug_identity ON module_availability(module_slug, identity_id);
      CREATE INDEX IF NOT EXISTS idx_module_availability_level ON module_availability(level_number);
    `);

    // ============================================
    // 2. SEED DES MODULES (avec colonnes par défaut)
    // ============================================
    const modulesSeed = [
      // [id, name, slug, is_core, target_audience, icon, order_index, description, display_title, display_description, icon_name]
      [1, 'Vocabulary', 'vocab', 1, 'all', 'book', 1, 'Enrichis ton vocabulaire', 'Vocabulaire', 'Enrichis ton vocabulaire', 'book-alphabet'],
      [2, 'Grammar', 'grammar', 1, 'all', 'lightbulb', 2, 'Maîtrise les règles', 'Grammaire', 'Maîtrise les règles', 'format-list-bulleted'],
      [3, 'Sentences', 'phrases', 1, 'all', 'message-square', 3, 'Structure et syntaxe', 'Phrases', 'Structure et syntaxe', 'format-quote-close'],
      [4, 'Reading', 'reading', 1, 'all', 'file-text', 4, 'Analyse de textes', 'Lecture', 'Analyse de textes', 'text-box'],
      [5, 'Conversation', 'conversation', 1, 'all', 'message-circle', 5, 'Pratique dialogues', 'Conversation', 'Pratique dialogues', 'chat'],
      [6, 'Games', 'games', 1, 'all', 'gamepad', 6, 'Exercices ludiques', 'Jeux', 'Exercices ludiques', 'gamepad-variant'],
      [7, 'Assessment', 'assessment', 1, 'all', 'clipboard', 7, 'Évaluation', 'Évaluation', 'Teste tes connaissances', 'clipboard-check'],
      [8, 'FastVocab', 'fastvocab', 0, 'adult', 'zap', 8, '500 mots essentiels', 'Fast Vocabulary ⚡', 'Apprentissage accéléré', 'flash'],
      [9, 'Connector', 'connector', 0, 'lycee', 'link', 9, 'Mots de liaison', 'The Connector', 'Syntax & articulation', 'connection'],
      [10, 'Expressions', 'expressions', 0, 'adult', 'quote', 10, 'Locutions courantes', 'Expressions', 'Locutions courantes', 'format-quote-open']
    ];

    for (const mod of modulesSeed) {
      await db.runAsync(
        `INSERT OR IGNORE INTO modules VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        mod
      );
    }

    // ============================================
    // 3. SEED DES NIVEAUX (avec colonnes par défaut)
    // ============================================
    const levelsSeed = [
      // [id, level, title, icon, description, badge, target_audience, display_title, display_description, icon_name]
      [101, 1, 'Découverte', '🎨', 'Mes premiers pas', 'LVL 1', 'primary', 'Découverte', 'Mes premiers pas', '🎨'],
      [102, 2, 'Apprentissage', '🚀', 'Je commence à parler', 'LVL 2', 'primary', 'Apprentissage', 'Je commence à parler', '🚀'],
      [103, 3, 'Exploration', '🔍', 'Je découvre le monde', 'LVL 3', 'primary', 'Exploration', 'Je découvre le monde', '🔍'],
      [104, 4, 'Maîtrise', '🌟', 'Je parle comme un grand', 'LVL 4', 'primary', 'Maîtrise', 'Je parle comme un grand', '🌟'],

      [201, 1, 'Les Bases', '🌱', 'Démarre ton apprentissage', 'LVL 1', 'college', 'Les Bases', 'Démarre ton apprentissage', '🌱'],
      [202, 2, "L'Essentiel", '🎯', 'Développe tes compétences', 'LVL 2', 'college', "L'Essentiel", 'Développe tes compétences', '🎯'],
      [203, 3, "L'Avancé", '⚡', 'Renforce ton niveau', 'LVL 3', 'college', "L'Avancé", 'Renforce ton niveau', '⚡'],
      [204, 4, "L'Expert", '🏆', "Maîtrise l'anglais", 'LVL 4', 'college', "L'Expert", "Maîtrise l'anglais", '🏆'],

      [301, 1, 'Foundations', '📚', 'Core grammar and vocab', 'LVL 1', 'lycee', 'Foundations', 'Core grammar and vocab', '📚'],
      [302, 2, 'Skills', '🛠️', 'Practical application', 'LVL 2', 'lycee', 'Skills', 'Practical application', '🛠️'],
      [303, 3, 'Expertise', '🧪', 'Advanced structures', 'LVL 3', 'lycee', 'Expertise', 'Advanced structures', '🧪'],
      [304, 4, 'Mastery', '🎓', 'Academic excellence', 'LVL 4', 'lycee', 'Mastery', 'Academic excellence', '🎓'],

      [401, 1, 'Niveau 1', '🌱', 'Les bases essentielles', 'NIVEAU 1', 'adult', 'Niveau 1', 'Les bases essentielles', '🌱'],
      [402, 2, 'Niveau 2', '🎯', 'Pratique et quotidien', 'NIVEAU 2', 'adult', 'Niveau 2', 'Pratique et quotidien', '🎯'],
      [403, 3, 'Niveau 3', '⚡', 'Approfondissement', 'NIVEAU 3', 'adult', 'Niveau 3', 'Approfondissement', '⚡'],
      [404, 4, 'Niveau 4', '🏆', 'Maîtrise complète', 'NIVEAU 4', 'adult', 'Niveau 4', 'Maîtrise complète', '🏆'],
      [405, 5, 'Niveau 5', '🔥', 'Avancé', 'NIVEAU 5', 'adult', 'Niveau 5', 'Avancé', '🔥'],
      [406, 6, 'Niveau 6', '💎', 'Expert', 'NIVEAU 6', 'adult', 'Niveau 6', 'Expert', '💎'],
      [407, 7, 'Slang', '🔥', 'Anglais familier et films', 'SPECIAL', 'adult', 'Slang & Real Life', 'Langage courant et argot', '🔥']
    ];

    for (const lvl of levelsSeed) {
      await db.runAsync(
        `INSERT OR IGNORE INTO levels VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        lvl
      );
    }

    // ============================================
    // 4. SEED BRANDING (Identités Visuelles)
    // ============================================
    
    // PRIMARY Identity
    await db.runAsync(`
      INSERT OR IGNORE INTO branding (
        id, primary_color, accent_color, surface_color, logo_name, theme_mode,
        ui_has_gradient, ui_gradient_colors, ui_card_radius, ui_show_decorative_shapes,
        ai_accent_color, ai_error_color, ai_solution_bg,
        header_bg_color, header_accent_color, header_emoji, header_welcome_text,
        daily_word_bg_color, daily_word_gradient, daily_word_decoration,
        dashboard_level_progress_color, text_on_main_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'primary',
      '#FFCE00', '#FF5722', '#FFF9E6', 'book', 'light',
      0, null, 24, 1,
      '#9C27B0', '#F44336', JSON.stringify(['#F3E5F5', '#E1BEE7']),
      '#FFCE00', '#FF5722', '🎈', 'Salut,',
      '#FFEB3B', null, 'circles',
      '#FF5722', '#000000'
    ]);

    // COLLEGE Identity
    await db.runAsync(`
      INSERT OR IGNORE INTO branding (
        id, primary_color, accent_color, surface_color, logo_name, theme_mode,
        ui_has_gradient, ui_gradient_colors, ui_card_radius, ui_show_decorative_shapes,
        ai_accent_color, ai_error_color, ai_solution_bg,
        header_bg_color, header_accent_color, header_emoji, header_welcome_text,
        daily_word_bg_color, daily_word_gradient, daily_word_decoration,
        dashboard_level_progress_color, text_on_main_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'college',
      '#34495E', '#FFD700', '#F5F7FA', 'rocket', 'light',
      0, null, 20, 1,
      '#6366F1', '#EF4444', JSON.stringify(['#F5F3FF', '#EDE9FE']),
      '#34495E', '#FFD700', '🚀', 'Ready,',
      '#00D2FF', null, 'circles',
      '#FFD700', '#FFFFFF'
    ]);

    // LYCEE Identity
    await db.runAsync(`
      INSERT OR IGNORE INTO branding (
        id, primary_color, accent_color, surface_color, logo_name, theme_mode,
        ui_has_gradient, ui_gradient_colors, ui_card_radius, ui_show_decorative_shapes,
        ai_accent_color, ai_error_color, ai_solution_bg,
        header_bg_color, header_accent_color, header_emoji, header_welcome_text,
        daily_word_bg_color, daily_word_gradient, daily_word_decoration,
        dashboard_level_progress_color, text_on_main_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'lycee',
      '#1A1A1A', '#00E5FF', '#0F172A', 'graduation-cap', 'dark',
      1, JSON.stringify(['#2C3E50', '#000000']), 12, 1,
      '#00E5FF', '#FF5252', JSON.stringify(['#1E293B', '#0F172A']),
      '#1A1A1A', '#00E5FF', '🎓', 'Welcome,',
      null, JSON.stringify(['#2C3E50', '#000000']), 'water-drop',
      '#00E5FF', '#00E5FF'
    ]);

    // ADULT Identity
    await db.runAsync(`
      INSERT OR IGNORE INTO branding (
        id, primary_color, accent_color, surface_color, logo_name, theme_mode,
        ui_has_gradient, ui_gradient_colors, ui_card_radius, ui_show_decorative_shapes,
        ai_accent_color, ai_error_color, ai_solution_bg,
        header_bg_color, header_accent_color, header_emoji, header_welcome_text,
        daily_word_bg_color, daily_word_gradient, daily_word_decoration,
        dashboard_level_progress_color, text_on_main_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'adult',
      '#F3F4F6', '#111827', '#FFFFFF', 'briefcase', 'light',
      0, null, 8, 0,
      '#1F2937', '#991B1B', JSON.stringify(['#F3F4F6', '#F3F4F6']),
      '#FFFFFF', '#111827', '💼', 'Bonjour,',
      '#F3F4F6', null, 'none',
      '#111827', '#111827'
    ]);

    // ============================================
    // 5. SEED MODULE_LABELS (Labels par Identité)
    // ============================================
    
    // PRIMARY Module Labels
    const primaryModuleLabels = [
      ['vocab', 'primary', 'Mes Premiers Mots', 'Apprends des nouveaux mots', 'book-alphabet'],
      ['grammar', 'primary', 'Grammaire Simple', 'Les règles de base', 'ruler'],
      ['phrases', 'primary', 'Types de Phrases', 'Questions, exclamations...', 'comment-question'],
      ['reading', 'primary', 'Histoires Courtes', 'Lis de petites histoires', 'book-open-page-variant'],
      ['conversation', 'primary', 'Dialogues Écrits', 'Des conversations amusantes', 'message-text'],
      ['games', 'primary', 'Jeux de Mots', 'Joue avec les mots', 'puzzle'],
      ['assessment', 'primary', 'Mon Bilan', 'Teste ce que tu sais', 'trophy']
    ];

    // COLLEGE Module Labels
    const collegeModuleLabels = [
      ['vocab', 'college', 'Vocabulaire', 'Enrichis ton lexique', 'book-alphabet'],
      ['grammar', 'college', 'Grammaire', 'Règles et structures', 'format-list-bulleted'],
      ['phrases', 'college', 'Phrases', 'Construction de phrases', 'format-quote-close'],
      ['reading', 'college', 'Compréhension Écrite', 'Analyse de textes', 'text-box'],
      ['conversation', 'college', 'Conversation', 'Dialogues et échanges', 'chat'],
      ['games', 'college', 'Exercices Ludiques', 'Apprends en jouant', 'gamepad-variant'],
      ['assessment', 'college', 'Évaluation', 'Teste tes connaissances', 'clipboard-check']
    ];

    // LYCEE Module Labels
    const lyceeModuleLabels = [
      ['vocab', 'lycee', 'Vocabulary', 'Advanced lexicon', 'book-alphabet'],
      ['grammar', 'lycee', 'Grammar', 'Complex structures', 'format-list-bulleted'],
      ['phrases', 'lycee', 'Sentences', 'Advanced syntax', 'format-quote-close'],
      ['reading', 'lycee', 'Reading', 'Text analysis', 'text-box'],
      ['conversation', 'lycee', 'Conversation', 'Fluent exchanges', 'chat'],
      ['games', 'lycee', 'Practice', 'Interactive exercises', 'gamepad-variant'],
      ['connector', 'lycee', 'The Connector', 'Syntax & articulation', 'connection'],
      ['assessment', 'lycee', 'Assessment', 'Skill evaluation', 'clipboard-check']
    ];

    // ADULT Module Labels
    const adultModuleLabels = [
      ['vocab', 'adult', 'Vocabulaire', 'Lexique professionnel', 'book-alphabet'],
      ['fastvocab', 'adult', 'Fast Vocabulary ⚡', 'Apprentissage accéléré', 'flash'],
      ['expressions', 'adult', 'Expressions', 'Locutions courantes', 'format-quote-open'],
      ['grammar', 'adult', 'Grammaire', 'Structures avancées', 'format-list-bulleted'],
      ['reading', 'adult', 'Lecture', 'Textes professionnels', 'text-box'],
      ['conversation', 'adult', 'Conversations', 'Échanges professionnels', 'chat'],
      ['assessment', 'adult', 'Évaluation', 'Bilan de compétences', 'clipboard-check']
    ];

    const allModuleLabels = [
      ...primaryModuleLabels,
      ...collegeModuleLabels,
      ...lyceeModuleLabels,
      ...adultModuleLabels
    ];

    for (const label of allModuleLabels) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_labels (module_slug, identity_id, display_title, display_description, icon_name) VALUES (?, ?, ?, ?, ?)`,
        label
      );
    }

    // ============================================
    // 6. SEED LEVEL_LABELS (Labels par Identité)
    // ============================================
    
    // PRIMARY Level Labels
    const primaryLevelLabels = [
      [1, 'primary', 'La Découverte', 'DÉCOUVERTE', 'Premier pas dans l\'apprentissage'],
      [2, 'primary', 'Le Démarrage', 'DÉMARRAGE', 'On commence vraiment'],
      [3, 'primary', 'L\'Exploration', 'EXPLORATION', 'Découvre de nouvelles choses'],
      [4, 'primary', 'La Maîtrise', 'MAÎTRISE', 'Tu deviens un expert']
    ];

    // COLLEGE Level Labels
    const collegeLevelLabels = [
      [1, 'college', 'Les Bases', 'BASES', 'Fondations essentielles'],
      [2, 'college', 'L\'Essentiel', 'ESSENTIEL', 'Compétences clés'],
      [3, 'college', 'L\'Avancé', 'AVANCÉ', 'Niveau supérieur'],
      [4, 'college', 'L\'Expert', 'EXPERT', 'Maîtrise complète']
    ];

    // LYCEE Level Labels
    const lyceeLevelLabels = [
      [1, 'lycee', 'Foundations', 'FOUNDATIONS', 'Core principles'],
      [2, 'lycee', 'Skills', 'SKILLS', 'Practical abilities'],
      [3, 'lycee', 'Expertise', 'EXPERTISE', 'Advanced mastery'],
      [4, 'lycee', 'Mastery', 'MASTERY', 'Complete command']
    ];

    // ADULT Level Labels
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
        `INSERT OR IGNORE INTO level_labels (level_number, identity_id, display_title, badge_text, display_description) VALUES (?, ?, ?, ?, ?)`,
        label
      );
    }

    // ============================================
    // 7. SEED IDENTITY_PALETTES (Palettes de Couleurs)
    // ============================================
    
    // PRIMARY Palette
    const primaryPalette = [
      ['primary', 0, '#FF5722'],
      ['primary', 1, '#FFCE00'],
      ['primary', 2, '#4CAF50'],
      ['primary', 3, '#2196F3'],
      ['primary', 4, '#9C27B0'],
      ['primary', 5, '#FF9800'],
      ['primary', 6, '#E91E63']
    ];

    // COLLEGE Palette
    const collegePalette = [
      ['college', 0, '#34495E'],
      ['college', 1, '#FFD700'],
      ['college', 2, '#3498DB'],
      ['college', 3, '#E74C3C'],
      ['college', 4, '#9B59B6'],
      ['college', 5, '#F39C12'],
      ['college', 6, '#1ABC9C']
    ];

    // LYCEE Palette
    const lyceePalette = [
      ['lycee', 0, '#00E5FF'],
      ['lycee', 1, '#1A1A1A'],
      ['lycee', 2, '#2C3E50'],
      ['lycee', 3, '#00BCD4'],
      ['lycee', 4, '#0097A7'],
      ['lycee', 5, '#006064'],
      ['lycee', 6, '#00ACC1']
    ];

    // ADULT Palette
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
        `INSERT OR IGNORE INTO identity_palettes (identity_id, color_index, color_value) VALUES (?, ?, ?)`,
        palette
      );
    }

    // ============================================
    // 8. SEED MODULE_AVAILABILITY (Disponibilité)
    // ============================================
    
    // PRIMARY: Tous les modules de base pour tous les niveaux
    const primaryModules = ['vocab', 'grammar', 'phrases', 'reading', 'conversation', 'games', 'assessment'];
    for (const moduleSlug of primaryModules) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'primary', null, 1]
      );
    }

    // COLLEGE: Tous les modules de base pour tous les niveaux
    const collegeModules = ['vocab', 'grammar', 'phrases', 'reading', 'conversation', 'games', 'assessment'];
    for (const moduleSlug of collegeModules) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'college', null, 1]
      );
    }

    // LYCEE: Modules de base + connector pour tous les niveaux
    const lyceeModules = ['vocab', 'grammar', 'phrases', 'connector', 'reading', 'conversation', 'games', 'assessment'];
    for (const moduleSlug of lyceeModules) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
        [moduleSlug, 'lycee', null, 1]
      );
    }

    // ADULT: Modules standard pour niveaux 1-6, vocab+phrases pour niveau 7
    const adultStandardModules = ['vocab', 'fastvocab', 'expressions', 'grammar', 'reading', 'conversation', 'assessment'];
    for (const moduleSlug of adultStandardModules) {
      // Disponible pour niveaux 1-6
      for (let level = 1; level <= 6; level++) {
        await db.runAsync(
          `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
          [moduleSlug, 'adult', level, 1]
        );
      }
    }

    // Niveau 7 Adult: Uniquement vocab et phrases
    await db.runAsync(
      `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
      ['vocab', 'adult', 7, 1]
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
      ['phrases', 'adult', 7, 1]
    );

    // ============================================
    // 9. DONNÉE DE TEST DANS CONTENT
    // ============================================
    const firstVocabFamily = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE module_id = 1 ORDER BY id LIMIT 1`
    );

    if (firstVocabFamily) {
      const testContent = {
        family_id: firstVocabFamily.id,
        level: 1,
        content_type: 'word',
        data: JSON.stringify({ word: 'hello', translation: 'bonjour', example: 'Hello, how are you?' }),
        difficulty: 'easy',
        tags: 'test,greeting'
      };

      await db.runAsync(
        `INSERT OR IGNORE INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
        [testContent.family_id, testContent.level, testContent.content_type, testContent.data, testContent.difficulty, testContent.tags]
      );
    }

    console.log('✅ JanaCore Engine Initialized - White Label Architecture');
    return db;
  } catch (error) {
    console.error('❌ Init Database Error:', error);
    throw error;
  }
};
