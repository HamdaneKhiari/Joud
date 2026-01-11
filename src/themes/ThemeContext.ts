import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
// On importe nos identités et nos tokens
import { Identity, collegeIdentity, lyceeIdentity } from '@/themes/identities';
import { tokens } from '@/themes/tokens';

// Le contrat de ce que le Context fournit à toute l'app
interface ThemeContextType {
  identity: Identity;       // L'identité active (College, Lycee, etc.)
  tokens: typeof tokens;    // Les mesures (spacing, fontSize)
  isDark: boolean;
  setAppIdentity: (id: 'college' | 'lycee') => void; // Pour switcher d'app à la volée
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  
  // 1. État pour savoir quelle application est active
  const [currentApp, setCurrentApp] = useState<'college' | 'lycee'>('college');

  // 2. Déterminer l'identité selon l'app choisie
  const identity = useMemo(() => {
    return currentApp === 'college' ? collegeIdentity : lyceeIdentity;
  }, [currentApp]);

  // 3. Gestion du Dark Mode (on pourra l'affiner plus tard)
  const isDark = systemColorScheme === 'dark';

  const value = useMemo(() => ({
    identity,
    tokens,
    isDark,
    setAppIdentity: (id: 'college' | 'lycee') => setCurrentApp(id),
  }), [identity, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pour utiliser le thème partout
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};