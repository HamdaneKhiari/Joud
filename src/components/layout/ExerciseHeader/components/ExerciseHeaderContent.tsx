/**
 * ExerciseHeaderContent - Contenu textuel du header
 * Version TypeScript avec styles dynamiques
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

interface ExerciseHeaderContentProps {
  title?: string;
  subtitle?: string;
  variant?: 'exercise' | 'selection' | 'category' | 'subcategory';
}

// ============================================
// STYLES DYNAMIQUES
// ============================================

const createStyles = (identity: Identity) => {
  const baseColors = {
    white: '#FFFFFF',
    gray600: '#4B5563',
    gray800: '#1F2937'
  };

  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: tokens.spacing.sm,
      paddingBottom: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.sm
    },

    // Titre principal
    exerciseTitle: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.xxxl + 4 :
               identity.id === 'college' ? tokens.fontSize.xxxl :
               tokens.fontSize.xxl,
      fontWeight: identity.id === 'primary' || identity.id === 'college'
        ? tokens.fontWeight.black
        : tokens.fontWeight.bold,
      color: identity.id === 'adult' ? baseColors.gray800 : baseColors.white,
      textAlign: 'center',
      marginBottom: tokens.spacing.xs,
      letterSpacing: identity.id === 'lycee' || identity.id === 'adult' ? 0 : -0.5,
      textShadowColor: identity.id === 'adult' ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 6,
      lineHeight: identity.id === 'primary' ? 44 : 40
    },

    selectionTitle: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.xxxl + 4 : tokens.fontSize.xxxl,
      marginBottom: tokens.spacing.xs,
      fontWeight: tokens.fontWeight.black,
      letterSpacing: identity.id === 'lycee' || identity.id === 'adult' ? 0 : -0.5
    },

    // Sous-titre
    exerciseSubtitle: {
      fontSize: tokens.fontSize.base,
      fontWeight: identity.id === 'primary' ? tokens.fontWeight.bold :
                   identity.id === 'college' ? tokens.fontWeight.extrabold :
                   tokens.fontWeight.semibold,
      color: identity.id === 'primary' ? '#FF5722' :
             identity.id === 'college' ? '#FFD700' :
             identity.id === 'lycee' ? '#00E5FF' :
             baseColors.gray600,
      textAlign: 'center',
      letterSpacing: 0.3,
      textShadowColor: identity.id === 'adult' ? 'transparent' : 'rgba(0, 0, 0, 0.25)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
      lineHeight: 22
    }
  });
};

// ============================================
// COMPOSANT
// ============================================

const ExerciseHeaderContent: React.FC<ExerciseHeaderContentProps> = ({
  title,
  subtitle,
  variant = 'exercise'
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Détermine le style du titre selon la variante
  const getTitleStyle = () => {
    if (variant === 'selection') {
      return [styles.exerciseTitle, styles.selectionTitle];
    }
    return [styles.exerciseTitle];
  };

  return (
    <View style={styles.contentContainer}>
      {/* Titre principal */}
      {title && (
        <Text style={getTitleStyle()} numberOfLines={2}>
          {title}
        </Text>
      )}

      {/* Sous-titre optionnel */}
      {subtitle && subtitle.length > 0 && (
        <Text style={styles.exerciseSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default ExerciseHeaderContent;
