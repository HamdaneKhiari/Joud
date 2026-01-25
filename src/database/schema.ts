// src/database/schema.ts

// ============================================
// TYPES DE BASE
// ============================================

export interface Module {
  id: number;
  name: string;
  slug: string;
  is_core: number; // 0 ou 1 (SQLite)
  target_audience: 'primary' | 'college' | 'lycee' | 'adult' | 'all';
  icon: string;
  order_index: number;
  description: string;
  display_title?: string;
  display_description?: string;
  icon_name?: string;
}

export interface Family {
  id?: number;
  module_slug: string; // ✅ CORRIGÉ : Remplace module_id (INTEGER) par module_slug (TEXT)
  name: string;
  icon?: string;
  emoji?: string;
  description?: string;
  order_index: number;
}

export interface Content {
  id?: number;
  family_id: number;
  level: number;
  content_type: 'word' | 'rule' | 'sentence' | 'dialogue' | 'logic' | 'fusion' | 'rephrasing'; // ✅ CORRIGÉ : Ajout des types manquants
  data: string; // JSON stringifié
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string;
}

export interface Progress {
  id?: number;
  user_id: string;
  family_id: number;
  level: number;
  completed: number;
  score: number;
  last_accessed?: string;
}

export interface Level {
  id?: number;
  level: number;
  title: string;
  icon: string;
  description: string;
  badge: string;
  target_audience: 'primary' | 'college' | 'lycee' | 'adult' | 'all';
  difficulty?: 'easy' | 'medium' | 'hard';
  display_title?: string;
  display_description?: string;
  icon_name?: string;
}

// ============================================
// TYPES WHITE LABEL (Centralisés depuis queries.ts)
// ============================================

export interface Branding {
  id: string;
  primary_color: string;
  accent_color: string;
  surface_color: string | null;
  logo_name: string | null;
  theme_mode: 'light' | 'dark';
  ui_has_gradient: number;
  ui_gradient_colors: string | null;
  ui_card_radius: number;
  ui_show_decorative_shapes: number;
  ai_accent_color: string | null;
  ai_error_color: string | null;
  ai_solution_bg: string | null;
  header_bg_color: string;
  header_accent_color: string;
  header_emoji: string | null;
  header_welcome_text: string | null;
  daily_word_bg_color: string | null;
  daily_word_gradient: string | null;
  daily_word_decoration: 'circles' | 'water-drop' | 'none';
  dashboard_level_progress_color: string;
  text_on_main_color: string;
  text_primary_color: string | null;
  text_secondary_color: string | null;
  ai_tutor_title: string | null;
  ai_tutor_subtitle: string | null;
}

export interface ModuleLabel {
  id?: number;
  module_slug: string;
  identity_id: string;
  display_title: string;
  display_description: string;
  icon_name: string;
}

export interface LevelLabel {
  id?: number;
  level_number: number;
  identity_id: string;
  display_title: string;
  badge_text: string;
  display_description: string;
}

export interface IdentityPalette {
  id?: number;
  identity_id: string;
  color_index: number;
  color_value: string;
}

export interface ModuleAvailability {
  id?: number;
  module_slug: string;
  identity_id: string;
  level_number: number | null;
  is_available: number; // 0 ou 1 (SQLite)
}

export interface ActivityLog {
  id?: number;
  module_slug: string;
  family_id: number;
  level: number;
  family_name: string;
  icon: string | null;
  progress: number;
  timestamp: number;
}