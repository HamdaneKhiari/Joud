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

import { createMigratedRealDb, type RealTestDb } from '../testUtils/realDb';
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
} from '@/database/queries';
import { getSubFamiliesByFamily } from '@/services/subfamilyService';

// insertFamily n'existe plus (supprimé — code mort et cassé, cf. task.md section 14 :
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

  it('les 7 migrations s\'exécutent sans erreur et sont enregistrées', async () => {
    const versions = testDb.raw.exec('SELECT version FROM schema_migrations ORDER BY version');
    const applied = versions[0]?.values.map((row) => row[0]) ?? [];
    expect(applied).toEqual([1, 2, 3, 4, 5, 6, 7]);
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
});
