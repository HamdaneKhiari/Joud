/**
 * ============================================
 * THEME CONTEXT UNIFIÉ (100% White Label)
 * Version : Pilotage par la donnée (DB -> UI)
 * ============================================
 */

import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { queries, type Branding } from '@/database';
import { tokens, withOpacity } from '@/themes/tokens';
import { log } from '@/utils/logUtils';

// ============================================
// TYPES
// ============================================

/**
 * Interface Identity complète (White Label)
 */
export interface Identity {
  id: string;
  themeMode: 'light' | 'dark';
  organizationName: string; // Nom de l'organisation/client (ex: "Joud Primaire", "Joud Collège")

  // Palette de couleurs de base de l'identité
  palette: {
    primary: string;
    accent: string;
    surface: string;
    background: string; // Fond général de l'app (plus clair que surface)
  };

  // Couleurs de texte pour différents contextes
  text: {
    primary: string;   // Pour les titres principaux
    secondary: string; // Pour les sous-titres, descriptions
    tertiary: string;  // Pour les textes d'aide, désactivés
    onPrimary: string; // Texte sur un fond de couleur primaire (boutons, etc.)
  };

  // Styles globaux de l'interface utilisateur
  ui: {
    cardRadius: number;
    showDecorativeShapes: boolean;
    mood: 'playful' | 'clean'; // Binary mood for most components: playful (centered) vs clean (left-aligned)
    cardStyle: 'bubbly' | 'playful' | 'minimal' | 'executive'; // 4-way card differentiation for FlowCard
  };

  // Configurations spécifiques aux composants
  header: {
    background: string | [string, string, ...string[]];
    accent: string;
    emoji: string;
    welcomeText: string;
  };

  dailyWord: {
    background: string | [string, string, ...string[]];
    decoration: 'circles' | 'water-drop' | 'none';
  };

  aiTutor: {
    title: string;
    subtitle: string;
  };

  aiDiagnostic: {
    accent: string;
    error: string;
    solutionBackground: [string, string, ...string[]];
  };

  dashboard: {
    levelProgress: string;
  };

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
    log.warn('JSON parsing error:', e);
    return undefined;
  }
};

/**
 * Helper : Nom d'organisation selon l'identité
 */
const getOrganizationName = (identityId: string): string => {
  switch (identityId) {
    case 'primary':
      return 'Joud Primaire';
    case 'college':
      return 'Joud Collège';
    case 'lycee':
      return 'Joud Lycée';
    case 'adult':
      return 'Joud Adulte';
    default:
      return 'Joud';
  }
};

/**
 * MAPPING : Branding (DB) -> Identity (App)
 */
const brandingToIdentity = (branding: Branding): Identity => {
  const headerGradient = parseJson<[string, string, ...string[]]>(branding.ui_gradient_colors || undefined);
  const dailyWordGradient = parseJson<[string, string, ...string[]]>(branding.daily_word_gradient || undefined);
  const aiSolutionBg = parseJson<[string, string, ...string[]]>(branding.ai_solution_bg || undefined);

  const isDark = branding.theme_mode === 'dark';

  return {
    id: branding.id,
    themeMode: branding.theme_mode,
    organizationName: getOrganizationName(branding.id),

    palette: {
      primary: branding.primary_color,
      accent: branding.accent_color,
      surface: branding.surface_color || (isDark ? '#1F2937' : '#FFFFFF'),
      background: isDark ? '#162438' : '#F9FAFB', // Dark: soft navy (pas noir)
    },

    text: {
      primary: branding.text_primary_color || (isDark ? '#FFFFFF' : '#1F2937'),
      secondary: branding.text_secondary_color || (isDark ? '#9CA3AF' : '#6B7280'),
      tertiary: isDark ? '#4B5563' : '#D1D5DB',
      onPrimary: branding.text_on_main_color,
    },

    ui: {
      cardRadius: branding.ui_card_radius,
      showDecorativeShapes: branding.ui_show_decorative_shapes === 1,
      mood: (branding.ui_card_mood === 'bubbly' || branding.ui_card_mood === 'playful') ? 'playful' : 'clean',
      cardStyle: branding.ui_card_mood,
    },

    header: {
      background: headerGradient || branding.header_bg_color,
      accent: branding.header_accent_color,
      emoji: branding.header_emoji || '📚',
      welcomeText: branding.header_welcome_text || 'Bonjour,',
    },

    dailyWord: {
      background: dailyWordGradient || branding.daily_word_bg_color || 'transparent',
      decoration: branding.daily_word_decoration,
    },

    aiTutor: {
      title: branding.ai_tutor_title || "Tuteur IA",
      subtitle: branding.ai_tutor_subtitle || "Ton assistant personnel",
    },

    aiDiagnostic: {
      accent: branding.ai_accent_color || branding.accent_color,
      error: branding.ai_error_color || '#F44336',
      solutionBackground: aiSolutionBg || [withOpacity(branding.primary_color, 0.1), withOpacity(branding.primary_color, 0.05)],
    },

    dashboard: {
      levelProgress: branding.dashboard_level_progress_color,
    },

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
  themeMode: 'light',
  organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    onPrimary: '#FFFFFF',
  },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
  header: { background: '#34495E', accent: '#FFD700', emoji: '📚', welcomeText: 'Bonjour !' },
  dailyWord: { background: '#FFF9C4', decoration: 'none' },
  aiTutor: { title: "Tuteur IA", subtitle: "Aide aux devoirs" },
  aiDiagnostic: { accent: '#34495E', error: '#D32F2F', solutionBackground: ['#ECEFF1', '#CFD8DC'] },
  dashboard: { levelProgress: '#34495E' },
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
      if (!db || typeof db === 'number') {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const brandingData = await queries.getBrandingById(db, currentApp);
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