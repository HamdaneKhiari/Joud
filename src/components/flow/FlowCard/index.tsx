/**
 * FlowCard - Composant carte universel WHITE LABEL
 * Composant maître pour toutes les cartes (Family, Module, etc.)
 * Support : Mood (playful/clean), Variants (grid, horizontal), Animations
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './style';
import { isEmoji, getBadgeColor } from './helpers';

// ============================================
// TYPES
// ============================================

export interface FlowCardProps {
  // Contenu
  icon?: React.ReactElement | string;
  title: string;
  subtitle: string;
  description?: string;

  // Style
  color?: string;
  badge?: string | null;
  progress?: number | null;

  // États
  locked?: boolean;

  // Comportement
  onPress?: () => void;

  // Layout
  variant?: 'grid' | 'horizontal'; // grid = grille 2 colonnes, horizontal = pleine largeur
  animationDelay?: number; // Pour staggered animation

  // Style personnalisé (override)
  style?: object;
}

// ============================================
// COMPOSANT
// ============================================

const FlowCard: React.FC<FlowCardProps> = ({
  icon,
  title,
  subtitle,
  description,
  color,
  badge = null,
  progress = null,
  locked = false,
  onPress,
  variant = 'grid',
  animationDelay = 0,
  style = {}
}) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';
  const isHorizontal = variant === 'horizontal';

  // Couleurs
  const cardColor = locked ? '#D1D5DB' : (color || identity.palette.primary);
  const badgeColor = getBadgeColor(badge, identity);

  const styles = useMemo(
    () => createStyles(identity, isPlayful, isHorizontal, cardColor),
    [identity, isPlayful, isHorizontal, cardColor]
  );

  const handlePress = () => {
    if (locked || !onPress) return;
    Haptics.impactAsync(
      isHorizontal ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onPress();
  };

  // Rendu de l'icône
  const renderIcon = () => {
    const iconSize = isHorizontal ? 36 : (isPlayful ? 32 : 28);
    const lockColor = '#9CA3AF';

    if (locked) {
      return (
        <MaterialCommunityIcons
          name="lock"
          size={iconSize}
          color={lockColor}
        />
      );
    }

    if (typeof icon === 'string') {
      if (isEmoji(icon)) {
        return <Text style={styles.iconText}>{icon}</Text>;
      }
      return (
        <MaterialCommunityIcons
          name={icon as any}
          size={iconSize}
          color="#FFFFFF"
        />
      );
    }

    return icon || (
      <MaterialCommunityIcons
        name={isHorizontal ? 'bookmark' : 'folder-open'}
        size={iconSize}
        color="#FFFFFF"
      />
    );
  };

  // Rendu du badge/progression
  const renderIndicator = () => {
    // Badge de statut
    if (badge) {
      return (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      );
    }

    // Barre de progression (horizontal uniquement)
    if (progress !== null && isHorizontal) {
      return (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      );
    }

    return null;
  };

  // Animation d'entrée selon le variant
  const AnimationWrapper = isHorizontal
    ? Animated.createAnimatedComponent(View)
    : Animated.createAnimatedComponent(View);

  const animationProps = isHorizontal
    ? { entering: FadeInRight.springify() }
    : { entering: FadeInDown.delay(animationDelay).springify() };

  return (
    <AnimationWrapper {...animationProps} style={[styles.wrapper, style]}>
      <TouchableOpacity
        style={[
          styles.card,
          locked && styles.cardLocked,
        ]}
        onPress={handlePress}
        activeOpacity={isHorizontal ? 0.85 : 0.8}
        disabled={locked || !onPress}
      >
        {/* Barre décorative (clean mode ou horizontal) */}
        {(!isPlayful || isHorizontal) && (
          <View style={styles.colorBar} />
        )}

        {/* Conteneur d'icône */}
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>

        {/* Contenu texte */}
        <View style={styles.textContainer}>
          {/* Label optionnel (horizontal uniquement) */}
          {isHorizontal && description && (
            <Text style={styles.label}>{description}</Text>
          )}

          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <Text
            style={styles.subtitle}
            numberOfLines={isHorizontal ? 1 : 2}
          >
            {subtitle}
          </Text>

          {/* Indicateur (badge ou progression) */}
          {renderIndicator()}
        </View>

        {/* Chevron (horizontal uniquement, si pas de badge) */}
        {isHorizontal && !badge && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color={identity.palette.primary}
            style={styles.chevron}
          />
        )}
      </TouchableOpacity>
    </AnimationWrapper>
  );
};

export default FlowCard;
