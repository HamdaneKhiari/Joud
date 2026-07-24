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

  it('les 6 migrations s\'exécutent sans erreur et sont enregistrées', async () => {
    const versions = testDb.raw.exec('SELECT version FROM schema_migrations ORDER BY version');
    const applied = versions[0]?.values.map((row) => row[0]) ?? [];
    expect(applied).toEqual([1, 2, 3, 4, 5, 6]);
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
