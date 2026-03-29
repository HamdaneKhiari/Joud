/* eslint-disable no-console */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { initDatabase } from '../init';

interface DatabaseContextData {
  db: SQLiteDatabase | null;
  isDbReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextData>({
  db: null,
  isDbReady: false,
});

/**
 * Hook pour accéder à la base de données depuis n'importe quel composant.
 * Lèvera une erreur si utilisé en dehors du DatabaseProvider.
 */
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
  loadingFallback?: ReactNode; // Composant à afficher pendant le chargement
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children, loadingFallback = null }) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        const dbInstance = await initDatabase();
        setDb(dbInstance);
        setIsDbReady(true);
        console.log('✅ Database is ready and provided to the app context.');
      } catch (e) {
        console.error('❌ Failed to initialize and provide database', e);
      }
    };

    setupDatabase();
  }, []);

  // N'affiche pas les enfants tant que la DB n'est pas prête
  return isDbReady ? (
    <DatabaseContext.Provider value={{ db, isDbReady }}>{children}</DatabaseContext.Provider>
  ) : (loadingFallback);
};