import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

// Import des identités (Fichiers à créer/mettre à jour dans @/themes/identities)
import { 
  Identity, 
  primaryIdentity, 
  collegeIdentity, 
  lyceeIdentity, 
  adultIdentity 
} from '@/themes/identities';
import { tokens } from '@/themes/tokens';

// Typage des applications disponibles
export type AppId = 'primary' | 'college' | 'lycee' | 'adult';

interface ThemeContextType {
  identity: Identity;       // L'identité visuelle active
  tokens: typeof tokens;    // Les espacements et tailles fixes
  currentApp: AppId;        // L'ID de l'app actuelle
  isDark: boolean;          // État du mode sombre
  setAppIdentity: (id: AppId) => void; // Fonction pour switcher
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  
  // 1. État pour l'application active (College par défaut)
  const [currentApp, setCurrentApp] = useState<AppId>('college');

  // 2. Détermination de l'identité selon l'AppId
  const identity = useMemo(() => {
    switch (currentApp) {
      case 'primary':
        return primaryIdentity;
      case 'lycee':
        return lyceeIdentity;
      case 'adult':
        return adultIdentity;
      case 'college':
      default:
        return collegeIdentity;
    }
  }, [currentApp]);

  // 3. Mode sombre
  const isDark = systemColorScheme === 'dark';

  // 4. Objet de valeur mémorisé pour éviter les re-renders inutiles
  const value = useMemo(() => ({
    identity,
    tokens,
    currentApp,
    isDark,
    setAppIdentity: (id: AppId) => setCurrentApp(id),
  }), [identity, currentApp, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour consommer le thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
};