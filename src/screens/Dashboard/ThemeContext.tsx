import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '../../contexts/UserContext';

// ============================================
// TYPES (Reflète la structure exacte de la DB)
// ============================================

export interface BrandingConfig {
  id: string;
  primary_color: string;
  accent_color: string;
  surface_color?: string;
  logo_name?: string;
  theme_mode?: 'light' | 'dark';
  
  // UI Props
  ui_has_gradient: number;
  ui_gradient_colors?: string; // JSON string
  ui_card_radius: number;
  ui_show_decorative_shapes: number;
  
  // AI Props
  ai_accent_color?: string;
  ai_error_color?: string;
  ai_solution_bg?: string; // JSON string
  
  // Header Props
  header_bg_color: string;
  header_accent_color: string;
  header_emoji?: string;
  header_welcome_text?: string;
  
  // Daily Word Props
  daily_word_bg_color?: string;
  daily_word_gradient?: string; // JSON string
  daily_word_decoration?: string;
  
  // Dashboard Props
  dashboard_level_progress_color: string;
  text_on_main_color: string;
}

// ============================================
// INTERFACE IDENTITÉ (Utilisée dans l'App)
// ============================================

export interface Identity {
  id: string;
  branding: {
    main: string;      // Mapped from primary_color
    accent: string;    // Mapped from accent_color
    surface?: string;  // Mapped from surface_color
    logo?: string;
    mode: 'light' | 'dark';
    
    // Nouveaux champs (snake_case conservé pour correspondre à la DB et Dashboard.tsx)
    header_bg_color: string;
    header_accent_color: string;
    header_emoji?: string;
    header_welcome_text?: string;
    
    daily_word_bg_color?: string;
    daily_word_gradient?: string[]; // Parsé
    daily_word_decoration?: string;
    
    dashboard_level_progress_color: string;
    text_on_main_color: string;
    
    ai: {
      accent?: string;
      error?: string;
      solutionBg?: string[]; // Parsé
    };
  };
  ui: {
    hasGradient: boolean;
    gradientColors?: string[]; // Parsé
    cardRadius: number;
    showDecorativeShapes: boolean;
  };
}

// Tokens de design system (espacements, typos...)
export const tokens = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  fontSize: { xs: 12, sm: 14, base: 16, lg: 20, xl: 24, xxl: 32 },
  borderRadius: { sm: 8, md: 12, lg: 24, round: 999 },
};

interface ThemeContextType {
  identity: Identity;
  currentApp: string;
  setAppIdentity: (appId: string) => Promise<void>;
  tokens: typeof tokens;
  isLoading: boolean;
}

const defaultIdentity: Identity = {
  id: 'default',
  branding: {
    main: '#34495E',
    accent: '#FFD700',
    surface: '#FFFFFF',
    mode: 'light',
    header_bg_color: '#34495E',
    header_accent_color: '#FFD700',
    dashboard_level_progress_color: '#FFD700',
    text_on_main_color: '#FFFFFF',
    ai: {}
  },
  ui: {
    hasGradient: false,
    cardRadius: 12,
    showDecorativeShapes: false
  }
};

const ThemeContext = createContext<ThemeContextType>({
  identity: defaultIdentity,
  currentApp: 'college',
  setAppIdentity: async () => {},
  tokens,
  isLoading: true,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { db, user } = useUser();
  const [identity, setIdentity] = useState<Identity>(defaultIdentity);
  const [currentApp, setCurrentApp] = useState('college');
  const [isLoading, setIsLoading] = useState(true);

  const loadIdentity = async (appId: string) => {
    if (!db) return;
    
    try {
      setIsLoading(true);
      // SELECT * récupère toutes les colonnes définies dans BrandingConfig
      const result = await db.getFirstAsync<BrandingConfig>(
        `SELECT * FROM branding WHERE id = ?`,
        [appId]
      );

      if (result) {
        // Parsing sécurisé des JSON arrays
        const parseJson = (jsonStr?: string) => {
          try { return jsonStr ? JSON.parse(jsonStr) : undefined; } 
          catch (e) { return undefined; }
        };

        const newIdentity: Identity = {
          id: result.id,
          branding: {
            main: result.primary_color,
            accent: result.accent_color,
            surface: result.surface_color,
            logo: result.logo_name,
            mode: result.theme_mode || 'light',
            
            // Mapping direct des nouvelles colonnes
            header_bg_color: result.header_bg_color,
            header_accent_color: result.header_accent_color,
            header_emoji: result.header_emoji,
            header_welcome_text: result.header_welcome_text,
            
            daily_word_bg_color: result.daily_word_bg_color,
            daily_word_gradient: parseJson(result.daily_word_gradient),
            daily_word_decoration: result.daily_word_decoration,
            
            dashboard_level_progress_color: result.dashboard_level_progress_color,
            text_on_main_color: result.text_on_main_color,

            ai: {
                accent: result.ai_accent_color,
                error: result.ai_error_color,
                solutionBg: parseJson(result.ai_solution_bg)
            }
          },
          ui: {
            // Mapping des propriétés UI vers l'objet 'ui'
            hasGradient: !!result.ui_has_gradient,
            gradientColors: parseJson(result.ui_gradient_colors),
            cardRadius: result.ui_card_radius,
            showDecorativeShapes: !!result.ui_show_decorative_shapes
          }
        };
        setIdentity(newIdentity);
        setCurrentApp(appId);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (db && user) {
        const targetIdentity = user.audience || 'college';
        loadIdentity(targetIdentity);
    } else if (db) {
        loadIdentity('college');
    }
  }, [db, user]);

  return (
    <ThemeContext.Provider value={{ identity, currentApp, setAppIdentity: loadIdentity, tokens, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);