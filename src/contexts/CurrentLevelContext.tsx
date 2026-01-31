/**
 * ============================================
 * CURRENT LEVEL CONTEXT
 * Gestion du niveau actuel de l'utilisateur
 * ============================================
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';

// ============================================
// TYPES
// ============================================

interface CurrentLevelContextType {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  levelLabel: string;
}

// ============================================
// CONTEXT
// ============================================

const CurrentLevelContext = createContext<CurrentLevelContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export const CurrentLevelProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // Synchroniser avec le niveau utilisateur
  useEffect(() => {
    // TODO: Récupérer le niveau actuel depuis la DB ou user profile
    // Pour l'instant, on utilise un niveau par défaut
    setCurrentLevel(1);
  }, [user]);

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

// ============================================
// HOOK
// ============================================

export const useCurrentLevel = () => {
  const context = useContext(CurrentLevelContext);
  if (!context) {
    throw new Error('useCurrentLevel must be used within CurrentLevelProvider');
  }
  return context;
};
