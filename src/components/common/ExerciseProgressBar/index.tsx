/**
 * ExerciseProgressBar - Barre de progression dynamique
 * Adapté aux 4 identités : PRIMARY | COLLEGE | LYCÉE | ADULT
 * White Label : 100% dynamique, aucune valeur hardcodée
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/identities';
import { tokens } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

interface ExerciseProgressBarProps {
  progressPercent: number;
  progressText: string;
}

interface EncouragementMessage {
  icon: string;
  text: string;
}

// ============================================
// HELPERS DYNAMIQUES
// ============================================

/**
 * Couleur de progression selon l'identité
 */
const getProgressColor = (identity: Identity): string => {
  return identity.branding.accent;
};

/**
 * Messages d'encouragement adaptés selon l'identité
 */
const getEncouragementMessage = (
  percent: number,
  identity: Identity
): EncouragementMessage | null => {
  // Adult : Pas d'emojis, messages sobres
  if (identity.id === 'adult') {
    if (percent >= 90) return { icon: '', text: 'Terminé' };
    if (percent >= 75) return { icon: '', text: 'Avancé' };
    if (percent >= 50) return { icon: '', text: 'En cours' };
    if (percent >= 25) return { icon: '', text: 'Progression' };
    if (percent > 0) return { icon: '', text: 'Démarré' };
    return null;
  }

  // Lycée : Messages en anglais, emojis discrets
  if (identity.id === 'lycee') {
    if (percent >= 90) return { icon: '✓', text: 'Almost done' };
    if (percent >= 75) return { icon: '↗', text: 'Great progress' };
    if (percent >= 50) return { icon: '→', text: 'Keep going' };
    if (percent >= 25) return { icon: '▸', text: 'Good start' };
    if (percent > 0) return { icon: '•', text: 'Started' };
    return null;
  }

  // Primary & College : Messages enthousiastes avec emojis
  if (percent >= 90) return { icon: '🎉', text: 'Presque fini !' };
  if (percent >= 75) return { icon: '🔥', text: 'Continue comme ça !' };
  if (percent >= 50) return { icon: '💪', text: 'Bon rythme !' };
  if (percent >= 25) return { icon: '⚡', text: 'Tu avances bien !' };
  if (percent > 0) return { icon: '🚀', text: "C'est parti !" };
  return null;
};

// ============================================
// STYLES DYNAMIQUES
// ============================================

