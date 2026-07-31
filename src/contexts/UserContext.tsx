import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SQLiteDatabase } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase } from '@/database/init';
import secureStorage from '@/services/SecureStorage';
import { log } from '@/utils/logUtils';

interface User {
  id: string;
  firstName: string;
  audience: 'primary' | 'college' | 'lycee' | 'adult';
  // Paire de langues, ex: 'fr-en', 'fr-ar'. Pas de verrouillage/sélecteur pour l'instant
  // (une seule valeur existe) — fondation pour un futur modèle multi-langue.
  course: string;
  isOnboarded: boolean;
  lastActivity?: string;
}

interface UserContextType {
  db: SQLiteDatabase | null;
  user: User | null;
  loading: boolean;
  isOnboarded: boolean;
  isAudienceLocked: boolean;
  updateAudience: (newAudience: User['audience']) => void;
  updateUser: (partial: Partial<Omit<User, 'id'>>) => void;
}

const STORAGE_KEY_USER = 'JOUD_USER_PROFILE';

const VALID_AUDIENCES: User['audience'][] = ['primary', 'college', 'lycee', 'adult'];

// Verrouille l'audience pour les builds mono-public (défini par profil dans eas.json,
// EXPO_PUBLIC_* est inliné dans le bundle par Metro au build). Absent en dev/preview
// interne : l'audience reste sélectionnable comme aujourd'hui.
const LOCKED_AUDIENCE = VALID_AUDIENCES.includes(process.env.EXPO_PUBLIC_LOCKED_AUDIENCE as User['audience'])
  ? (process.env.EXPO_PUBLIC_LOCKED_AUDIENCE as User['audience'])
  : null;

const DEFAULT_USER: User = {
  id: 'user_01',
  firstName: '',
  audience: LOCKED_AUDIENCE || 'college',
  course: 'fr-en',
  isOnboarded: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // 1. Charger le profil utilisateur depuis AsyncStorage
  useEffect(() => {
    const loadUserAndDB = async () => {
      try {
        // Purge une éventuelle clé API résiduelle du Keychain avant toute lecture,
        // au cas où l'app vient d'être réinstallée sur un appareil ayant déjà servi.
        await secureStorage.purgeIfStaleInstall();

        const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
          const parsed = JSON.parse(storedUser) as User;
          // Migration: anciens profils sans isOnboarded
          if (parsed.isOnboarded === undefined) {
            parsed.isOnboarded = !!parsed.firstName && parsed.firstName !== '';
          }
          // Migration: anciens profils sans course (avant l'ajout du modèle multi-langue)
          if (!parsed.course) {
            parsed.course = 'fr-en';
          }
          // Build mono-public : l'audience stockée ne fait pas foi, ce build ne sert qu'un public
          if (LOCKED_AUDIENCE) {
            parsed.audience = LOCKED_AUDIENCE;
          }
          setUser(parsed);
        } else {
          // Premier lancement
          setUser(DEFAULT_USER);
        }

        const database = await initDatabase();
        setDb(database);
      } catch (e) {
        log.error('[UserContext] Init error:', e);
        setUser(DEFAULT_USER);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndDB();
  }, []);

  // Changer l'audience (et persister) — no-op sur un build mono-public verrouillé
  const updateAudience = useCallback(async (newAudience: User['audience']) => {
    if (!user || LOCKED_AUDIENCE) return;
    const updated = { ...user, audience: newAudience };
    setUser(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    } catch (e) {
      log.warn('[UserContext] updateAudience persist error:', e);
    }
  }, [user]);

  // Mettre a jour le profil utilisateur (et persister)
  const updateUser = useCallback(async (partial: Partial<Omit<User, 'id'>>) => {
    if (!user) return;
    const updated = { ...user, ...partial, isOnboarded: true };
    setUser(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    } catch (e) {
      log.warn('[UserContext] updateUser persist error:', e);
    }
  }, [user]);

  const isOnboarded = user?.isOnboarded ?? false;
  const isAudienceLocked = !!LOCKED_AUDIENCE;

  const contextValue = useMemo(
    () => ({ db, user, loading, isOnboarded, isAudienceLocked, updateAudience, updateUser }),
    [db, user, loading, isOnboarded, isAudienceLocked, updateAudience, updateUser]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  return context;
};
