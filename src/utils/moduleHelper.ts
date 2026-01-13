/**
 * Module Helper - Gestion des modules spéciaux et logique métier
 */

import type { Identity } from '@/themes/identities';
import type { ModuleId } from './labelMapper';

// ============================================
// MODULES SPÉCIAUX
// ============================================

/**
 * Modules exclusifs au Lycée
 */
export const LYCEE_EXCLUSIVE_MODULES: ModuleId[] = ['connector'];

/**
 * Modules exclusifs à Adult
 */
export const ADULT_EXCLUSIVE_MODULES: ModuleId[] = ['fast_vocab', 'expressions'];

/**
 * Modules disponibles uniquement pour le niveau Bonus Adult (niveau 7)
 */
export const ADULT_BONUS_MODULES: ModuleId[] = ['vocab', 'phrase_types'];

/**
 * Modules de base disponibles pour toutes les identités
 */
export const BASE_MODULES: ModuleId[] = [
  'vocab',
  'grammar',
  'phrase_types',
  'reading',
  'dialogues',
  'word_games',
  'assessment'
];

// ============================================
// HELPERS
// ============================================

// Palettes de couleurs définies par identité
const IDENTITY_PALETTES: Record<string, string[]> = {
  primary: [
    '#FF5722', // Rouge-orange
    '#FFCE00', // Jaune
    '#4CAF50', // Vert
    '#2196F3', // Bleu
    '#9C27B0', // Violet
    '#FF9800', // Orange
    '#E91E63'  // Rose
  ],
  college: [
    '#34495E', // Bleu nuit
    '#FFD700', // Or
    '#3498DB', // Bleu
    '#E74C3C', // Rouge
    '#9B59B6', // Violet
    '#F39C12', // Orange
    '#1ABC9C'  // Turquoise
  ],
  lycee: [
    '#00E5FF', // Cyan
    '#1A1A1A', // Noir
    '#2C3E50', // Gris foncé
    '#00BCD4', // Cyan clair
    '#0097A7', // Cyan foncé
    '#006064', // Cyan très foncé
    '#00ACC1'  // Cyan moyen
  ],
  adult: [
    '#111827', // Noir
    '#374151', // Gris foncé
    '#4B5563', // Gris
    '#6B7280', // Gris moyen
    '#9CA3AF', // Gris clair
    '#D1D5DB', // Gris très clair
    '#1F2937'  // Gris très foncé
  ]
};

/**
 * Vérifie si un module est exclusif à une identité
 */
export const isModuleExclusive = (
  moduleId: ModuleId | string,
  identity: Identity
): boolean => {
  if (identity.id === 'lycee') {
    return LYCEE_EXCLUSIVE_MODULES.includes(moduleId as ModuleId);
  }
  if (identity.id === 'adult') {
    return ADULT_EXCLUSIVE_MODULES.includes(moduleId as ModuleId);
  }
  return false;
};

/**
 * Vérifie si c'est le niveau bonus Adult
 */
export const isAdultBonusLevel = (identity: Identity, levelId: number): boolean => {
  return identity.id === 'adult' && levelId === 7;
};

/**
 * Récupère la couleur d'un module selon l'identité
 * (Basé sur l'ordre des modules dans la liste)
 */
export const getModuleColor = (
  moduleId: ModuleId | string,
  identity: Identity
): string => {
  // Mapping des modules vers un index
  const moduleIndex: Record<string, number> = {
    vocab: 0,
    fast_vocab: 0,
    grammar: 1,
    phrase_types: 2,
    connector: 2,
    expressions: 2,
    reading: 3,
    dialogues: 4,
    word_games: 5,
    assessment: 6
  };

  const colors = IDENTITY_PALETTES[identity.id];
  const index = moduleIndex[moduleId] ?? 0;

  return colors[index] || identity.branding.main;
};

/**
 * Récupère l'icône d'un module
 */
export const getModuleIcon = (moduleId: ModuleId | string): string => {
  const icons: Record<string, string> = {
    vocab: 'book-alphabet',
    fast_vocab: 'flash',
    grammar: 'format-list-bulleted',
    phrase_types: 'format-quote-close',
    reading: 'text-box',
    dialogues: 'chat',
    word_games: 'gamepad-variant',
    connector: 'connection',
    expressions: 'format-quote-open',
    assessment: 'clipboard-check'
  };

  return icons[moduleId] || 'book';
};

/**
 * Vérifie si un niveau existe pour une identité
 */
export const isValidLevel = (identity: Identity, levelId: number): boolean => {
  if (identity.id === 'adult') {
    return levelId >= 1 && levelId <= 7; // Adult a 7 niveaux
  }
  return levelId >= 1 && levelId <= 4; // Autres ont 4 niveaux
};

/**
 * Récupère le nombre maximum de niveaux pour une identité
 */
export const getMaxLevels = (identity: Identity): number => {
  return identity.id === 'adult' ? 7 : 4;
};
