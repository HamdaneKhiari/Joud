/**
 * Fichier centralisant les types de données correspondant au schéma de la base de données SQLite.
 * Assure la cohérence du typage à travers toute l'application.
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
  module_id: number;
  name: string;
  icon?: string;
  emoji?: string;
  description?: string;
  order_index?: number;
}