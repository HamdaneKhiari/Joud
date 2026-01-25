/**
 * ============================================
 * THEME CONTEXT UNIFIÉ (100% White Label)
 * Version : Pilotage par la donnée (DB -> UI)
 * ============================================
 */

import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useUser } from '@/contexts/UserContext';
// On importe le type Branding depuis queries (qu'on a corrigé juste avant)
import { getBrandingById, type Branding } from '@/database/queries';
import { tokens, withOpacity } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

/**
 * Interface Identity complète (White Label)
 */
export interface Identity {
  id: string;

  // ✅ BRANDING (Couleurs + Textes spécifiques à l'IA)
  branding: {
    main: string;
    accent: string;
    surface?: string;
    primary: string;
    textOnMain: string;
    themeMode: 'light' | 'dark';
    headerAccent: string;
    
    // Champs pilotés par la DB pour l'IA
    aiTutorTitle: string;    
    aiTutorSubtitle: string; 
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
    primary: string;
    secondary: string;
    tertiary: string;
    onMain: string;
    onAccent: string;
  };

  themeMode: 'light' | 'dark';

  i18n: {
    locale: string;
    rtl: boolean;
  };

  icons: {
    logo: string;
    [key: string]: string;
  };

  iconSize: typeof tokens.iconSize;
}

interface ThemeContextType {
  identity: Identity;
  tokens: typeof tokens;
  currentApp: string; // Simplifié pour éviter l'alerte Sonar sur AppId
  isDark: boolean;
  isLoading: boolean;
  setAppIdentity: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// HELPERS
// ============================================

const parseJson = <T = any>(jsonStr?: string): T | undefined => {
  if (!jsonStr) return undefined;
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.warn('JSON parsing error:', e);
    return undefined;
  }
};

/**
 * MAPPING : Branding (DB) -> Identity (App)
 */
const brandingToIdentity = (branding: Branding): Identity => {
  // ✅ Correction : on force 'undefined' si le résultat est null
  const gradientColors = parseJson<[string, string, ...string[]]>(branding.ui_gradient_colors || undefined) || undefined;
  const aiSolutionBg = parseJson<string[]>(branding.ai_solution_bg || undefined) || ['#F3F4F6', '#F3F4F6'];
  const dailyWordGradient = parseJson<[string, string, ...string[]]>(branding.daily_word_gradient || undefined) || undefined;
  // Cast pour accéder aux nouvelles colonnes de façon sécurisée
  const b = branding as any;

  return {
    id: branding.id,

    branding: {
      main: branding.primary_color,
      accent: branding.accent_color,
      surface: branding.surface_color || undefined,
      primary: branding.primary_color,
      textOnMain: branding.text_on_main_color,
      themeMode: branding.theme_mode,
      headerAccent: branding.header_accent_color,
      // On pioche dans la DB ou fallback
      aiTutorTitle: b.ai_tutor_title || "AI Tutor",
      aiTutorSubtitle: b.ai_tutor_subtitle || "Ton assistant personnel",
    },

    ui: {
      hasGradient: branding.ui_has_gradient === 1,
      gradientColors,
      cardRadius: branding.ui_card_radius,
      showDecorativeShapes: branding.ui_show_decorative_shapes === 1,
    },

    ai: {
      accent: branding.ai_accent_color || branding.accent_color,
      error: branding.ai_error_color || '#F44336',
      solutionBg: aiSolutionBg,
    },

    header: {
      bg: branding.header_bg_color,
      accent: branding.header_accent_color,
      emoji: branding.header_emoji || '📚',
      welcomeText: branding.header_welcome_text || 'Bonjour,',
    },

    dailyWord: {
      bg: branding.daily_word_bg_color || undefined,
      gradient: dailyWordGradient,
      decoration: (branding.daily_word_decoration as any) || 'none',
    },

    dashboard: {
      levelProgress: branding.dashboard_level_progress_color,
    },

    text: {
      primary: b.text_primary_color || branding.primary_color,
      secondary: b.text_secondary_color || withOpacity(branding.primary_color, 0.6),
      tertiary: withOpacity(branding.primary_color, 0.4),
      onMain: branding.text_on_main_color,
      onAccent: branding.text_on_main_color,
    },

    themeMode: branding.theme_mode,
    i18n: { locale: 'fr', rtl: false },
    icons: { logo: branding.logo_name || 'school' },
    iconSize: tokens.iconSize,
  };
};

// ============================================
// DEFAULT IDENTITY
// ============================================

const defaultIdentity: Identity = {
  id: 'college',
  branding: {
    main: '#34495E',
    accent: '#FFD700',
    surface: '#FFFFFF',
    primary: '#34495E',
    textOnMain: '#FFFFFF',
    themeMode: 'light',
    headerAccent: '#FFD700',
    aiTutorTitle: "Tuteur IA",
    aiTutorSubtitle: "Aide aux devoirs",
  },
  ui: { hasGradient: false, cardRadius: 12, showDecorativeShapes: true },
  ai: { accent: '#34495E', error: '#D32F2F', solutionBg: ['#ECEFF1', '#CFD8DC'] },
  header: { bg: '#34495E', accent: '#FFD700', emoji: '📚', welcomeText: 'Bonjour !' },
  dailyWord: { bg: '#FFF9C4', decoration: 'none' },
  dashboard: { levelProgress: '#34495E' },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    onMain: '#FFFFFF',
    onAccent: '#000000',
  },
  themeMode: 'light',
  i18n: { locale: 'fr', rtl: false },
  icons: { logo: 'school' },
  iconSize: tokens.iconSize,
};

// ============================================
// PROVIDER
// ============================================

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const { db, user } = useUser();

  const [currentApp, setCurrentApp] = useState<string>(user?.audience || 'college');
  const [identity, setIdentity] = useState<Identity>(defaultIdentity);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIdentity = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const brandingData = await getBrandingById(db, currentApp);
        if (brandingData) {
          setIdentity(brandingToIdentity(brandingData));
        } else {
          setIdentity(defaultIdentity);
        }
      } catch (error) {
        console.error('Error loading branding identity:', error);
        setIdentity(defaultIdentity);
      } finally {
        setIsLoading(false);
      }
    };

    loadIdentity();
  }, [db, currentApp]);

  useEffect(() => {
    if (user?.audience && user.audience !== currentApp) {
      setCurrentApp(user.audience);
    }
  }, [user?.audience]);

  const isDark = useMemo(() => {
    if (identity.themeMode === 'dark') return true;
    if (identity.themeMode === 'light') return false;
    return systemColorScheme === 'dark';
  }, [identity.themeMode, systemColorScheme]);

  const value = useMemo(() => ({
    identity,
    tokens,
    currentApp,
    isDark,
    isLoading,
    setAppIdentity: (id: string) => setCurrentApp(id),
  }), [identity, currentApp, isDark, isLoading]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  return context;
};