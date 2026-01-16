/**
 * ============================================
 * ExerciseHeader (Premium Edition)
 * Header optimisé : hauteur réduite, logique simplifiée, tokens premium
 * ============================================
 */

import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// Sous-composants
import ExerciceNavBar from './components/ExerciceNavBar';
import ExerciseHeaderContent from './components/ExerciseHeaderContent';
import ExerciseDecorative from './components/ExerciseDecorative';

// ============================================
// TYPES
// ============================================

interface ExerciseHeaderProps {
  variant?: 'exercise' | 'selection' | 'category' | 'subcategory' | 'simple';
  onBack?: () => void;
  levelTitle?: string;
  showLevelBadge?: boolean;
  title?: string;
  exerciseTitle?: string;
  categoryTitle?: string;
  subcategoryTitle?: string;
  subtitle?: string;
  decorativeIcon?: string | number | React.ReactElement;
  decorativePosition?: 'left' | 'center' | 'right';
  showDecorative?: boolean;
  rightIcon?: string | React.ReactElement;
  onRightIconPress?: () => void;
}

// ============================================
// CONFIGURATION DES VARIANTS (Clean & DRY)
// ============================================

/**
 * Configuration centralisée des hauteurs par identité
 * Réduit de 20-30% par rapport à l'original pour un look plus moderne
 */
const HEADER_HEIGHTS = {
  primary: 130,   // ↓ de 160
  college: 115,   // ↓ de 140
  lycee: 100,     // ↓ de 120
  adult: 100,     // ↓ de 120
} as const;

/**
 * Configuration centralisée des espacements par identité
 */
const HEADER_SPACING = {
  primary: { top: tokens.spacing.md, bottom: tokens.spacing.md },     // ↓ bottom réduit
  college: { top: tokens.spacing.sm, bottom: tokens.spacing.sm },     // ↓ bottom réduit
  lycee: { top: tokens.spacing.xs, bottom: tokens.spacing.xs },       // Minimal
  adult: { top: tokens.spacing.xs, bottom: tokens.spacing.xs },       // Minimal
} as const;

// ============================================
// STYLES DYNAMIQUES
// ============================================

const createStyles = (identity: Identity) => {
  const spacing = HEADER_SPACING[identity.id];
  const minHeight = HEADER_HEIGHTS[identity.id];

  return StyleSheet.create({
    headerContainer: {
      paddingTop: spacing.top,
      paddingBottom: spacing.bottom,
      paddingHorizontal: tokens.spacing.md,
      minHeight,
      position: 'relative',
      overflow: 'hidden',
      borderBottomLeftRadius: identity.ui.cardRadius,
      borderBottomRightRadius: identity.ui.cardRadius,
      // ✅ Ombres premium via tokens
      ...tokens.shadows.md,
    }
  });
};

// ============================================
// COMPOSANT
// ============================================

const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  variant = 'exercise',
  onBack,
  levelTitle,
  showLevelBadge = true,
  title,
  exerciseTitle,
  categoryTitle,
  subcategoryTitle,
  subtitle,
  decorativeIcon,
  decorativePosition = 'right',
  showDecorative = true,
  rightIcon,
  onRightIconPress
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // ✅ WHITE LABEL: Utilise uniquement identity.branding.main pour le gradient
  const gradient = useMemo(() => {
    // Si l'identité a un gradient défini, on l'utilise
    if (identity.ui.hasGradient && identity.ui.gradientColors) {
      return identity.ui.gradientColors;
    }
    // Sinon, couleur unie basée sur identity.branding.main
    return [identity.branding.main, identity.branding.main];
  }, [identity]);

  // Badge niveau
  const displayBadge = showLevelBadge && levelTitle;

  // ✅ Contenu central selon variant (logique simplifiée)
  const getContentProps = () => {
    switch (variant) {
      case 'exercise':
        return { title: exerciseTitle, subtitle };
      case 'selection':
        return { title, subtitle };
      case 'category':
        return { title: categoryTitle, subtitle };
      case 'subcategory':
        return { title: categoryTitle, subtitle: subcategoryTitle };
      default:
        return { title: title || exerciseTitle || categoryTitle, subtitle };
    }
  };

  const contentProps = getContentProps();

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      {/* Barre de navigation */}
      <ExerciceNavBar
        onBack={onBack}
        levelTitle={levelTitle}
        showBadge={displayBadge}
        rightIcon={rightIcon}
        onRightIconPress={onRightIconPress}
      />

      {/* Contenu central */}
      <ExerciseHeaderContent
        title={contentProps.title}
        subtitle={contentProps.subtitle}
        variant={variant}
      />

      {/* Élément décoratif */}
      {showDecorative && decorativeIcon && identity.ui.showDecorativeShapes && (
        <ExerciseDecorative icon={decorativeIcon} position={decorativePosition} />
      )}
    </LinearGradient>
  );
};

export default ExerciseHeader;
