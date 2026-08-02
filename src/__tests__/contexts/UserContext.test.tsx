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

    it('met à jour le state ET persiste dans AsyncStorage', async () => {
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

      const persisted = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY) ?? '{}');
      expect(persisted.firstName).toBe('Marie');
      expect(persisted.isOnboarded).toBe(true);
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
});
