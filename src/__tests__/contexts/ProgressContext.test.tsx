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

    it('calcule correctement : 1 module à 100% sur 7 = 14%', async () => {
      const db = makeDb({
        getAllAsync: jest.fn().mockResolvedValue([
          { family_id: 101, subfamily_id: 0, level: 1, completed: 10, total: 10, last_accessed: null, module_slug: 'vocab' },
        ]),
      });
      setupUser(db);

      const { result } = renderHook(() => useProgress(), { wrapper });
      await act(flushPromises);

      // round(100 / 7) = 14
      expect(result.current.getLevelProgress(1)).toBe(14);
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
