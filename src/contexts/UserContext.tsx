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
  profiles: User[];
  loading: boolean;
  isOnboarded: boolean;
  canAddProfile: boolean;
  hasPickedProfileThisSession: boolean;
  updateUser: (partial: Partial<Omit<User, 'id'>>) => void;
  addProfile: (firstName: string) => Promise<User>;
  switchProfile: (id: string) => void;
  acknowledgeProfilePicked: () => void;
}

// Legacy : ancienne clé mono-profil, conservée pour la migration automatique des
// installations existantes — jamais réécrite après la migration.
const STORAGE_KEY_USER_LEGACY = 'JOUD_USER_PROFILE';
const STORAGE_KEY_PROFILES = 'JOUD_USER_PROFILES';
const STORAGE_KEY_ACTIVE_PROFILE_ID = 'JOUD_ACTIVE_PROFILE_ID';

// Pas de vérification d'achat (aucun système d'IAP dans le projet) — un plafond
// raisonnable suffit à couvrir l'usage familial visé (pack "2 enfants") avec de la
// marge, sans construire de logique de paiement pour une app locale sans compte.
const MAX_PROFILES = 4;

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

function migrateLegacyUser(parsed: User): User {
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
  return parsed;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  // En mémoire seulement, jamais persisté : se remet à false à chaque lancement
  // (cold start) pour redemander "qui joue ?" si plusieurs profils existent — mais
  // reste true tant que l'app tourne, pour ne pas redemander à chaque navigation.
  const [hasPickedProfileThisSession, setHasPickedProfileThisSession] = useState(false);

  // 1. Charger la liste des profils (ou migrer l'ancien profil unique) depuis AsyncStorage
  useEffect(() => {
    const loadUserAndDB = async () => {
      try {
        // Purge une éventuelle clé API résiduelle du Keychain avant toute lecture,
        // au cas où l'app vient d'être réinstallée sur un appareil ayant déjà servi.
        await secureStorage.purgeIfStaleInstall();

        let loadedProfiles: User[];
        let loadedActiveId: string;

        const storedProfiles = await AsyncStorage.getItem(STORAGE_KEY_PROFILES);
        if (storedProfiles) {
          loadedProfiles = (JSON.parse(storedProfiles) as User[]).map(migrateLegacyUser);
          const storedActiveId = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
          loadedActiveId =
            storedActiveId && loadedProfiles.some((p) => p.id === storedActiveId)
              ? storedActiveId
              : loadedProfiles[0]?.id ?? DEFAULT_USER.id;
        } else {
          // Pas de liste de profils : soit une installation legacy mono-profil à
          // migrer, soit un tout premier lancement.
          const legacyStored = await AsyncStorage.getItem(STORAGE_KEY_USER_LEGACY);
          const singleUser = legacyStored
            ? migrateLegacyUser(JSON.parse(legacyStored) as User)
            : DEFAULT_USER;
          loadedProfiles = [singleUser];
          loadedActiveId = singleUser.id;
          // Écrit tout de suite le nouveau format — la clé legacy reste en place,
          // jamais réécrite, elle ne sert plus qu'à cette migration ponctuelle.
          await AsyncStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(loadedProfiles));
          await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, loadedActiveId);
        }

        setProfiles(loadedProfiles);
        setActiveProfileId(loadedActiveId);

        const database = await initDatabase();
        setDb(database);
      } catch (e) {
        log.error('[UserContext] Init error:', e);
        setProfiles([DEFAULT_USER]);
        setActiveProfileId(DEFAULT_USER.id);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndDB();
  }, []);

  const persistProfiles = useCallback(async (next: User[]) => {
    setProfiles(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(next));
    } catch (e) {
      log.warn('[UserContext] persistProfiles error:', e);
    }
  }, []);

  // Met à jour le profil ACTIF (et persiste toute la liste, pas juste ce profil).
  const updateUser = useCallback(
    async (partial: Partial<Omit<User, 'id'>>) => {
      if (!activeProfileId) return;
      const next = profiles.map((p) =>
        p.id === activeProfileId ? { ...p, ...partial, isOnboarded: true } : p
      );
      await persistProfiles(next);
    },
    [activeProfileId, profiles, persistProfiles]
  );

  // Ajoute un nouveau profil (ex: un deuxième enfant) — reprend l'audience/course du
  // build actuel (comme DEFAULT_USER), jamais celles d'un autre profil existant.
  const addProfile = useCallback(
    async (firstName: string) => {
      if (profiles.length >= MAX_PROFILES) {
        throw new Error(`Nombre maximum de profils atteint (${MAX_PROFILES}).`);
      }
      const newProfile: User = {
        id: `user_${Date.now()}`,
        firstName: firstName.trim(),
        audience: LOCKED_AUDIENCE || 'college',
        course: 'fr-en',
        isOnboarded: true,
      };
      await persistProfiles([...profiles, newProfile]);
      setActiveProfileId(newProfile.id);
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, newProfile.id);
      return newProfile;
    },
    [profiles, persistProfiles]
  );

  const switchProfile = useCallback(
    (id: string) => {
      if (!profiles.some((p) => p.id === id)) return;
      setActiveProfileId(id);
      AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, id).catch((e) =>
        log.warn('[UserContext] switchProfile persist error:', e)
      );
    },
    [profiles]
  );

  const acknowledgeProfilePicked = useCallback(() => {
    setHasPickedProfileThisSession(true);
  }, []);

  const user = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? profiles[0] ?? null,
    [profiles, activeProfileId]
  );

  const isOnboarded = user?.isOnboarded ?? false;
  const canAddProfile = profiles.length < MAX_PROFILES;

  const contextValue = useMemo(
    () => ({
      db,
      user,
      profiles,
      loading,
      isOnboarded,
      canAddProfile,
      hasPickedProfileThisSession,
      updateUser,
      addProfile,
      switchProfile,
      acknowledgeProfilePicked,
    }),
    [
      db,
      user,
      profiles,
      loading,
      isOnboarded,
      canAddProfile,
      hasPickedProfileThisSession,
      updateUser,
      addProfile,
      switchProfile,
      acknowledgeProfilePicked,
    ]
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
