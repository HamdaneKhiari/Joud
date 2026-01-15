/**
 * ============================================
 * THEME CONTEXT UNIFIÉ (100% White Label)
 * Version fusionnée : Design System + Dashboard + AI
 * ============================================
 */

import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { getBrandingById, type Branding } from '@/database/queries';
import { tokens, withOpacity } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

export type AppId = string;

/**
 * Interface Identity complète (White Label)
 * Contient TOUS les champs nécessaires : AI, Header, DailyWord, Dashboard, UI
 */
export interface Identity {
  id: string;

  // ✅ BRANDING (Couleurs principales + Alias pour compatibilité)
  branding: {
    // Couleurs principales
    main: string;           // Couleur principale
    accent: string;         // Couleur d'accent
    surface?: string;       // Couleur de surface (backgrounds)

    // Alias pour compatibilité Dashboard
    primary: string;        // Alias de 'main'
    textOnMain: string;     // Couleur du texte sur fond main
    themeMode: 'light' | 'dark'; // Mode clair/sombre

    // Alias pour compatibilité VocabularyScreen
    headerAccent: string;   // Alias de 'header.accent'
  };

  // ✅ UI (Comportements visuels)
  ui: {
    hasGradient: boolean;
    gradientColors?: [string, string, ...string[]];
    cardRadius: number;
    showDecorativeShapes: boolean;
  };

  // ✅ AI (Couleurs spécifiques à l'AI Assistant)
  ai: {
    accent: string;
    error: string;
    solutionBg: string[];
  };

  // ✅ HEADER (Configuration du header)
  header: {
    bg: string;
    accent: string;
    emoji: string;
    welcomeText: string;
  };

  // ✅ DAILY WORD (Widget mot du jour)
  dailyWord: {
    bg?: string;
    gradient?: [string, string, ...string[]];
    decoration: 'circles' | 'water-drop' | 'none';
  };

  // ✅ DASHBOARD (Couleurs spécifiques au Dashboard)
  dashboard: {
    levelProgress: string;
  };

  // ✅ TEXT (Couleurs de texte sémantiques - 100% White Label)
  text: {
    primary: string;    // Texte principal (headings, titres)
    secondary: string;  // Texte secondaire (descriptions, labels)
    tertiary: string;   // Texte tertiaire (hints, placeholders)
    onMain: string;     // Texte sur fond main
    onAccent: string;   // Texte sur fond accent
  };

  // ✅ THEME MODE (Mode global)
  themeMode: 'light' | 'dark';
}

interface ThemeContextType {
  identity: Identity;
  tokens: typeof tokens;
  currentApp: AppId;
  isDark: boolean;
  isLoading: boolean;
  setAppIdentity: (id: AppId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// HELPERS
// ============================================

/**
 * Parse JSON de manière sécurisée
 * Retourne undefined en cas d'erreur
 */
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
 * Transforme un objet Branding (DB) en Identity (App)
 * ✅ 100% White Label : zéro hardcoding de couleurs métier
 */
const brandingToIdentity = (branding: Branding): Identity => {
  // Parsing des arrays JSON
  const gradientColors = parseJson<[string, string, ...string[]]>(branding.ui_gradient_colors);
  const aiSolutionBg = parseJson<string[]>(branding.ai_solution_bg) || ['#F3F4F6', '#F3F4F6'];
  const dailyWordGradient = parseJson<[string, string, ...string[]]>(branding.daily_word_gradient);

  // Construction de l'identité
  const identity: Identity = {
    id: branding.id,

    branding: {
      // Couleurs principales
      main: branding.primary_color,
      accent: branding.accent_color,
      surface: branding.surface_color || undefined,

      // Alias pour compatibilité
      primary: branding.primary_color,
      textOnMain: branding.text_on_main_color,
      themeMode: branding.theme_mode,
      headerAccent: branding.header_accent_color, // ✅ Pour VocabularyScreen
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
      welcomeText: branding.header_welcome_text || 'Hello,',
    },

    dailyWord: {
      bg: branding.daily_word_bg_color || undefined,
      gradient: dailyWordGradient,
      decoration: branding.daily_word_decoration,
    },

    dashboard: {
      levelProgress: branding.dashboard_level_progress_color,
    },

    text: {
      // ✅ Couleurs sémantiques dérivées de primary_color (100% White Label)
      primary: branding.primary_color,
      secondary: withOpacity(branding.primary_color, 0.6),
      tertiary: withOpacity(branding.primary_color, 0.4),
      onMain: branding.text_on_main_color,
      onAccent: branding.text_on_main_color, // Assume même couleur pour texte sur accent
    },

    themeMode: branding.theme_mode,
  };

  return identity;
};

/**
 * Identité par défaut (fallback en cas d'erreur)
 * ⚠️ Filet de sécurité uniquement : toutes les couleurs métier doivent venir de la DB
 */
const defaultIdentity: Identity = {
  id: 'college',
  branding: {
    main: '#34495E',
    accent: '#FFD700',
    surface: '#F5F7FA',
    primary: '#34495E',
    textOnMain: '#FFFFFF',
    themeMode: 'light',
    headerAccent: '#FFD700',
  },
  ui: {
    hasGradient: false,
    cardRadius: 20,
    showDecorativeShapes: true,
  },
  ai: {
    accent: '#6366F1',
    error: '#EF4444',
    solutionBg: ['#F5F3FF', '#EDE9FE'],
  },
  header: {
    bg: '#34495E',
    accent: '#FFD700',
    emoji: '🚀',
    welcomeText: 'Ready,',
  },
  dailyWord: {
    bg: '#00D2FF',
    decoration: 'circles',
  },
  dashboard: {
    levelProgress: '#FFD700',
  },
  text: {
    primary: '#34495E',
    secondary: withOpacity('#34495E', 0.6),
    tertiary: withOpacity('#34495E', 0.4),
    onMain: '#FFFFFF',
    onAccent: '#FFFFFF',
  },
  themeMode: 'light',
};

// ============================================
// PROVIDER
// ============================================

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const { db, user } = useUser();

  // État pour l'application active (défaut depuis user.audience ou 'college')
  const [currentApp, setCurrentApp] = useState<AppId>(user?.audience || 'college');
  const [identity, setIdentity] = useState<Identity>(defaultIdentity);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement de l'identité depuis la DB
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

  // Synchronisation avec user.audience
  useEffect(() => {
    if (user?.audience && user.audience !== currentApp) {
      setCurrentApp(user.audience);
    }
  }, [user?.audience]);

  // Mode sombre (basé sur themeMode de l'identité ou système)
  const isDark = useMemo(() => {
    if (identity.themeMode === 'dark') return true;
    if (identity.themeMode === 'light') return false;
    return systemColorScheme === 'dark';
  }, [identity.themeMode, systemColorScheme]);

  // Objet de valeur mémorisé pour éviter les re-renders inutiles
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

// ============================================
// HOOK
// ============================================

/**
 * Hook personnalisé pour consommer le thème
 * Throw une erreur si utilisé hors du ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
};
