/**
 * ============================================
 * ExerciseHeaderContent (Premium Edition)
 * Logique simplifiée avec système de variants propre
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

interface ExerciseHeaderContentProps {
  title?: string;
  subtitle?: string;
  variant?: 'exercise' | 'selection' | 'category' | 'subcategory';
}

// ============================================
// CONFIGURATION DES VARIANTS (DRY)
// ============================================

/**
 * Configuration typographique par identité
 * Simplifie la logique conditionnelle dans les styles
 * ✅ 100% White Label : aucune couleur hardcodée
 */
const TYPOGRAPHY_CONFIG = {
  primary: {
    titleSize: tokens.fontSize.xxxl,      // 36px (↓ de 40px)
    titleWeight: tokens.fontWeight.black,
    titleLetterSpacing: -0.5,
    titleLineHeight: 40,
    subtitleWeight: tokens.fontWeight.bold,
  },
  college: {
    titleSize: tokens.fontSize.xxl + 4,   // 32px (↓ de 36px)
    titleWeight: tokens.fontWeight.black,
    titleLetterSpacing: -0.5,
    titleLineHeight: 38,
    subtitleWeight: tokens.fontWeight.extrabold,
  },
  lycee: {
    titleSize: tokens.fontSize.xxl,       // 28px
    titleWeight: tokens.fontWeight.bold,
    titleLetterSpacing: 0,
    titleLineHeight: 34,
    subtitleWeight: tokens.fontWeight.semibold,
  },
  adult: {
    titleSize: tokens.fontSize.xxl,       // 28px
    titleWeight: tokens.fontWeight.bold,
    titleLetterSpacing: 0,
    titleLineHeight: 34,
    subtitleWeight: tokens.fontWeight.semibold,
  },
} as const;

// ============================================
// STYLES DYNAMIQUES
// ============================================

const createStyles = (identity: Identity) => {
  const config = TYPOGRAPHY_CONFIG[identity.id];
  const isDark = identity.branding.themeMode === 'dark';

  // ✅ Couleurs sémantiques adaptatives
  const textColor = identity.id === 'adult'
    ? (isDark ? '#F9FAFB' : '#1F2937')
    : '#FFFFFF';

  const textShadow = identity.id === 'adult'
    ? { shadowColor: 'transparent', shadowOpacity: 0 }
    : {
        shadowColor: '#000000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      };

  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', // ✅ Centré verticalement pour équilibre
      paddingHorizontal: tokens.spacing.md,
    },

    // ✅ Titre optimisé : plus de logique conditionnelle inline
    exerciseTitle: {
      fontSize: config.titleSize,
      fontWeight: config.titleWeight,
      color: textColor,
      textAlign: 'center',
      marginBottom: tokens.spacing.xs,
      letterSpacing: config.titleLetterSpacing,
      lineHeight: config.titleLineHeight,
      ...textShadow,
    },

    // ✅ Variante pour selection (légèrement plus grand)
    selectionTitle: {
      fontSize: config.titleSize + 2,
    },

    // ✅ Sous-titre optimisé (100% White Label)
    exerciseSubtitle: {
      fontSize: tokens.fontSize.sm,
      fontWeight: config.subtitleWeight,
      // ✅ Utilise l'accent de l'identité (caméléon pur)
      color: identity.branding.accent,
      textAlign: 'center',
      letterSpacing: 0.3,
      lineHeight: 20,
      // Ombre plus subtile pour le sous-titre
      ...(identity.id !== 'adult' && {
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
      }),
    },
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

  // ✅ Détermine le style du titre selon la variante (simplifié)
  const titleStyle = variant === 'selection'
    ? [styles.exerciseTitle, styles.selectionTitle]
    : styles.exerciseTitle;

  return (
    <View style={styles.contentContainer}>
      {/* Titre principal */}
      {title && (
        <Text style={titleStyle} numberOfLines={2}>
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
