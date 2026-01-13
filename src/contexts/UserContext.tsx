import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { initDatabase } from '@/database/init';

// Typage de l'utilisateur basé sur tes besoins Dashboard
interface User {
  id: string;
  firstName: string;
  audience: 'primary' | 'college' | 'lycee' | 'adult';
  lastActivity?: string;
}

interface UserContextType {
  db: SQLiteDatabase | null;
  user: User | null;
  loading: boolean;
  updateAudience: (newAudience: User['audience']) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Utilisateur simulé (à remplacer plus tard par un vrai système d'auth)
  const [user, setUser] = useState<User | null>({
    id: 'user_01',
    firstName: 'Alex',
    audience: 'college', // Valeur par défaut
  });

  // 2. Initialisation de la base de données au démarrage
  useEffect(() => {
    const setup = async () => {
      try {
        const database = await initDatabase(); // Initialise janacore.db
        setDb(database);
      } catch (e) {
        console.error("Erreur initialisation DB:", e);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, []);

  // Note: La synchronisation du thème se fait maintenant dans ThemeContext

  // Fonction pour changer l'audience (utile pour tes tests)
  const updateAudience = (newAudience: User['audience']) => {
    setUser(prev => prev ? { ...prev, audience: newAudience } : null);
  };

  // Mémoïsation de la value pour éviter les re-renders inutiles
  const contextValue = useMemo(
    () => ({ db, user, loading, updateAudience }),
    [db, user, loading]
  );

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