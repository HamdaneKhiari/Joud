/**
 * ============================================
 * DÉPRÉCIÉ - Utilisez @/database/schema à la place
 * ============================================
 * Ce fichier est conservé pour compatibilité arrière mais
 * tous les nouveaux imports doivent utiliser @/database/schema
 */

export interface Module {
  id: number;
  name: string;
  slug: string;
  is_core: number; // 0 or 1
  target_audience: string;
  icon?: string;
  order_index?: number;
  description?: string;
}

export interface Family {
  id: number;
  module_slug: string; // ✅ CORRIGÉ : module_slug (TEXT) au lieu de module_id (INTEGER)
  name: string;
  icon?: string;
  emoji?: string;
  description?: string;
  order_index?: number;
}
