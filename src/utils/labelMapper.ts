/**
 * Label Mapper - Mapping dynamique des labels selon l'identité
 * PRIMARY | COLLEGE | LYCÉE | ADULT
 */

import type { Identity } from '@/themes/identities';
import { BASE_MODULES } from './moduleHelper';

// ============================================
// TYPES
// ============================================

export type ModuleId =
  | 'vocab'
  | 'grammar'
  | 'phrase_types'
  | 'reading'
  | 'dialogues'
  | 'word_games'
  | 'assessment'
  | 'connector'      // Lycée uniquement
  | 'fast_vocab'     // Adult uniquement
  | 'expressions';   // Adult uniquement

export interface ModuleLabel {
  title: string;
  description: string;
  icon: string; // MaterialCommunityIcons name
}

export interface LevelLabel {
  title: string;
  badge: string;
  description: string;
}

// ============================================
// MAPPING MODULES PAR IDENTITÉ
// ============================================

const PRIMARY_MODULES: Record<string, ModuleLabel> = {
  vocab: {
    title: 'Mes Premiers Mots',
    description: 'Apprends des nouveaux mots',
    icon: 'book-alphabet'
  },
  grammar: {
    title: 'Grammaire Simple',
    description: 'Les règles de base',
    icon: 'ruler'
  },
  phrase_types: {
    title: 'Types de Phrases',
    description: 'Questions, exclamations...',
    icon: 'comment-question'
  },
  reading: {
    title: 'Histoires Courtes',
    description: 'Lis de petites histoires',
    icon: 'book-open-page-variant'
  },
  dialogues: {
    title: 'Dialogues Écrits',
    description: 'Des conversations amusantes',
    icon: 'message-text'
  },
  word_games: {
    title: 'Jeux de Mots',
    description: 'Joue avec les mots',
    icon: 'puzzle'
  },
  assessment: {
    title: 'Mon Bilan',
    description: 'Teste ce que tu sais',
    icon: 'trophy'
  }
};

const COLLEGE_MODULES: Record<string, ModuleLabel> = {
  vocab: {
    title: 'Vocabulaire',
    description: 'Enrichis ton lexique',
    icon: 'book-alphabet'
  },
  grammar: {
    title: 'Grammaire',
    description: 'Règles et structures',
    icon: 'format-list-bulleted'
  },
  phrase_types: {
    title: 'Phrases',
    description: 'Construction de phrases',
    icon: 'format-quote-close'
  },
  reading: {
    title: 'Compréhension Écrite',
    description: 'Analyse de textes',
    icon: 'text-box'
  },
  dialogues: {
    title: 'Conversation',
    description: 'Dialogues et échanges',
    icon: 'chat'
  },
  word_games: {
    title: 'Exercices Ludiques',
    description: 'Apprends en jouant',
    icon: 'gamepad-variant'
  },
  assessment: {
    title: 'Évaluation',
    description: 'Teste tes connaissances',
    icon: 'clipboard-check'
  }
};

const LYCEE_MODULES: Record<string, ModuleLabel> = {
  vocab: {
    title: 'Vocabulary',
    description: 'Advanced lexicon',
    icon: 'book-alphabet'
  },
  grammar: {
    title: 'Grammar',
    description: 'Complex structures',
    icon: 'format-list-bulleted'
  },
  phrase_types: {
    title: 'Sentences',
    description: 'Advanced syntax',
    icon: 'format-quote-close'
  },
  reading: {
    title: 'Reading',
    description: 'Text analysis',
    icon: 'text-box'
  },
  dialogues: {
    title: 'Conversation',
    description: 'Fluent exchanges',
    icon: 'chat'
  },
  word_games: {
    title: 'Practice',
    description: 'Interactive exercises',
    icon: 'gamepad-variant'
  },
  connector: {
    title: 'The Connector',
    description: 'Syntax & articulation',
    icon: 'connection'
  },
  assessment: {
    title: 'Assessment',
    description: 'Skill evaluation',
    icon: 'clipboard-check'
  }
};

const ADULT_MODULES: Record<string, ModuleLabel> = {
  vocab: {
    title: 'Vocabulaire',
    description: 'Lexique professionnel',
    icon: 'book-alphabet'
  },
  fast_vocab: {
    title: 'Fast Vocabulary ⚡',
    description: 'Apprentissage accéléré',
    icon: 'flash'
  },
  expressions: {
    title: 'Expressions',
    description: 'Locutions courantes',
    icon: 'format-quote-open'
  },
  grammar: {
    title: 'Grammaire',
    description: 'Structures avancées',
    icon: 'format-list-bulleted'
  },
  reading: {
    title: 'Lecture',
    description: 'Textes professionnels',
    icon: 'text-box'
  },
  dialogues: {
    title: 'Conversations',
    description: 'Échanges professionnels',
    icon: 'chat'
  },
  assessment: {
    title: 'Évaluation',
    description: 'Bilan de compétences',
    icon: 'clipboard-check'
  }
};

