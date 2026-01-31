/**
 * FlowCard - Composant carte universel WHITE LABEL
 * Nettoyé de toute dépendance au BadgeHelper
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './style';
import { isEmoji } from './helpers'; // getBadgeColor a été supprimé ici

export interface FlowCardProps {
  icon?: React.ReactElement | string;
  title: string;
  subtitle: string;
  description?: string;
  color?: string;
  badge?: string | null; // Utilisé uniquement pour "EN COURS"
  progress?: number | null;
  locked?: boolean;
  onPress?: () => void;
  variant?: 'grid' | 'horizontal';
  animationDelay?: number;
  style?: object;
}

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

  // 1. Détermination des couleurs (Logique simplifiée)
  const cardColor = locked ? '#D1D5DB' : (color || identity.palette.primary);
  
  // Le badge de statut ("EN COURS") utilise toujours la couleur Accent
  const statusBadgeColor = identity.palette.accent;
  const statusBadgeText = identity.id === 'lycee' ? 'IN PROGRESS' : 'EN COURS';

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

  const renderIcon = () => {
    const iconSize = isHorizontal ? 36 : (isPlayful ? 32 : 28);
    if (locked) return <MaterialCommunityIcons name="lock" size={iconSize} color="#9CA3AF" />;

    if (typeof icon === 'string') {
      if (isEmoji(icon)) return <Text style={styles.iconText}>{icon}</Text>;
      return <MaterialCommunityIcons name={icon as any} size={iconSize} color="#FFFFFF" />;
    }
    return icon || <MaterialCommunityIcons name={isHorizontal ? 'bookmark' : 'folder-open'} size={iconSize} color="#FFFFFF" />;
  };

  return (
    <Animated.View 
      entering={isHorizontal ? FadeInRight.springify() : FadeInDown.delay(animationDelay).springify()} 
      style={[styles.wrapper, style]}
    >
      <TouchableOpacity
        style={[styles.card, locked && styles.cardLocked]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={locked || !onPress}
      >
        {/* BADGE STATUT (Haut Droite) - Uniquement si explicitement demandé */}
        {badge === 'EN COURS' && (
          <View style={[styles.badge, { backgroundColor: statusBadgeColor }]}>
            <Text style={styles.badgeText}>{statusBadgeText}</Text>
          </View>
        )}

        {(!isPlayful || isHorizontal) && <View style={styles.colorBar} />}

        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>

        <View style={styles.textContainer}>
          {isHorizontal && description && <Text style={styles.label}>{description}</Text>}
          
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={isHorizontal ? 1 : 2}>{subtitle}</Text>
        </View>

        {/* BADGE POURCENTAGE (Bas Droite) - La nouvelle logique premium */}
        {!isHorizontal && progress !== null && progress > 0 && (
          <View style={[styles.percentageBadge, { backgroundColor: `${cardColor}15` }]}>
            <Text style={[styles.percentageText, { color: cardColor }]}>{progress}%</Text>
          </View>
        )}

        {isHorizontal && !badge && (
          <MaterialCommunityIcons name="chevron-right" size={28} color={cardColor} style={styles.chevron} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FlowCard;