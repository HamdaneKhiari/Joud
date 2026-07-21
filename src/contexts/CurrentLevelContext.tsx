import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { log } from '@/utils/logUtils';

interface CurrentLevelContextType {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  levelLabel: string;
}

const STORAGE_KEY = 'JOUD_CURRENT_LEVEL';

const CurrentLevelContext = createContext<CurrentLevelContextType | undefined>(undefined);

export const CurrentLevelProvider = ({ children }: { children: ReactNode }) => {
  const { db, user } = useUser();
  const [currentLevel, setCurrentLevelState] = useState<number>(1);

  // Charger le niveau persisté au démarrage
  useEffect(() => {
    const loadLevel = async () => {
      try {
        // 1. Essayer AsyncStorage d'abord
        const storedLevel = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedLevel) {
          const parsed = parseInt(storedLevel, 10);
          if (parsed >= 1 && parsed <= 4) {
            setCurrentLevelState(parsed);
            return;
          }
        }

        // 2. Fallback : déduire depuis la dernière activité en DB
        if (db) {
          const lastActivity = await db.getFirstAsync<{ level: number }>(
            `SELECT level FROM activity_log ORDER BY timestamp DESC LIMIT 1`
          );
          if (lastActivity?.level && lastActivity.level >= 1 && lastActivity.level <= 4) {
            setCurrentLevelState(lastActivity.level);
            await AsyncStorage.setItem(STORAGE_KEY, String(lastActivity.level));
            return;
          }
        }
      } catch (e) {
        log.warn('[CurrentLevelContext] Error loading level:', e);
      }
    };

    loadLevel();
  }, [db, user]);

  // Setter avec persistance
  const setCurrentLevel = useCallback(async (level: number) => {
    if (level < 1 || level > 4) return;
    setCurrentLevelState(level);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(level));
    } catch (e) {
      log.warn('[CurrentLevelContext] Error saving level:', e);
    }
  }, []);

  const levelLabel = `Level ${currentLevel}`;

  return (
    <CurrentLevelContext.Provider
      value={{
        currentLevel,
        setCurrentLevel,
        levelLabel,
      }}
    >
      {children}
    </CurrentLevelContext.Provider>
  );
};

export const useCurrentLevel = () => {
  const context = useContext(CurrentLevelContext);
  if (!context) {
    throw new Error('useCurrentLevel must be used within CurrentLevelProvider');
  }
  return context;
};
