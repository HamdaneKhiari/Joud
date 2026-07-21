/**
 * ============================================
 * DATABASE SERVICE INDEX
 * Point d'entrée unique pour la persistance
 * ✅ Plus d'UI ici, uniquement de la donnée.
 * ============================================
 */

// ============================================
// EXPORTS FONCTIONS
// ============================================

export { initDatabase } from './init';
export * as queries from './queries';

// ============================================
// EXPORTS TYPES (Complet avec White Label)
// ============================================

export type {
  // Types de base
  Module,
  Family,
  Content,
  Progress,
  Level,
  
  // Types White Label
  Branding,
  ModuleLabel,
  LevelLabel,
  IdentityPalette,
  ModuleAvailability,
  ActivityLog
} from './schema';
