// src/database/schema.ts

export interface Module {
  id: number;
  name: string;
  is_core: number; // 0 ou 1 (SQLite)
  target_audience: 'primary' | 'college' | 'lycee' | 'adult' | 'all';
  icon: string;
  order_index: number;
  description: string;
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
}