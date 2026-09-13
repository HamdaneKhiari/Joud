/**
 * UserContext — tests
 *
 * Vérifie le chargement du profil, la persistance, la migration,
 * et l'action updateUser.
 *
 * Note: UserProvider rend un ActivityIndicator pendant loading=true
 * (pas de children). renderHook attend flushPromises pour avoir
 * le contexte disponible.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider, useUser } from '@/contexts/UserContext';

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// ============================================
// Mocks
// ============================================

const mockDatabase = { getAllAsync: jest.fn(), execAsync: jest.fn(), runAsync: jest.fn(), getFirstAsync: jest.fn() };

jest.mock('@/database/init', () => ({
  initDatabase: jest.fn().mockResolvedValue(mockDatabase),
}));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

const STORAGE_KEY = 'JOUD_USER_PROFILE';
const STORAGE_KEY_PROFILES = 'JOUD_USER_PROFILES';
const STORAGE_KEY_ACTIVE_PROFILE_ID = 'JOUD_ACTIVE_PROFILE_ID';

function wrapper({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}

// ============================================
// Tests
// ============================================

describe('UserContext', () => {

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    const { initDatabase } = require('@/database/init');
    initDatabase.mockResolvedValue(mockDatabase);
  });

  describe('chargement initial', () => {

    it('charge le profil depuis AsyncStorage', async () => {
      const storedUser = { id: 'user_01', firstName: 'Alice', audience: 'college', isOnboarded: true };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser));

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.user?.firstName).toBe('Alice');
      expect(result.current.user?.audience).toBe('college');
      expect(result.current.loading).toBe(false);
    });

    it('utilise DEFAULT_USER quand AsyncStorage est vide (premier lancement)', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.user?.id).toBe('user_01');
      expect(result.current.user?.isOnboarded).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it('initialise db après initDatabase()', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.db).toBe(mockDatabase);
    });

    it('migre profil sans isOnboarded : firstName non vide → true', async () => {
      const legacyUser = { id: 'user_01', firstName: 'Bob', audience: 'lycee' }; // pas de isOnboarded
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(legacyUser));

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.user?.isOnboarded).toBe(true);
    });

    it('migre profil sans isOnboarded : firstName vide → false', async () => {
      const legacyUser = { id: 'user_01', firstName: '', audience: 'college' };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(legacyUser));

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.user?.isOnboarded).toBe(false);
    });

    it('utilise DEFAULT_USER si initDatabase échoue', async () => {
      const { initDatabase } = require('@/database/init');
      initDatabase.mockRejectedValue(new Error('DB init failed'));

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      // Pas de crash, user par défaut
      expect(result.current.loading).toBe(false);
      expect(result.current.user?.id).toBe('user_01');
      expect(result.current.db).toBeNull();
    });
  });

  describe('updateUser', () => {

    it('met à jour le state ET persiste dans AsyncStorage (nouvelle clé JOUD_USER_PROFILES)', async () => {
      const storedUser = { id: 'user_01', firstName: '', audience: 'college', isOnboarded: false };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser));

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      await act(async () => {
        await result.current.updateUser({ firstName: 'Marie', audience: 'lycee' });
      });

      expect(result.current.user?.firstName).toBe('Marie');
      expect(result.current.user?.audience).toBe('lycee');
      expect(result.current.user?.isOnboarded).toBe(true); // toujours forcé à true

      const persisted = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY_PROFILES) ?? '[]');
      expect(persisted[0].firstName).toBe('Marie');
      expect(persisted[0].isOnboarded).toBe(true);

      // La clé legacy n'est jamais réécrite après la migration initiale.
      const legacy = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY) ?? '{}');
      expect(legacy.firstName).toBe('');
    });

    it('force isOnboarded = true quel que soit le payload', async () => {
      const storedUser = { id: 'user_01', firstName: 'Alice', audience: 'college', isOnboarded: false };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser));

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      await act(async () => {
        await result.current.updateUser({ firstName: 'Alice' });
      });

      expect(result.current.isOnboarded).toBe(true);
    });
  });

  describe('isOnboarded', () => {

    it('isOnboarded = true si user.isOnboarded = true', async () => {
      const storedUser = { id: 'user_01', firstName: 'Alice', audience: 'college', isOnboarded: true };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser));

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.isOnboarded).toBe(true);
    });

    it('isOnboarded = false par défaut (premier lancement)', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.isOnboarded).toBe(false);
    });
  });

  describe('multi-profils', () => {

    it('migre un profil legacy unique en liste de 1 profil au premier chargement', async () => {
      const storedUser = { id: 'user_01', firstName: 'Alice', audience: 'college', isOnboarded: true };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser));

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.profiles).toHaveLength(1);
      expect(result.current.profiles[0].firstName).toBe('Alice');
      expect(result.current.user?.firstName).toBe('Alice');

      const persisted = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY_PROFILES) ?? '[]');
      expect(persisted).toHaveLength(1);
      expect(persisted[0].firstName).toBe('Alice');
    });

    it('charge directement depuis JOUD_USER_PROFILES si déjà migré (pas de re-migration)', async () => {
      const profiles = [
        { id: 'user_01', firstName: 'Alice', audience: 'college', course: 'fr-en', isOnboarded: true },
        { id: 'user_99', firstName: 'Bob', audience: 'college', course: 'fr-en', isOnboarded: true },
      ];
      await AsyncStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, 'user_99');

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      expect(result.current.profiles).toHaveLength(2);
      expect(result.current.user?.firstName).toBe('Bob'); // le profil actif persisté
    });

    it('addProfile crée un nouveau profil, le rend actif, et respecte le plafond', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      let secondProfile: { id: string; firstName: string } | undefined;
      await act(async () => {
        secondProfile = await result.current.addProfile('Léo');
      });

      expect(result.current.profiles).toHaveLength(2);
      expect(result.current.user?.id).toBe(secondProfile?.id);
      expect(result.current.user?.firstName).toBe('Léo');
      expect(result.current.user?.isOnboarded).toBe(true); // pas besoin de re-onboarder

      // Persisté comme profil actif, pas juste en mémoire
      const activeId = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
      expect(activeId).toBe(secondProfile?.id);
    });

    it('addProfile rejette au-delà du plafond de profils', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      // 1 profil par défaut + 3 ajoutés = 4 (le plafond) — chaque addProfile dans son
      // propre act() pour que result.current se rafraîchisse entre chaque appel.
      await act(async () => {
        await result.current.addProfile('Léo');
      });
      await act(async () => {
        await result.current.addProfile('Nora');
      });
      await act(async () => {
        await result.current.addProfile('Sam');
      });
      expect(result.current.profiles).toHaveLength(4);
      expect(result.current.canAddProfile).toBe(false);

      await expect(
        act(async () => {
          await result.current.addProfile('Trop');
        })
      ).rejects.toThrow(/maximum/i);
      expect(result.current.profiles).toHaveLength(4);
    });

    it('switchProfile change le profil actif et le persiste', async () => {
      const profiles = [
        { id: 'user_01', firstName: 'Alice', audience: 'college', course: 'fr-en', isOnboarded: true },
        { id: 'user_99', firstName: 'Bob', audience: 'college', course: 'fr-en', isOnboarded: true },
      ];
      await AsyncStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, 'user_01');

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);
      expect(result.current.user?.firstName).toBe('Alice');

      act(() => {
        result.current.switchProfile('user_99');
      });
      await act(flushPromises);

      expect(result.current.user?.firstName).toBe('Bob');
      const activeId = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
      expect(activeId).toBe('user_99');
    });

    it('switchProfile ignore un id inconnu (pas de crash, pas de changement)', async () => {
      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);
      const originalId = result.current.user?.id;

      act(() => {
        result.current.switchProfile('id_qui_nexiste_pas');
      });
      await act(flushPromises);

      expect(result.current.user?.id).toBe(originalId);
    });

    it('updateUser ne modifie que le profil actif, pas les autres', async () => {
      const profiles = [
        { id: 'user_01', firstName: 'Alice', audience: 'college', course: 'fr-en', isOnboarded: true },
        { id: 'user_99', firstName: 'Bob', audience: 'college', course: 'fr-en', isOnboarded: true },
      ];
      await AsyncStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, 'user_01');

      const { result } = renderHook(() => useUser(), { wrapper });
      await act(flushPromises);

      await act(async () => {
        await result.current.updateUser({ firstName: 'Alicia' });
      });

      expect(result.current.profiles.find((p) => p.id === 'user_01')?.firstName).toBe('Alicia');
      expect(result.current.profiles.find((p) => p.id === 'user_99')?.firstName).toBe('Bob');
    });
  });
});