// ============================================
// MAPPING NIVEAUX PAR IDENTITÉ
// ============================================

const PRIMARY_LEVELS: Record<number, LevelLabel> = {
  1: { title: 'La Découverte', badge: 'DÉCOUVERTE', description: 'Premier pas dans l\'apprentissage' },
  2: { title: 'Le Démarrage', badge: 'DÉMARRAGE', description: 'On commence vraiment' },
  3: { title: 'L\'Exploration', badge: 'EXPLORATION', description: 'Découvre de nouvelles choses' },
  4: { title: 'La Maîtrise', badge: 'MAÎTRISE', description: 'Tu deviens un expert' }
};

const COLLEGE_LEVELS: Record<number, LevelLabel> = {
  1: { title: 'Les Bases', badge: 'BASES', description: 'Fondations essentielles' },
  2: { title: 'L\'Essentiel', badge: 'ESSENTIEL', description: 'Compétences clés' },
  3: { title: 'L\'Avancé', badge: 'AVANCÉ', description: 'Niveau supérieur' },
  4: { title: 'L\'Expert', badge: 'EXPERT', description: 'Maîtrise complète' }
};

const LYCEE_LEVELS: Record<number, LevelLabel> = {
  1: { title: 'Foundations', badge: 'FOUNDATIONS', description: 'Core principles' },
  2: { title: 'Skills', badge: 'SKILLS', description: 'Practical abilities' },
  3: { title: 'Expertise', badge: 'EXPERTISE', description: 'Advanced mastery' },
  4: { title: 'Mastery', badge: 'MASTERY', description: 'Complete command' }
};

const ADULT_LEVELS: Record<number, LevelLabel> = {
  1: { title: 'Niveau 1', badge: 'N1', description: 'Débutant' },
  2: { title: 'Niveau 2', badge: 'N2', description: 'Élémentaire' },
  3: { title: 'Niveau 3', badge: 'N3', description: 'Intermédiaire' },
  4: { title: 'Niveau 4', badge: 'N4', description: 'Intermédiaire +' },
  5: { title: 'Niveau 5', badge: 'N5', description: 'Avancé' },
  6: { title: 'Niveau 6', badge: 'N6', description: 'Expert' },
  7: { title: 'Slang & Real Life', badge: 'BONUS', description: 'Langage courant et argot' }
};

// ============================================
// FONCTIONS PUBLIQUES
// ============================================

/**
 * Récupère le label d'un module selon l'identité
 */
export const getModuleLabel = (
  moduleId: string,
  identity: Identity
): ModuleLabel => {
  const maps = {
    primary: PRIMARY_MODULES,
    college: COLLEGE_MODULES,
    lycee: LYCEE_MODULES,
    adult: ADULT_MODULES
  };

  const moduleMap = maps[identity.id];
  return moduleMap[moduleId] || {
    title: moduleId,
    description: 'Module',
    icon: 'book'
  };
};

/**
 * Récupère le label d'un niveau selon l'identité
 */
export const getLevelLabel = (
  levelId: number,
  identity: Identity
): LevelLabel => {
  const maps = {
    primary: PRIMARY_LEVELS,
    college: COLLEGE_LEVELS,
    lycee: LYCEE_LEVELS,
    adult: ADULT_LEVELS
  };

  const levelMap = maps[identity.id];
  return levelMap[levelId] || {
    title: `Niveau ${levelId}`,
    badge: `N${levelId}`,
    description: 'Niveau'
  };
};

/**
 * Récupère la liste des modules disponibles pour une identité et un niveau
 */
export const getAvailableModules = (
  identity: Identity,
  levelId: number
): ModuleId[] => {
  // LYCÉE : Ajoute "The Connector" (8 modules)
  if (identity.id === 'lycee') {
    return [
      'vocab',
      'grammar',
      'phrase_types',
      'connector', // Module spécial Lycée
      'reading',
      'dialogues',
      'word_games',
      'assessment'
    ];
  }

  // ADULT : Différenciation niveaux standard (1-6) vs Bonus (7)
  if (identity.id === 'adult') {
    if (levelId === 7) {
      // Niveau BONUS : Uniquement Vocab et Phrases (Slang)
      return ['vocab', 'phrase_types'];
    }
    // Niveaux 1-6 standard
    return [
      'vocab',
      'fast_vocab', // Module spécial Adult
      'expressions', // Module spécial Adult
      'grammar',
      'reading',
      'dialogues',
      'assessment'
    ];
  }

  // PRIMARY et COLLEGE : 7 modules standard
  return BASE_MODULES;
};

/**
 * Vérifie si un module est disponible pour une identité/niveau
 */
export const isModuleAvailable = (
  moduleId: string,
  identity: Identity,
  levelId: number
): boolean => {
  const availableModules = getAvailableModules(identity, levelId);
  return availableModules.includes(moduleId as ModuleId);
};
