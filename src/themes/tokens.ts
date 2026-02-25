import { StyleSheet } from 'react-native';

/**
 * ============================================
 * DESIGN TOKENS - JOUD (Premium Edition)
 * Système de tokens enrichi pour un design de classe mondiale
 * ============================================
 */

// ============================================
// 🎯 SPACING & SIZING
// ============================================

/**
 * Échelle d'espacement universelle
 * Utilisée pour margins, paddings, gaps
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Tailles d'emojis standardisées
 */
export const emojiSize = {
  sm: 20,
  md: 28,
  lg: 40,
  xl: 48,
  xxl: 60,
  huge: 80,
  decorative: 100,       // Header décoratif (clean mode)
  decorativeLarge: 120,  // Header décoratif (playful mode)
};

/**
 * Tailles d'icônes standardisées
 * Pour MaterialIcons, FontAwesome, etc.
 */
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
};

/**
 * Constantes de layout sémantiques
 * Pour une cohérence visuelle globale
 */
export const layout = {
  cardPadding: 24,        // Padding interne des cards
  cardGap: 16,            // Espace entre les cards
  sectionGap: 32,         // Espace entre les sections
  screenPadding: 20,      // Padding des écrans
  headerHeight: 120,      // Hauteur du header
  navBarHeight: 80,       // Hauteur de la barre de navigation
  buttonSpacing: 12,      // Espace entre boutons adjacents
  touchTarget: 48,        // Aire minimale de tap (WCAG : 44pt minimum)
  navColumnWidth: 60,     // Largeur des colonnes gauche/droite de la NavBar
  decorativeImageSize: 140, // Taille des images décoratives dans les headers
};

// ============================================
// 🔤 TYPOGRAPHY
// ============================================

/**
 * Échelle typographique harmonieuse
 * Basée sur un ratio de 1.2 (Major Third)
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 36,
  huge: 48,
};

/**
 * Poids de police standards
 * Compatible avec les fonts custom et système
 */
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

// ============================================
// 🔲 BORDERS & RADIUS
// ============================================

/**
 * Arrondis standardisés
 * Pour une cohérence visuelle entre composants
 */
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

/**
 * Épaisseurs de bordure
 */
export const borderWidth = {
  none: 0,
  thin: StyleSheet.hairlineWidth,
  thick: 2,
};

// ============================================
// 🌑 SHADOWS (Premium System)
// ============================================

/**
 * Système d'ombres complet pour une hiérarchie visuelle
 * De none (flat design) à xl (dramatique)
 *
 * Utilisation :
 * - none : Flat design, pas d'élévation
 * - xs   : Inputs, petits boutons
 * - sm   : Boutons secondaires, chips
 * - md   : Cards standard, éléments interactifs
 * - lg   : Modals, navigation bars
 * - xl   : Popups, floating actions, dialogs
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  // Alias pour compatibilité avec l'ancien code
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

// ============================================
// ⏱️ ANIMATION TOKENS
// ============================================

/**
 * Durées d'animation standards
 * En millisecondes
 */
export const animation = {
  duration: {
    fast: 150,      // Micro-interactions (hover, press)
    normal: 250,    // Transitions standard
    slow: 400,      // Animations complexes
  },
  /**
   * Courbes d'accélération (Bezier curves)
   * Compatible avec Animated.timing({ easing })
   */
  easing: {
    standard: [0.4, 0, 0.2, 1],    // Material easing
    decelerate: [0, 0, 0.2, 1],  // Entrée (slow → fast)
    accelerate: [0.4, 0, 1, 1],    // Sortie (fast → slow)
  },
};

// ============================================
// 🎨 OPACITY LEVELS
// ============================================

/**
 * Niveaux d'opacité standardisés
 * Pour états disabled, overlays, etc.
 */
export const opacity = {
  disabled: 0.4,
  overlay: 0.6,
  subtle: 0.8,
  full: 1,
};

// ============================================
// 🎨 COLOR HELPERS
// ============================================

/**
 * Convertit une couleur hexadécimale en rgba avec opacité
 * @param hexColor - Couleur au format #RRGGBB
 * @param opacityValue - Valeur entre 0 et 1
 */
export const withOpacity = (hexColor: string, opacityValue: number) => {
const r = Number.parseInt(hexColor.slice(1, 3), 16);
  const g = Number.parseInt(hexColor.slice(3, 5), 16);
  const b = Number.parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
};

// ============================================
// 📦 EXPORT GLOBAL
// ============================================

/**
 * Export centralisé de tous les tokens
 * Utilisé dans les composants via : import { tokens } from '@/themes/tokens'
 */
export const tokens = {
  spacing,
  fontSize,
  fontWeight,
  emojiSize,
  iconSize,
  borderRadius,
  borderWidth,
  shadows,
  layout,
  animation,
  opacity,
};