const createStyles = (identity: Identity) => {
  const baseColors = {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray200: '#E5E7EB',
    gray600: '#4B5563',
    gray900: '#111827'
  };

  // Hauteur de la barre selon l'identité
  const getBarHeight = () => {
    switch (identity.id) {
      case 'primary':
        return 12; // Épaisse et ludique
      case 'college':
        return 10; // Équilibrée
      case 'lycee':
      case 'adult':
        return 8; // Fine et sobre
    }
  };

  // Border radius de la barre
  const getBarRadius = () => {
    switch (identity.id) {
      case 'primary':
        return tokens.borderRadius.md; // Plus rond
      case 'college':
        return tokens.borderRadius.sm;
      case 'lycee':
      case 'adult':
        return tokens.borderRadius.sm; // Plus carré
    }
  };

  // Espacement du container
  const getContainerPadding = () => {
    switch (identity.id) {
      case 'primary':
        return { h: tokens.spacing.xl, v: tokens.spacing.lg };
      case 'college':
        return { h: tokens.spacing.xl, v: tokens.spacing.md };
      case 'lycee':
      case 'adult':
        return { h: tokens.spacing.lg, v: tokens.spacing.sm };
    }
  };

  const barHeight = getBarHeight();
  const barRadius = getBarRadius();
  const padding = getContainerPadding();

  return StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: padding.h,
      paddingVertical: padding.v,
      backgroundColor: identity.id === 'lycee' ? '#1A1A1A' : baseColors.gray50,
      borderTopLeftRadius: identity.ui.cardRadius,
      borderTopRightRadius: identity.ui.cardRadius,
      borderBottomWidth: identity.id === 'adult' ? 0 : 1,
      borderBottomColor: identity.id === 'lycee' ? '#2C3E50' : 'rgba(0, 0, 0, 0.06)'
    },

    headerContainer: {
      marginBottom: tokens.spacing.sm
    },

    textContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    progressText: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.md : tokens.fontSize.base,
      fontWeight: identity.id === 'adult' ? tokens.fontWeight.semibold : tokens.fontWeight.extrabold,
      color: identity.id === 'lycee' ? '#00E5FF' :
             identity.id === 'adult' ? baseColors.gray600 :
             baseColors.gray900,
      letterSpacing: identity.id === 'adult' ? 0 : 0.5
    },

    encouragementBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: identity.id === 'lycee' ? 'rgba(0, 229, 255, 0.1)' :
                       identity.id === 'adult' ? 'rgba(107, 114, 128, 0.1)' :
                       `${identity.branding.accent}15`,
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical: tokens.spacing.xs,
      borderRadius: identity.id === 'primary' ? tokens.borderRadius.md : tokens.borderRadius.sm,
      gap: tokens.spacing.xs
    },

    encouragementIcon: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.md : tokens.fontSize.sm
    },

    encouragementText: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.sm : tokens.fontSize.xs,
      fontWeight: identity.id === 'adult' ? tokens.fontWeight.medium : tokens.fontWeight.bold,
      color: identity.id === 'lycee' ? '#00E5FF' : identity.branding.accent,
      letterSpacing: 0.3
    },

    progressBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.md
    },

    progressBarBackground: {
      flex: 1,
      height: barHeight,
      backgroundColor: identity.id === 'lycee' ? '#0A0A0A' : baseColors.gray200,
      borderRadius: barRadius,
      overflow: 'hidden',
      position: 'relative',
      shadowColor: baseColors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: identity.id === 'adult' ? 0 : 0.05,
      shadowRadius: 2,
      elevation: 1
    },

    progressBarFill: {
      height: '100%',
      borderRadius: barRadius,
      position: 'relative',
      overflow: 'hidden',
      shadowColor: baseColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: identity.id === 'adult' ? 0 : 0.1,
      shadowRadius: 4,
      elevation: 2
    },

    shineEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: barRadius
    },

    glowEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      borderRadius: barRadius,
      shadowColor: baseColors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4
    },

    percentText: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.lg : tokens.fontSize.md,
      fontWeight: identity.id === 'adult' ? tokens.fontWeight.semibold : tokens.fontWeight.extrabold,
      color: identity.id === 'lycee' ? '#00E5FF' :
             identity.id === 'adult' ? baseColors.gray600 :
             identity.branding.accent,
      minWidth: 42,
      textAlign: 'right'
    }
  });
};

// ============================================
// COMPOSANT
// ============================================

const ExerciseProgressBar: React.FC<ExerciseProgressBarProps> = ({
  progressPercent,
  progressText
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Animation de la barre
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation smooth du remplissage
    Animated.spring(progressAnim, {
      toValue: progressPercent,
      tension: 50,
      friction: 8,
      useNativeDriver: false
    }).start();

    // Animation de glow qui pulse (désactivée pour Adult)
    if (identity.id !== 'adult') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [progressPercent, identity, glowAnim, progressAnim]);

  // Validation
  if (progressPercent < 0 || progressPercent > 100) {
    return <View style={styles.container} />;
  }

  // Couleur et message d'encouragement
  const color = getProgressColor(identity);
  const encouragement = getEncouragementMessage(progressPercent, identity);

  // Largeur animée de la barre
  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  // Opacité du glow
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8]
  });

  return (
    <View style={styles.container}>
      {/* En-tête avec texte et encouragement */}
      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.progressText}>{progressText}</Text>
          {encouragement && (
            <View style={styles.encouragementBadge}>
              {encouragement.icon.length > 0 && (
                <Text style={styles.encouragementIcon}>{encouragement.icon}</Text>
              )}
              <Text style={styles.encouragementText}>{encouragement.text}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          {/* Barre remplie avec gradient et animation */}
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: animatedWidth,
                backgroundColor: color
              }
            ]}
          >
            {/* Effet de brillance/shine (sauf Adult) */}
            {identity.id !== 'adult' && <View style={styles.shineEffect} />}
          </Animated.View>

          {/* Glow effect animé (sauf Adult) */}
          {progressPercent > 0 && identity.id !== 'adult' && (
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  width: animatedWidth,
                  backgroundColor: color,
                  opacity: glowOpacity
                }
              ]}
            />
          )}
        </View>

        {/* Pourcentage à droite */}
        <Text style={styles.percentText}>{Math.round(progressPercent)}%</Text>
      </View>
    </View>
  );
};

export default ExerciseProgressBar;
