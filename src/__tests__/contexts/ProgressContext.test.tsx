/**
 * ProgressContext — tests critiques
 *
 * Couvre le dual-save (SQLite + AsyncStorage), les fallbacks,
 * les migrations, et les actions principales.
 * C'est la logique la plus risquée de l'app : si elle casse, l'utilisateur perd sa progression.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressProvider, useProgress } from '@/contexts/ProgressContext';
import { getStorageKey } from '@/contexts/progressUtils';

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// ============================================
// Mocks — factories uniquement (pas de référence à des variables locales)
// ============================================

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

// ============================================
// Helpers
// ============================================

const makeDb = (overrides: Partial<Record<string, jest.Mock>> = {}) => ({
  getAllAsync: jest.fn().mockResolvedValue([]),
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 0 }),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
  ...overrides,
});

const MOCK_USER = { id: 'user_01', firstName: 'Alice', audience: 'college', isOnboarded: true };

function setupUser(db: ReturnType<typeof makeDb> | null = makeDb(), user = MOCK_USER) {
  const { useUser } = require('@/contexts/UserContext');
  useUser.mockReturnValue({ db, user, loading: false });
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}

// ============================================
// Tests
// ============================================

describe('ProgressContext', () => {

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    await AsyncStorage.clear();
    setupUser();
  });

  // =================== CHARGEMENT INITIAL ===================

  describe('chargement initial', () => {

    it('charge depuis SQLite quand des données existent', async () => {
      const db = makeDb({
        getAllAsync: jest.fn().mockResolvedValue([
          { family_id: 101, subfamily_id: 0, level: 1, completed: 3, total: 10, last_accessed: null, module_slug: 'vocab' },
        ]),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress?.level1?.vocab?.['101']).toMatchObject({
        completed: 3,
        total: 10,
      });
    });

    it('met à jour AsyncStorage après chargement SQLite (cache sync)', async () => {
      const db = makeDb({
        getAllAsync: jest.fn().mockResolvedValue([
          { family_id: 202, subfamily_id: 1, level: 2, completed: 5, total: 8, last_accessed: '2025-01-15', module_slug: 'reading' },
        ]),
      });
      setupUser(db);

      renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        getStorageKey(MOCK_USER.id),
        expect.stringContaining('"completed":5')
      );
    });

    it('fallback AsyncStorage quand SQLite est vide', async () => {
      const savedProgress = {
        level1: {
          vocab: { '301': { completed: 7, total: 10 } },
          phrase_types: {}, reading: {}, dialogues: {}, word_games: {}, connector: {},
        },
      };
      await AsyncStorage.setItem(getStorageKey(MOCK_USER.id), JSON.stringify(savedProgress));
      setupUser(makeDb({ getAllAsync: jest.fn().mockResolvedValue([]) }));

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.progress?.level1?.vocab?.['301']?.completed).toBe(7);
    });

    it('fallback AsyncStorage quand SQLite échoue (bug silencieux évité)', async () => {
      const savedProgress = {
        level1: {
          vocab: { '401': { completed: 2, total: 8 } },
          phrase_types: {}, reading: {}, dialogues: {}, word_games: {}, connector: {},
        },
      };
      await AsyncStorage.setItem(getStorageKey(MOCK_USER.id), JSON.stringify(savedProgress));

      const db = makeDb({
        getAllAsync: jest.fn().mockRejectedValue(new Error('DB corruption')),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      // Pas de crash, données AsyncStorage chargées
      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress?.level1?.vocab?.['401']?.completed).toBe(2);
    });

    it('migre sentences → phrase_types automatiquement', async () => {
      // Ancien format avec "sentences" au lieu de "phrase_types"
      const legacyProgress = {
        level1: {
          sentences: { '501': { completed: 3, total: 5 } },
          vocab: {}, reading: {}, dialogues: {}, word_games: {}, connector: {},
        },
      };
      await AsyncStorage.setItem(getStorageKey(MOCK_USER.id), JSON.stringify(legacyProgress));
      setupUser(makeDb({ getAllAsync: jest.fn().mockResolvedValue([]) }));

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.progress?.level1?.phrase_types?.['501']?.completed).toBe(3);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.current.progress?.level1 as any)?.sentences).toBeUndefined();
    });

    it('migre l\'ancienne clé JOUDPRIMARY_PROGRESS', async () => {
      const oldProgress = {
        level1: { vocab: { '601': { completed: 1, total: 3 } } },
      };
      await AsyncStorage.setItem('JOUDPRIMARY_PROGRESS', JSON.stringify(oldProgress));
      setupUser(makeDb({ getAllAsync: jest.fn().mockResolvedValue([]) }));

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.progress?.level1?.vocab?.['601']?.completed).toBe(1);
      // Ancienne clé supprimée
      expect(await AsyncStorage.getItem('JOUDPRIMARY_PROGRESS')).toBeNull();
    });

    it('state initial vide quand user est null', async () => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({ db: makeDb(), user: null, loading: false });

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress?.level1?.vocab).toEqual({});
    });

    it('construit la clé composite "familyId-subfamilyId" depuis SQLite', async () => {
      const db = makeDb({
        getAllAsync: jest.fn().mockResolvedValue([
          { family_id: 10, subfamily_id: 3, level: 1, completed: 4, total: 12, last_accessed: null, module_slug: 'dialogues' },
        ]),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      // Clé composite "10-3"
      expect(result.current.progress?.level1?.dialogues?.['10-3']).toMatchObject({
        completed: 4,
        total: 12,
      });
    });
  });

  // =================== SAUVEGARDE ===================

  describe('saveProgressNow', () => {

    it('écrit dans AsyncStorage', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);
      jest.clearAllMocks(); // Ignore les appels du chargement initial

      await act(async () => { await result.current.saveProgressNow(); });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        getStorageKey(MOCK_USER.id),
        expect.any(String)
      );
    });

    it('déclenche syncToSQLite (BEGIN TRANSACTION)', async () => {
      // Track avec de vraies données pour déclencher la boucle SQLite
      const db = makeDb();
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(1, 'vocab', '101', 4, 10); });
      jest.clearAllMocks();

      await act(async () => { await result.current.saveProgressNow(); });

      expect(db.execAsync).toHaveBeenCalledWith('BEGIN TRANSACTION');
    });

    it('écrit AsyncStorage même si SQLite échoue — pas de crash (résilience critique)', async () => {
      const db = makeDb({
        getAllAsync: jest.fn().mockResolvedValue([]),
        execAsync: jest.fn().mockRejectedValue(new Error('SQLite write fail')),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(1, 'vocab', '101', 4, 10); });

      // Ne doit pas jeter
      await expect(act(async () => { await result.current.saveProgressNow(); })).resolves.not.toThrow();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        getStorageKey(MOCK_USER.id),
        expect.any(String)
      );
    });
  });

  // =================== RESET ===================

  describe('resetProgress', () => {

    it('supprime SQLite, AsyncStorage, et vide le state', async () => {
      const db = makeDb({
        getAllAsync: jest.fn().mockResolvedValue([
          { family_id: 101, subfamily_id: 0, level: 1, completed: 5, total: 10, last_accessed: null, module_slug: 'vocab' },
        ]),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);
      expect(result.current.progress?.level1?.vocab?.['101']?.completed).toBe(5);

      await act(async () => { await result.current.resetProgress(); });

      expect(db.runAsync).toHaveBeenCalledWith(
        'DELETE FROM progress WHERE user_id = ?',
        [MOCK_USER.id]
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(getStorageKey(MOCK_USER.id));
      expect(result.current.progress?.level1?.vocab).toEqual({});
    });

    it('ne crashe pas si SQLite échoue pendant le reset', async () => {
      const db = makeDb({
        runAsync: jest.fn().mockRejectedValue(new Error('DB locked')),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      await expect(act(async () => { await result.current.resetProgress(); })).resolves.not.toThrow();
    });
  });

  // =================== TRACK ITEM ===================

  describe('trackItemCompletion', () => {

    it('met à jour completed = itemIndex + 1', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(1, 'vocab', '101', 4, 10); });

      const family = result.current.progress?.level1?.vocab?.['101'];
      expect(family?.completed).toBe(5);
      expect(family?.total).toBe(10);
      expect(family?.lastReviewed).toBeGreaterThan(0);
    });

    it('supporte les clés composites "familyId-subfamilyId"', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(2, 'reading', '15-3', 0, 5); });

      expect(result.current.progress?.level2?.reading?.['15-3']?.completed).toBe(1);
    });

    it('écrase la progression précédente du même item', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(1, 'vocab', '101', 2, 10); });
      act(() => { result.current.trackItemCompletion(1, 'vocab', '101', 7, 10); });

      expect(result.current.progress?.level1?.vocab?.['101']?.completed).toBe(8);
    });
  });

  // =================== CALCULS ===================

  describe('getLevelProgress', () => {

    it('retourne 0 pour un niveau sans données', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.getLevelProgress(1)).toBe(0);
    });

    it('calcule correctement : 1 module à 100% sur 5 (audience college, sans connector) = 20%', async () => {
      const db = makeDb({
        getAllAsync: jest.fn().mockResolvedValue([
          { family_id: 101, subfamily_id: 0, level: 1, completed: 10, total: 10, last_accessed: null, module_slug: 'vocab' },
        ]),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      // college n'a pas connector → 5 modules applicables. round(100 / 5) = 20
      expect(result.current.getLevelProgress(1)).toBe(20);
    });

    it('calcule correctement : tous les modules à 100% = 100%', async () => {
      const allModuleSlugs = ['vocab', 'phrase_types', 'reading', 'dialogues', 'word_games', 'connector'];
      const rows = allModuleSlugs.map((slug, i) => ({
        family_id: 100 + i, subfamily_id: 0, level: 1, completed: 10, total: 10, last_accessed: null, module_slug: slug,
      }));

      const db = makeDb({ getAllAsync: jest.fn().mockResolvedValue(rows) });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.getLevelProgress(1)).toBe(100);
    });

    it('BUG RÉEL — une famille jamais ouverte compte 0% quand familyIdsByModule est fourni', async () => {
      // Sans familyIdsByModule, seules les familles déjà commencées entrent dans la moyenne du
      // module (famille '101' à 100%, famille '102' totalement absente de l'état → ignorée),
      // ce qui donne vocab=100% et gonfle le niveau. Avec la liste complète (101 ET 102, comme
      // le fait maintenant Dashboard.tsx via getFamiliesByModuleAndLevel), 102 compte pour 0%.
      const db = makeDb({
        getAllAsync: jest.fn().mockResolvedValue([
          { family_id: 101, subfamily_id: 0, level: 1, completed: 10, total: 10, last_accessed: null, module_slug: 'vocab' },
        ]),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      // Sans le paramètre : comportement inchangé (rétrocompatible)
      expect(result.current.getLevelProgress(1)).toBe(20);

      // Avec le paramètre : vocab = (100 + 0) / 2 = 50%, niveau (collège, 5 modules) = round(50/5) = 10%
      const familyIdsByModule = { vocab: ['101', '102'] };
      expect(result.current.getLevelProgress(1, familyIdsByModule)).toBe(10);
    });
  });

  describe('getFamilyProgress', () => {

    it('trouve la progression avec une clé exacte (modules sans sous-famille)', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(1, 'word_games', '20', 3, 4); });

      expect(result.current.getFamilyProgress(1, 'word_games', '20')).toBe(100);
    });

    it('BUG RÉEL — agrège les sous-familles quand on interroge avec l\'id de famille brut', async () => {
      // Cas exact de ExerciceSelectionScreen/ModuleItem : useGetFamiliesByModule renvoie des
      // id de famille bruts ("1"), mais vocab/phrase_types/reading/dialogues stockent la
      // progression sous des clés composites "1-1", "1-2"... Avant le fix, cette requête
      // retournait toujours 0 car "1" ne matchait jamais "1-1"/"1-2" exactement.
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(1, 'vocab', '1-1', 3, 4); }); // sous-famille 1 : 4/4 = 100%
      act(() => { result.current.trackItemCompletion(1, 'vocab', '1-2', 1, 4); }); // sous-famille 2 : 2/4 = 50%

      // Interrogation avec l'id de famille brut "1" (pas "1-1" ni "1-2")
      // Complété pondéré : (4+2)/(4+4) = 6/8 = 75%
      expect(result.current.getFamilyProgress(1, 'vocab', '1')).toBe(75);
    });

    it('retourne 0 si aucune entrée ne correspond', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.getFamilyProgress(1, 'vocab', '999')).toBe(0);
    });

    it('ne mélange pas les familles dont l\'id est un préfixe d\'un autre (ex: "1" vs "12")', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(1, 'reading', '12-1', 9, 10); }); // famille 12, pas 1

      expect(result.current.getFamilyProgress(1, 'reading', '1')).toBe(0);
      expect(result.current.getFamilyProgress(1, 'reading', '12')).toBe(100);
    });
  });

  describe('getExerciseProgress', () => {

    it('BUG RÉEL — calcule un pourcentage de module non nul avec des familyIds bruts sur un module à sous-familles', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.trackItemCompletion(1, 'phrase_types', '3-1', 3, 4); }); // 4/4 = 100%

      // Reproduit exactement l'appel de ModuleItem : familyIds bruts issus de useGetFamiliesByModule
      expect(result.current.getExerciseProgress(1, 'phrase_types', ['3', '4'])).toBe(50); // (100 + 0) / 2
    });
  });

  describe('refreshProgress', () => {

    it('recharge depuis SQLite et met à jour le state', async () => {
      const db = makeDb({
        getAllAsync: jest.fn()
          .mockResolvedValueOnce([]) // Chargement initial
          .mockResolvedValueOnce([   // Après refresh
            { family_id: 999, subfamily_id: 0, level: 3, completed: 6, total: 6, last_accessed: null, module_slug: 'reading' },
          ]),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      expect(result.current.progress?.level3?.reading?.['999']).toBeUndefined();

      await act(async () => { await result.current.refreshProgress(); });

      expect(result.current.progress?.level3?.reading?.['999']?.completed).toBe(6);
    });
  });

  describe('getLastActivity', () => {
    it('retourne null si aucune donnée pour le niveau', async () => {
      setupUser(makeDb());
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);
      expect(result.current.getLastActivity(99, 'vocab')).toBeNull();
    });

    it('retourne la famille la plus récemment révisée', async () => {
      const now = Date.now();
      const progressData = {
        level1: {
          vocab: {
            '5': { completed: 3, total: 5, lastReviewed: now - 1000 },
            '6': { completed: 5, total: 5, lastReviewed: now },
          }
        }
      };
      AsyncStorage.setItem('JOUD_PROGRESS_user_01', JSON.stringify(progressData));
      setupUser(makeDb());
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);
      const activity = result.current.getLastActivity(1, 'vocab');
      expect(activity?.familyId).toBe('6');
      expect(activity?.progress).toBe(100);
    });

    it('retourne null si aucune famille avec lastReviewed', async () => {
      const progressData = {
        level1: { vocab: { '5': { completed: 2, total: 5 } } }
      };
      AsyncStorage.setItem('JOUD_PROGRESS_user_01', JSON.stringify(progressData));
      setupUser(makeDb());
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);
      expect(result.current.getLastActivity(1, 'vocab')).toBeNull();
    });
  });

  describe('getRecommendedModule', () => {
    it('retourne null si aucune donnée pour le niveau', async () => {
      setupUser(makeDb());
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);
      expect(result.current.getRecommendedModule(99)).toBeNull();
    });

    it('retourne le module le plus récent', async () => {
      const now = Date.now();
      const progressData = {
        level1: {
          vocab:   { '5': { completed: 3, total: 5, lastReviewed: now - 5000 } },
          reading: { '7': { completed: 1, total: 8, lastReviewed: now } },
        }
      };
      AsyncStorage.setItem('JOUD_PROGRESS_user_01', JSON.stringify(progressData));
      setupUser(makeDb());
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);
      const recommended = result.current.getRecommendedModule(1);
      expect(recommended?.exerciseType).toBe('reading');
    });
  });

  describe('getRevisionFamilies', () => {
    it('retourne un tableau vide si aucune progression', async () => {
      setupUser(makeDb());
      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);
      const families = result.current.getRevisionFamilies(1);
      expect(Array.isArray(families)).toBe(true);
    });
  });
});
