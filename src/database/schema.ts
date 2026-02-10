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
  content_type:
    | 'word'        // Vocabulaire
    | 'rule'        // Règles de grammaire
    | 'sentence'    // Phrases types
    | 'dialogue'    // Dialogues
    | 'logic'       // Exercices logiques
    | 'fusion'      // Fusion de phrases
    | 'rephrasing'  // Reformulation
    // WordGames types
    | 'definition'  // Jeu de définitions
    | 'blanks'      // Phrases à trous
    | 'speed'       // Speed match
    | 'detective'   // Trouver l'erreur
    | 'idioms'      // Expressions idiomatiques
    | 'syntax'      // Syntax master
    | 'sentence_blanks'  // Phrases à trous (phrase_types)
    | 'reading_passage'  // Passages de lecture
    | 'grammar_rule'     // Règles de grammaire
    // Assessment types
    | 'assessment_definition'  // Assessment choix multiples
    | 'assessment_blanks'      // Assessment input texte
    | 'assessment_sentence'    // Assessment avec passage
    | 'assessment_question';   // Assessment question générale
  data: string; // JSON stringifié
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string;
  target_audience?: 'primary' | 'college' | 'lycee' | 'adult' | 'all'; // Nouveau champ
}

export interface Progress {
  id?: number;
  user_id: string;
  family_id: number;
  subfamily_id: number; // 0 = pas de sous-famille
  level: number;
  completed: number;
  total: number;
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
  ui_card_mood: 'bubbly' | 'playful' | 'minimal' | 'executive';
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
  subfamily_id: number; // 0 = pas de sous-famille
  level: number;
  family_name: string;
  icon: string | null;
  progress: number;
  timestamp: number;
}

// ============================================
// FEEDBACK MESSAGES (White Label)
// ============================================

export interface FeedbackMessage {
  id?: number;
  identity_id: 'primary' | 'college' | 'lycee' | 'adult';
  context: 'exercise' | 'wordgames' | 'vocabulary' | 'assessment';
  state: 'correct' | 'incorrect_attempt_1' | 'incorrect_attempt_2' | 'skip';
  icon?: string;
  title: string;
  message: string;
}

// ============================================
// DASHBOARD DATA
// ============================================

export interface DailyWord {
  id?: number;
  identity_id: 'primary' | 'college' | 'lycee' | 'adult';
  level: number;
  english: string;
  french: string;
  emoji?: string;
  date?: string; // YYYY-MM-DD
  category?: 'vocabulary' | 'idiom' | 'expression';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UserBadge {
  id?: number;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_icon?: string;
  earned_date: string;
  progress: number;
}

export interface SpacedRepetition {
  id?: number;
  user_id: string;
  content_id: number;
  content_type: 'word' | 'rule' | 'sentence';
  last_review_date?: string;
  next_review_date?: string;
  ease_factor: number;
  review_count: number;
  correct_count: number;
}

export interface UserMetrics {
  id?: number;
  user_id: string;
  words_learned: number;
  exercises_completed: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  total_time_minutes: number;
  updated_at?: string;
}