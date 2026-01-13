// src/database/schema.ts

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
  module_id: number;
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
  content_type: 'word' | 'rule' | 'sentence' | 'dialogue' | 'connector';
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

// White Label Interfaces
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
}