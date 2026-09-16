/**
 * Tests d'intégration — vraie base SQLite (sql.js), vraies migrations, vraies requêtes.
 *
 * Différence avec integration/queries.test.ts : ce fichier-là mocke `db.getAllAsync` et
 * vérifie seulement "la bonne chaîne SQL a été appelée" — utile et rapide, mais aveugle à
 * une regression dans le SQL lui-même (seed cassé, migration invalide, jointure fausse).
 * Ici, la DB tourne pour de vrai : si une migration ne s'exécute pas, ou si une requête est
 * syntaxiquement invalide, ou si le seed ne correspond plus à ce que le code suppose, le test
 * échoue pour de vraies raisons plutôt que sur un mock qui a toujours raison.
 */

import { createMigratedRealDb, createRealDb, type RealTestDb } from '../testUtils/realDb';
import { MigrationRunner, createMigration } from '@/database/migrations/runner';
import migration001 from '@/database/migrations/001_schema';
import migration002 from '@/database/migrations/002_seed_config';
import migration003 from '@/database/migrations/003_seed_subfamily_labels';
import migration004 from '@/database/migrations/004_remove_grammar_module';
import migration005 from '@/database/migrations/005_remove_assessment_module';
import migration006 from '@/database/migrations/006_fix_contrast_and_adult_language';
import migration007 from '@/database/migrations/007_seed_real_content';
import migration008 from '@/database/migrations/008_add_course_column';
import migration009 from '@/database/migrations/009_add_user_id_to_activity_log';
import {
  getModulesByAudience,
  getAvailableModules,
  isModuleAvailable,
  getLevelsByAudience,
  insertContent,
  getContentByFamilyAndLevel,
  upsertProgress,
  getProgressByFamily,
  getAggregatedFamilyProgress,
  getBrandingById,
  getIdentityPalette,
  calculateUserMetrics,
  getRecentActivity,
} from '@/database/queries';
import { getSubFamiliesByFamily } from '@/services/subfamilyService';

// insertFamily n'existe plus (supprimé — code mort et cassé, cf. docs/task.md section 14 :
// omettait families.slug, colonne NOT NULL UNIQUE). Les familles de test sont donc seedées
// directement en SQL, comme le fait la vraie migration 002_seed_config.
let nextTestFamilyId = 90000;
const seedFamily = (testDb: RealTestDb, moduleSlug: string, name: string): number => {
  const id = nextTestFamilyId++;
  testDb.raw.run(
    'INSERT INTO families (id, slug, module_slug, name, order_index) VALUES (?, ?, ?, ?, ?)',
    [id, `test-${id}`, moduleSlug, name, id]
  );
  return id;
};

