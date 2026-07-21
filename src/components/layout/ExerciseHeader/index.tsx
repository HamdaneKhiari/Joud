import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

import ExerciceNavBar from './components/ExerciceNavBar';
import ExerciseHeaderContent from './components/ExerciseHeaderContent';
import ExerciseDecorative from './components/ExerciseDecorative';

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

const HEADER_HEIGHTS = {
  primary: 130,
  college: 115,
  lycee: 100,
  adult: 100,
} as const;

const HEADER_SPACING = {
  primary: { top: tokens.spacing.md, bottom: tokens.spacing.md },
  college: { top: tokens.spacing.sm, bottom: tokens.spacing.sm },
  lycee: { top: tokens.spacing.xs, bottom: tokens.spacing.xs },
  adult: { top: tokens.spacing.xs, bottom: tokens.spacing.xs },
} as const;

const createStyles = (identity: Identity) => {
  const identityId = identity.id as keyof typeof HEADER_SPACING;
  const spacing = HEADER_SPACING[identityId] || HEADER_SPACING.college;
  const minHeight = HEADER_HEIGHTS[identityId] || HEADER_HEIGHTS.college;

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
      ...tokens.shadows.md,
    }
  });
};

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

  // Le typage explicite du retour élimine le besoin d'assertions "as"
  const gradientColors = useMemo((): [string, string, ...string[]] => {
    const primary = identity.palette.primary || '#4F46E5';
    const bg = identity.header.background;

    if (Array.isArray(bg) && bg.length >= 2) {
      const [first, second, ...rest] = bg;
      return [first, second, ...rest];
    }

    return [primary, primary];
  }, [identity]);

  const contentProps = useMemo(() => {
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
  }, [variant, title, exerciseTitle, categoryTitle, subcategoryTitle, subtitle]);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <ExerciceNavBar
        onBack={onBack}
        levelTitle={levelTitle}
        showBadge={!!(showLevelBadge && levelTitle)}
        rightIcon={rightIcon}
        onRightIconPress={onRightIconPress}
      />

      <ExerciseHeaderContent
        title={contentProps.title}
        subtitle={contentProps.subtitle}
        variant={variant === 'simple' ? 'selection' : variant}
      />

      {showDecorative && decorativeIcon && identity.ui.showDecorativeShapes && (
        <ExerciseDecorative icon={decorativeIcon} position={decorativePosition} />
      )}
    </LinearGradient>
  );
};

export default ExerciseHeader;