import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { getBrandingById, type Branding } from '@/database/queries';
import { tokens } from '@/themes/tokens';

// Typage des applications disponibles (dynamique depuis la DB)
export type AppId = string;

// Interface Identity transformée depuis Branding
export interface Identity {
  id: string;
  branding: {
    main: string;
    accent: string;
    surface?: string;
  };
  ui: {
    hasGradient: boolean;
    gradientColors?: [string, string, ...string[]];
    cardRadius: number;
    showDecorativeShapes: boolean;
  };
  ai: {
    accent: string;
    error: string;
    solutionBg: string[];
  };
  header: {
    bg: string;
    accent: string;
    emoji: string;
    welcomeText: string;
  };
  dailyWord: {
    bg?: string;
    gradient?: [string, string, ...string[]];
    decoration: 'circles' | 'water-drop' | 'none';
  };
  dashboard: {
    levelProgress: string;
  };
  text: {
    onMain: string;
  };
  themeMode: 'light' | 'dark';
}

interface ThemeContextType {
  identity: Identity;       // L'identité visuelle active
  tokens: typeof tokens;    // Les espacements et tailles fixes
  currentApp: AppId;        // L'ID de l'app actuelle
  isDark: boolean;          // État du mode sombre
  isLoading: boolean;      // État de chargement
  setAppIdentity: (id: AppId) => void; // Fonction pour switcher
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Fonction helper pour transformer Branding en Identity
const brandingToIdentity = (branding: Branding): Identity => {
  return {
    id: branding.id,
    branding: {
      main: branding.primary_color,
      accent: branding.accent_color,
      surface: branding.surface_color || undefined
    },
    ui: {
      hasGradient: branding.ui_has_gradient === 1,
      gradientColors: branding.ui_gradient_colors 
        ? JSON.parse(branding.ui_gradient_colors) as [string, string, ...string[]]
        : undefined,
      cardRadius: branding.ui_card_radius,
      showDecorativeShapes: branding.ui_show_decorative_shapes === 1
    },
    ai: {
      accent: branding.ai_accent_color || branding.accent_color,
      error: branding.ai_error_color || '#F44336',
      solutionBg: branding.ai_solution_bg 
        ? JSON.parse(branding.ai_solution_bg) as string[]
        : ['#F3F4F6', '#F3F4F6']
    },
    header: {
      bg: branding.header_bg_color,
      accent: branding.header_accent_color,
      emoji: branding.header_emoji || '📚',
      welcomeText: branding.header_welcome_text || 'Hello,'
    },
    dailyWord: {
      bg: branding.daily_word_bg_color || undefined,
      gradient: branding.daily_word_gradient
        ? JSON.parse(branding.daily_word_gradient) as [string, string, ...string[]]
        : undefined,
      decoration: branding.daily_word_decoration
    },
    dashboard: {
      levelProgress: branding.dashboard_level_progress_color
    },
    text: {
      onMain: branding.text_on_main_color
    },
    themeMode: branding.theme_mode
  };
};

// Fallback identity par défaut (en cas d'erreur de chargement)
const defaultIdentity: Identity = {
  id: 'college',
  branding: {
    main: '#34495E',
    accent: '#FFD700',
    surface: '#F5F7FA'
  },
  ui: {
    hasGradient: false,
    cardRadius: 20,
    showDecorativeShapes: true
  },
  ai: {
    accent: '#6366F1',
    error: '#EF4444',
    solutionBg: ['#F5F3FF', '#EDE9FE']
  },
  header: {
    bg: '#34495E',
    accent: '#FFD700',
    emoji: '🚀',
    welcomeText: 'Ready,'
  },
  dailyWord: {
    bg: '#00D2FF',
    decoration: 'circles'
  },
  dashboard: {
    levelProgress: '#FFD700'
  },
  text: {
    onMain: '#FFFFFF'
  },
  themeMode: 'light'
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const { db, user } = useUser();
  
  // 1. État pour l'application active (défaut depuis user.audience ou 'college')
  const [currentApp, setCurrentApp] = useState<AppId>(user?.audience || 'college');
  const [identity, setIdentity] = useState<Identity>(defaultIdentity);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Chargement de l'identité depuis la DB
  useEffect(() => {
    const loadIdentity = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const branding = await getBrandingById(db, currentApp);
        
        if (branding) {
          setIdentity(brandingToIdentity(branding));
        } else {
          console.warn(`Branding not found for identity: ${currentApp}, using default`);
          setIdentity(defaultIdentity);
        }
      } catch (error) {
        console.error('Error loading branding:', error);
        setIdentity(defaultIdentity);
      } finally {
        setIsLoading(false);
      }
    };

    loadIdentity();
  }, [db, currentApp]);

  // 3. Synchronisation avec user.audience
  useEffect(() => {
    if (user?.audience && user.audience !== currentApp) {
      setCurrentApp(user.audience);
    }
  }, [user?.audience]);

  // 4. Mode sombre (basé sur themeMode de l'identité ou système)
  const isDark = useMemo(() => {
    if (identity.themeMode === 'dark') return true;
    if (identity.themeMode === 'light') return false;
    return systemColorScheme === 'dark';
  }, [identity.themeMode, systemColorScheme]);

  // 5. Objet de valeur mémorisé pour éviter les re-renders inutiles
  const value = useMemo(() => ({
    identity,
    tokens,
    currentApp,
    isDark,
    isLoading,
    setAppIdentity: (id: AppId) => setCurrentApp(id),
  }), [identity, currentApp, isDark, isLoading]);

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