describe('Intégration DB réelle — migrations', () => {
  let testDb: RealTestDb;

  beforeAll(async () => {
    testDb = await createMigratedRealDb();
  }, 20000);

  afterAll(async () => {
    await testDb.db.closeAsync?.();
  });

  it('les 12 migrations s\'exécutent sans erreur et sont enregistrées', async () => {
    const versions = testDb.raw.exec('SELECT version FROM schema_migrations ORDER BY version');
    const applied = versions[0]?.values.map((row) => row[0]) ?? [];
    expect(applied).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('le module "assessment" n\'existe plus après la migration 005', async () => {
    const rows = testDb.raw.exec("SELECT slug FROM modules WHERE slug = 'assessment'");
    expect(rows).toEqual([]);
  });

  it('le module "grammar" n\'existe plus après la migration 004', async () => {
    const rows = testDb.raw.exec("SELECT slug FROM modules WHERE slug = 'grammar'");
    expect(rows).toEqual([]);
  });

  it('les 4 identités de branding sont seedées', async () => {
    for (const id of ['primary', 'college', 'lycee', 'adult']) {
      const branding = await getBrandingById(testDb.db, id);
      expect(branding).not.toBeNull();
      expect(branding?.id).toBe(id);
    }
  });

  it('chaque identité a une palette de couleurs non vide', async () => {
    for (const id of ['primary', 'college', 'lycee', 'adult']) {
      const palette = await getIdentityPalette(testDb.db, id);
      expect(palette.length).toBeGreaterThan(0);
    }
  });
});

describe('Intégration DB réelle — contenu réel (migration 007)', () => {
  let testDb: RealTestDb;

  beforeAll(async () => {
    testDb = await createMigratedRealDb();
  }, 20000);

  afterAll(async () => {
    await testDb.db.closeAsync?.();
  });

  it('importe le bon volume de contenu par module et par public', async () => {
    const counts = testDb.raw.exec(`
      SELECT f.module_slug, c.target_audience, COUNT(*) as n
      FROM content c JOIN families f ON f.id = c.family_id
      WHERE f.order_index >= 100
      GROUP BY f.module_slug, c.target_audience
      ORDER BY f.module_slug, c.target_audience
    `);
    const rows = counts[0].values.map((r) => `${r[0]}|${r[1]}|${r[2]}`);
    expect(rows).toEqual(expect.arrayContaining([
      'dialogues|college|10', 'dialogues|primary|10',
      'phrase_types|college|300', 'phrase_types|primary|150',
      'reading|college|50', 'reading|primary|50',
      'vocab|college|407', 'vocab|primary|622',
      'word_games|college|85', 'word_games|primary|36',
    ]));
  });

  it('retrouve un mot de vocabulaire précis avec sa traduction et son exemple', async () => {
    const row = testDb.raw.exec(`
      SELECT data FROM content c JOIN families f ON f.id = c.family_id
      WHERE f.module_slug = 'vocab' AND c.target_audience = 'primary'
        AND json_extract(c.data, '$.word') = 'APPLE'
    `);
    expect(row.length).toBe(1);
    const data = JSON.parse(row[0].values[0][0] as string);
    expect(data.translation).toBe('Pomme');
    expect(data.example).toContain('apple');
  });

  it('migration 010 backfille exampleTranslation pour tout le vocabulaire (perdu à l\'import 007)', async () => {
    const row = testDb.raw.exec(`
      SELECT data FROM content c JOIN families f ON f.id = c.family_id
      WHERE f.module_slug = 'vocab' AND c.target_audience = 'primary'
        AND json_extract(c.data, '$.word') = 'APPLE'
    `);
    const data = JSON.parse(row[0].values[0][0] as string);
    expect(data.exampleTranslation).toBe('Je mange une pomme chaque jour.');

    const emptyCount = testDb.raw.exec(`
      SELECT COUNT(*) FROM content c JOIN families f ON f.id = c.family_id
      WHERE f.module_slug = 'vocab' AND c.target_audience IN ('primary', 'college')
        AND (json_extract(c.data, '$.exampleTranslation') IS NULL
             OR json_extract(c.data, '$.exampleTranslation') = '')
    `);
    expect(emptyCount[0].values[0][0]).toBe(0);
  });

  it('une famille vocab a des sous-familles nommées pour les 4 identités', async () => {
    const family = testDb.raw.exec("SELECT id FROM families WHERE slug = 'corps-sante'");
    const familyId = family[0].values[0][0] as number;
    for (const identity of ['primary', 'college', 'lycee', 'adult']) {
      const labels = await getSubFamiliesByFamily(testDb.db, familyId, identity, 1);
      expect(labels.length).toBeGreaterThan(0);
      expect(labels[0].title).toBeTruthy();
    }
  });

  it('getSubFamiliesByFamily ne mélange pas la progression entre niveaux (bug réel corrigé)', async () => {
    // Une sous-famille vocab a du contenu réparti sur les 4 niveaux de dashboard (chunking
    // par quart lors de l'import). Avant le fix, la requête ne filtrait pas par `level` :
    // avec de la progression à la fois au niveau 1 et au niveau 2 pour la même sous-famille,
    // le LEFT JOIN remontait plusieurs lignes et GROUP BY en gardait une arbitrairement.
    const family = testDb.raw.exec("SELECT id FROM families WHERE slug = 'corps-sante'");
    const familyId = family[0].values[0][0] as number;

    await upsertProgress(testDb.db, {
      user_id: 'u_niveaux', family_id: familyId, subfamily_id: 1, level: 1, completed: 1, total: 5, score: 20,
    });
    await upsertProgress(testDb.db, {
      user_id: 'u_niveaux', family_id: familyId, subfamily_id: 1, level: 2, completed: 4, total: 5, score: 80,
    });

    const atLevel1 = await getSubFamiliesByFamily(testDb.db, familyId, 'primary', 1, 'u_niveaux');
    const atLevel2 = await getSubFamiliesByFamily(testDb.db, familyId, 'primary', 2, 'u_niveaux');

    const sub1AtLevel1 = atLevel1.find((s) => s.subfamily_id === 1);
    const sub1AtLevel2 = atLevel2.find((s) => s.subfamily_id === 1);

    expect(sub1AtLevel1?.progress).toBe(20);
    expect(sub1AtLevel2?.progress).toBe(80);
  });

  it('un dialogue importé a des messages et des questions valides', async () => {
    const row = testDb.raw.exec(`
      SELECT c.data FROM content c JOIN families f ON f.id = c.family_id
      WHERE f.module_slug = 'dialogues' AND c.target_audience = 'primary' LIMIT 1
    `);
    const data = JSON.parse(row[0].values[0][0] as string);
    expect(data.messages.length).toBeGreaterThan(0);
    expect(data.questions.length).toBeGreaterThan(0);
    for (const q of data.questions) {
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThan(q.options.length);
    }
  });

  it('un public ne voit jamais les familles dialogues/reading/word_games réservées à un autre public', async () => {
    // Reproduit le filtre EXISTS ajouté à useFamiliesWithProgress (families n'a pas de
    // target_audience propre — la visibilité dépend du contenu qui lui est associé).
    const familiesVisibleFor = (moduleSlug: string, audience: string) => {
      const result = testDb.raw.exec(`
        SELECT f.slug FROM families f
        WHERE f.module_slug = '${moduleSlug}'
        AND EXISTS (
          SELECT 1 FROM content c
          WHERE c.family_id = f.id AND (c.target_audience = '${audience}' OR c.target_audience = 'all')
        )
      `);
      return result.length ? result[0].values.map((r) => r[0] as string) : [];
    };

    for (const moduleSlug of ['dialogues', 'reading', 'word_games', 'phrase_types']) {
      const primaryFamilies = familiesVisibleFor(moduleSlug, 'primary');
      const collegeFamilies = familiesVisibleFor(moduleSlug, 'college');
      expect(primaryFamilies.some((s) => s.includes('college'))).toBe(false);
      expect(collegeFamilies.some((s) => s.includes('primary'))).toBe(false);
      expect(primaryFamilies.length).toBeGreaterThan(0);
      expect(collegeFamilies.length).toBeGreaterThan(0);
    }
  });

  it('les familles vocab, dialogues, reading ont toutes des content rows accessibles via getContentByFamilyAndLevel', async () => {
    const family = testDb.raw.exec("SELECT id FROM families WHERE slug = 'dlg-primary-1'");
    const familyId = family[0].values[0][0] as number;
    const levelRow = testDb.raw.exec('SELECT level FROM content WHERE family_id = ?', [familyId]);
    const level = levelRow[0].values[0][0] as number;
    const content = await getContentByFamilyAndLevel(testDb.db, familyId, level, 'primary');
    expect(content.length).toBeGreaterThan(0);
  });
});

describe('Intégration DB réelle — fondation cours (multi-langue)', () => {
  let testDb: RealTestDb;

  beforeAll(async () => {
    testDb = await createMigratedRealDb();
  }, 20000);

  afterAll(async () => {
    await testDb.db.closeAsync?.();
  });

  it('tout le contenu migré (007) a bien course = fr-en après la migration 008 (ALTER + backfill)', async () => {
    const result = testDb.raw.exec(`SELECT DISTINCT course FROM content`);
    const courses = result.length ? result[0].values.map((r) => r[0] as string) : [];
    expect(courses).toEqual(['fr-en']);
  });

  it('getContentByFamilyAndLevel isole le contenu par cours (fr-en vs fr-ar synthétique)', async () => {
    const familyId = seedFamily(testDb, 'vocab', 'Course Isolation Family');
    await insertContent(testDb.db, {
      family_id: familyId, level: 1, content_type: 'word',
      data: JSON.stringify({ word: 'قطة', translation: 'chat' }),
      target_audience: 'all', course: 'fr-ar',
    });
    await insertContent(testDb.db, {
      family_id: familyId, level: 1, content_type: 'word',
      data: JSON.stringify({ word: 'cat', translation: 'chat' }),
      target_audience: 'all', course: 'fr-en',
    });

    const frEnContent = await getContentByFamilyAndLevel(testDb.db, familyId, 1, undefined, 'fr-en');
    expect(frEnContent).toHaveLength(1);
    expect(JSON.parse(frEnContent[0].data).word).toBe('cat');

    const frArContent = await getContentByFamilyAndLevel(testDb.db, familyId, 1, undefined, 'fr-ar');
    expect(frArContent).toHaveLength(1);
    expect(JSON.parse(frArContent[0].data).word).toBe('قطة');
  });

  it('un contenu fr-ar synthétique ne rend jamais une famille visible pour un utilisateur fr-en (sous-requête EXISTS de useFamiliesWithProgress)', async () => {
    const familyId = seedFamily(testDb, 'vocab', 'Course EXISTS Family');
    await insertContent(testDb.db, {
      family_id: familyId, level: 1, content_type: 'word',
      data: JSON.stringify({ word: 'test', translation: 'test' }),
      target_audience: 'all', course: 'fr-ar',
    });

    const existsForCourse = (course: string) => {
      const result = testDb.raw.exec(`
        SELECT 1 FROM families f
        WHERE f.id = ${familyId}
        AND EXISTS (
          SELECT 1 FROM content c
          WHERE c.family_id = f.id AND (c.target_audience = 'all') AND c.course = '${course}'
        )
      `);
      return result.length > 0;
    };

    expect(existsForCourse('fr-en')).toBe(false);
    expect(existsForCourse('fr-ar')).toBe(true);
  });
});

describe('Intégration DB réelle — activity_log scopé par utilisateur (migration 009)', () => {
  let testDb: RealTestDb;

  beforeAll(async () => {
    testDb = await createMigratedRealDb();
  }, 20000);

  afterAll(async () => {
    await testDb.db.closeAsync?.();
  });

  it('deux profils jouant la même famille écrivent deux lignes distinctes (ne se clobber plus)', async () => {
    testDb.raw.run(
      `INSERT OR REPLACE INTO activity_log (user_id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
       VALUES (?, 'vocab', 42, 0, 1, 'Animaux', '🐾', 50, ?)`,
      ['user-a', Date.now()]
    );
    testDb.raw.run(
      `INSERT OR REPLACE INTO activity_log (user_id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
       VALUES (?, 'vocab', 42, 0, 1, 'Animaux', '🐾', 80, ?)`,
      ['user-b', Date.now()]
    );

    const rows = testDb.raw.exec(
      `SELECT user_id, progress FROM activity_log WHERE module_slug = 'vocab' AND family_id = 42 ORDER BY user_id`
    );
    const result = rows[0]?.values ?? [];
    expect(result).toEqual([['user-a', 50], ['user-b', 80]]);
  });

  it('calculateUserMetrics ne compte que les jours actifs du user demandé', async () => {
    const today = Date.now();
    const yesterday = today - 86400000;
    testDb.raw.run(
      `INSERT INTO activity_log (user_id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
       VALUES ('metrics-a', 'vocab', 43, 0, 1, 'Familles', '👪', 100, ?)`,
      [today]
    );
    testDb.raw.run(
      `INSERT INTO activity_log (user_id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
       VALUES ('metrics-b', 'vocab', 44, 0, 1, 'Couleurs', '🎨', 100, ?)`,
      [yesterday]
    );
    testDb.raw.run(
      `INSERT INTO activity_log (user_id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
       VALUES ('metrics-b', 'reading', 45, 0, 1, 'Histoire', '📖', 100, ?)`,
      [today]
    );

    const metricsA = await calculateUserMetrics(testDb.db, 'metrics-a');
    expect(metricsA.current_streak).toBe(1);

    const metricsB = await calculateUserMetrics(testDb.db, 'metrics-b');
    expect(metricsB.current_streak).toBe(2);
  });

  it('getRecentActivity ne renvoie que les lignes du user demandé', async () => {
    testDb.raw.run(
      `INSERT INTO activity_log (user_id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
       VALUES ('recent-a', 'vocab', 50, 0, 1, 'Sport', '⚽', 100, ?)`,
      [Date.now()]
    );
    testDb.raw.run(
      `INSERT INTO activity_log (user_id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
       VALUES ('recent-b', 'vocab', 51, 0, 1, 'École', '🎒', 100, ?)`,
      [Date.now()]
    );

    const activityA = await getRecentActivity(testDb.db, 'recent-a');
    expect(activityA).toHaveLength(1);
    expect((activityA[0] as { user_id: string }).user_id).toBe('recent-a');
  });

  it('backfille les lignes pré-existantes (avant la migration) avec user_id = \'\'', async () => {
    // Reproduit l'état d'une base pré-009 : migrations 1 à 8 seulement, puis une ligne insérée
    // à l'ancien format (sans user_id), avant que la migration 009 ne tourne.
    const legacyDb = await createRealDb();
    const runner = new MigrationRunner(legacyDb.db);
    await runner.initialize();
    await runner.runMigrations([
      migration001, migration002, migration003, migration004,
      migration005, migration006, migration007, migration008,
    ]);

    legacyDb.raw.run(
      `INSERT INTO activity_log (module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
       VALUES ('vocab', 99, 0, 1, 'Legacy', '📦', 100, ?)`,
      [Date.now()]
    );

    await runner.runMigration(migration009);

    const rows = legacyDb.raw.exec(`SELECT user_id, family_id FROM activity_log WHERE family_id = 99`);
    expect(rows[0]?.values).toEqual([['', 99]]);

    await legacyDb.db.closeAsync?.();
  });
});

describe('Intégration DB réelle — modules par audience', () => {
  let testDb: RealTestDb;

  beforeAll(async () => {
    testDb = await createMigratedRealDb();
  }, 20000);

  afterAll(async () => {
    await testDb.db.closeAsync?.();
  });

  it('college a les 5 modules core mais pas connector', async () => {
    const modules = await getModulesByAudience(testDb.db, 'college');
    const slugs = modules.map((m) => m.slug);
    expect(slugs).toEqual(expect.arrayContaining(['vocab', 'phrase_types', 'reading', 'dialogues', 'word_games']));
    expect(slugs).not.toContain('connector');
  });

  it('connector est disponible pour lycee et adult à tous les niveaux 1-4', async () => {
    for (const audience of ['lycee', 'adult']) {
      for (let level = 1; level <= 4; level++) {
        const available = await isModuleAvailable(testDb.db, 'connector', audience, level);
        expect(available).toBe(true);
      }
    }
  });

  it('connector n\'est disponible ni pour primary ni pour college', async () => {
    for (const audience of ['primary', 'college']) {
      const available = await isModuleAvailable(testDb.db, 'connector', audience, 1);
      expect(available).toBe(false);
    }
  });

  it('getAvailableModules(lycee, niveau 1) inclut connector, getAvailableModules(college, niveau 1) non', async () => {
    const lyceeModules = await getAvailableModules(testDb.db, 'lycee', 1);
    const collegeModules = await getAvailableModules(testDb.db, 'college', 1);
    expect(lyceeModules).toContain('connector');
    expect(collegeModules).not.toContain('connector');
  });

  it('les 4 audiences ont exactement 4 niveaux', async () => {
    for (const audience of ['primary', 'college', 'lycee', 'adult']) {
      const levels = await getLevelsByAudience(testDb.db, audience);
      expect(levels).toHaveLength(4);
    }
  });
});

describe('Intégration DB réelle — atomicité des migrations', () => {
  it('une migration qui échoue à mi-chemin annule tout (rollback) au lieu de laisser des données partielles', async () => {
    const testDb = await createMigratedRealDb();
    const runner = new MigrationRunner(testDb.db);

    const failingMigration = createMigration(9999, 'test_atomicity', async (db) => {
      await db.execAsync(`CREATE TABLE IF NOT EXISTS test_atomicity (id INTEGER)`);
      await db.runAsync(`INSERT INTO test_atomicity (id) VALUES (1)`);
      throw new Error('Échec simulé à mi-chemin');
    });

    await expect(runner.runMigration(failingMigration)).rejects.toThrow('Échec simulé à mi-chemin');

    // La CREATE TABLE elle-même doit être annulée (DDL transactionnel sous SQLite) —
    // sans ça, la table existerait mais vide, ce qui serait déjà un signe de fuite.
    const tableExists = testDb.raw.exec(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='test_atomicity'`
    );
    expect(tableExists[0]?.values ?? []).toEqual([]);

    // La migration ne doit PAS être enregistrée comme exécutée — sinon elle ne serait
    // jamais rejouée au prochain lancement, alors qu'elle n'a jamais réellement réussi.
    const isExecuted = await runner.isMigrationExecuted(9999);
    expect(isExecuted).toBe(false);

    await testDb.db.closeAsync?.();
  });

  it('une migration qui réussit reste bien enregistrée après (comportement normal préservé)', async () => {
    const testDb = await createMigratedRealDb();
    const runner = new MigrationRunner(testDb.db);

    const okMigration = createMigration(9998, 'test_atomicity_ok', async (db) => {
      await db.execAsync(`CREATE TABLE IF NOT EXISTS test_atomicity_ok (id INTEGER)`);
      await db.runAsync(`INSERT INTO test_atomicity_ok (id) VALUES (1)`);
    });

    await runner.runMigration(okMigration);

    const rows = testDb.raw.exec(`SELECT id FROM test_atomicity_ok`);
    expect(rows[0]?.values ?? []).toEqual([[1]]);
    expect(await runner.isMigrationExecuted(9998)).toBe(true);

    await testDb.db.closeAsync?.();
  });
});

describe('Intégration DB réelle — flux famille → contenu → progression', () => {
  let testDb: RealTestDb;

  beforeAll(async () => {
    testDb = await createMigratedRealDb();
  }, 20000);

  afterAll(async () => {
    await testDb.db.closeAsync?.();
  });

  it('crée une famille, y ajoute du contenu, enregistre une progression et la relit correctement', async () => {
    const familyId = seedFamily(testDb, 'vocab', 'Test Family');

    await insertContent(testDb.db, {
      family_id: familyId,
      level: 1,
      content_type: 'word',
      data: JSON.stringify({ word: 'apple', translation: 'pomme' }),
      course: 'fr-en',
    });

    const content = await getContentByFamilyAndLevel(testDb.db, familyId, 1);
    expect(content).toHaveLength(1);
    expect(JSON.parse(content[0].data).word).toBe('apple');

    await upsertProgress(testDb.db, {
      user_id: 'test_user',
      family_id: familyId,
      subfamily_id: 0,
      level: 1,
      completed: 3,
      total: 10,
      score: 30,
    });

    const progress = await getProgressByFamily(testDb.db, 'test_user', familyId);
    expect(progress).toHaveLength(1);
    expect(progress[0].completed).toBe(3);

    const aggregated = await getAggregatedFamilyProgress(testDb.db, 'test_user', familyId, 1);
    expect(aggregated).toEqual({ completed: 3, total: 10 });
  });

  it('upsertProgress écrase la ligne précédente (INSERT OR REPLACE) au lieu de la dupliquer', async () => {
    const familyId = seedFamily(testDb, 'vocab', 'Replace Family');

    await upsertProgress(testDb.db, {
      user_id: 'u2', family_id: familyId, subfamily_id: 0, level: 1, completed: 2, total: 10, score: 20,
    });
    await upsertProgress(testDb.db, {
      user_id: 'u2', family_id: familyId, subfamily_id: 0, level: 1, completed: 9, total: 10, score: 90,
    });

    const rows = await getProgressByFamily(testDb.db, 'u2', familyId);
    expect(rows).toHaveLength(1);
    expect(rows[0].completed).toBe(9);
  });

  it('getAggregatedFamilyProgress additionne plusieurs sous-familles', async () => {
    const familyId = seedFamily(testDb, 'vocab', 'Agg Family');

    await upsertProgress(testDb.db, { user_id: 'u3', family_id: familyId, subfamily_id: 1, level: 2, completed: 5, total: 10, score: 50 });
    await upsertProgress(testDb.db, { user_id: 'u3', family_id: familyId, subfamily_id: 2, level: 2, completed: 4, total: 10, score: 40 });

    const aggregated = await getAggregatedFamilyProgress(testDb.db, 'u3', familyId, 2);
    expect(aggregated).toEqual({ completed: 9, total: 20 });
  });

  it('calculateUserMetrics: words_learned ne compte que les mots du NIVEAU complété, pas toute la famille', async () => {
    // Régression : la jointure comptait tous les mots de la famille dès qu'UN niveau était
    // complété, peu importe lequel. Famille à 2 niveaux, seul le niveau 1 est complété.
    const familyId = seedFamily(testDb, 'vocab', 'Metrics Words Family');

    await insertContent(testDb.db, { family_id: familyId, level: 1, content_type: 'word', data: JSON.stringify({ word: 'cat' }), course: 'fr-en' });
    await insertContent(testDb.db, { family_id: familyId, level: 1, content_type: 'word', data: JSON.stringify({ word: 'dog' }), course: 'fr-en' });
    await insertContent(testDb.db, { family_id: familyId, level: 2, content_type: 'word', data: JSON.stringify({ word: 'elephant' }), course: 'fr-en' });
    await insertContent(testDb.db, { family_id: familyId, level: 2, content_type: 'word', data: JSON.stringify({ word: 'giraffe' }), course: 'fr-en' });

    await upsertProgress(testDb.db, {
      user_id: 'metrics_words_user', family_id: familyId, subfamily_id: 0, level: 1, completed: 2, total: 2, score: 100,
    });
    // Niveau 2 jamais commencé : pas de ligne progress pour ce niveau.

    const metrics = await calculateUserMetrics(testDb.db, 'metrics_words_user');

    // Attendu : 2 (niveau 1 seulement) — l'ancien bug aurait renvoyé 4 (toute la famille).
    expect(metrics.words_learned).toBe(2);
  });
});
