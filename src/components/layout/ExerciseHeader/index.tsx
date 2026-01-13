/**
 * ExerciseHeader - Header dynamique pour tous les exercices
 * Adapté aux 4 identités : PRIMARY | COLLEGE | LYCÉE | ADULT
 * Version modulaire avec sous-composants
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
  levelColor?: string | string[];
  showLevelBadge?: boolean;
  title?: string;
  exerciseTitle?: string;
  categoryTitle?: string;
  subcategoryTitle?: string;
  subtitle?: string;
  decorativeIcon?: string | number | React.ReactElement;
  decorativePosition?: 'left' | 'center' | 'right';
  gradientColors?: string[];
  showDecorative?: boolean;
  rightIcon?: string | React.ReactElement;
  onRightIconPress?: () => void;
}

// ============================================
// STYLES DYNAMIQUES
// ============================================

const createStyles = (identity: Identity) => {
  const baseColors = {
    black: '#000000'
  };

  // Espacement selon l'identité
  const getHeaderSpacing = () => {
    switch (identity.id) {
      case 'primary':
        return { top: tokens.spacing.md, bottom: tokens.spacing.lg };
      case 'college':
        return { top: tokens.spacing.sm, bottom: tokens.spacing.md };
      case 'lycee':
      case 'adult':
        return { top: tokens.spacing.sm, bottom: tokens.spacing.sm };
    }
  };

  const headerSpacing = getHeaderSpacing();

  return StyleSheet.create({
    headerContainer: {
      paddingTop: headerSpacing.top,
      paddingBottom: headerSpacing.bottom,
      paddingHorizontal: tokens.spacing.md,
      minHeight: identity.id === 'primary' ? 160 : identity.id === 'college' ? 140 : 120,
      position: 'relative',
      overflow: 'hidden',
      borderBottomLeftRadius: identity.ui.cardRadius,
      borderBottomRightRadius: identity.ui.cardRadius,
      shadowColor: baseColors.black,
      shadowOffset: { width: 0, height: identity.id === 'primary' ? 6 : 4 },
      shadowOpacity: identity.id === 'primary' ? 0.2 : identity.id === 'college' ? 0.15 : 0.1,
      shadowRadius: identity.id === 'primary' ? 10 : identity.id === 'college' ? 8 : 6,
      elevation: identity.id === 'primary' ? 8 : identity.id === 'college' ? 6 : 4
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
  levelColor,
  showLevelBadge = true,
  title,
  exerciseTitle,
  categoryTitle,
  subcategoryTitle,
  subtitle,
  decorativeIcon,
  decorativePosition = 'right',
  gradientColors,
  showDecorative = true,
  rightIcon,
  onRightIconPress
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Déterminer le gradient correct (tableau de couleurs)
  const gradient = useMemo(() => {
    if (gradientColors) return gradientColors;
    if (Array.isArray(levelColor)) return levelColor;
    const color = levelColor || identity.branding.main;
    return [color, color];
  }, [gradientColors, levelColor, identity]);

  // Badge niveau
  const displayBadge = showLevelBadge && levelTitle;

  // Contenu central selon variant
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
        levelColor={Array.isArray(levelColor) ? levelColor[0] : levelColor}
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
