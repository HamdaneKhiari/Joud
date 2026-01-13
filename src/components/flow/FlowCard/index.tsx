/**
 * FlowCard - Composant Card dynamique universel
 * Adapté aux 4 identités : PRIMARY | COLLEGE | LYCÉE | ADULT
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './style';
import { getBadgeColor } from './helpers';

// ============================================
// TYPES
// ============================================

interface FlowCardProps {
  icon?: React.ReactElement | string;
  title: string;
  subtitle: string;
  color?: string;
  badge?: string | null;
  progress?: number | null;
  locked?: boolean;
  onPress?: () => void;
  style?: object;
}

// ============================================
// COMPOSANT
// ============================================

const FlowCard: React.FC<FlowCardProps> = ({
  icon,
  title,
  subtitle,
  color,
  badge = null,
  progress = null,
  locked = false,
  onPress,
  style = {}
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Couleur de verrouillage dynamique selon l'identité
  const getLockedColor = () => {
    switch (identity.id) {
      case 'lycee':
        return '#2C3E50'; // Gris bleuté sombre
      case 'adult':
        return '#D1D5DB'; // Gris clair professionnel
      case 'college':
        return '#94A3B8'; // Gris moyen
      case 'primary':
        return '#B8C1CC'; // Gris doux
    }
  };

  // Couleur de l'icône locked dynamique selon l'identité
  const getLockedIconColor = () => {
    switch (identity.id) {
      case 'lycee':
        return '#607D8B'; // Gris bleuté moyen
      case 'adult':
        return '#9CA3AF'; // Gris moyen professionnel
      case 'college':
        return '#94A3B8'; // Gris moyen
      case 'primary':
        return '#B8C1CC'; // Gris doux
    }
  };

  // Couleurs
  const badgeColor = getBadgeColor(badge, identity);
  const cardColor = locked ? getLockedColor() : (color || identity.branding.main);
  const lockedIconColor = getLockedIconColor();

  // Animation simple (pas besoin de hook custom ici)
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (locked || !onPress) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animation de rebond
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();

    onPress();
  };

  // Helper: Détecte si une string est un emoji ou un nom d'icône
  const isEmoji = (str: string): boolean => {
    // Un emoji a généralement des caractères spéciaux ou une longueur > 1 en UTF-16
    // Un nom d'icône MaterialCommunityIcons contient des lettres et tirets uniquement
    const iconNamePattern = /^[a-z0-9-]+$/;
    return !iconNamePattern.test(str);
  };

  // Icône à afficher
  const displayIcon = () => {
    if (locked) {
      return (
        <MaterialCommunityIcons
          name="lock"
          size={32}
          color={lockedIconColor}
          testID="lock-icon"
        />
      );
    }

    // Si c'est une string
    if (typeof icon === 'string') {
      // Emoji ou texte → afficher tel quel
      if (isEmoji(icon)) {
        return <Text style={styles.iconText}>{icon}</Text>;
      }

      // Nom d'icône MaterialCommunityIcons → rendre l'icône
      return (
        <MaterialCommunityIcons
          name={icon as any}
          size={32}
          color="#FFFFFF"
        />
      );
    }

    // React Element (icône)
    return icon || (
      <MaterialCommunityIcons
        name="book-open-variant"
        size={32}
        color="#FFFFFF"
      />
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        testID={`flow-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
        style={[styles.card, locked && styles.cardLocked]}
        onPress={handlePress}
        activeOpacity={1}
        disabled={locked || !onPress}
      >
        {/* Barre de couleur latérale */}
        <View style={[styles.colorBar, { backgroundColor: cardColor }]} />

        <View style={styles.content}>
          {/* Conteneur de l'icône */}
          <View style={[styles.iconContainer, { backgroundColor: cardColor }]}>
            {displayIcon()}
          </View>

          {/* Zone de texte */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          {/* Indicateur de droite (Badge, Progrès ou Chevron) */}
          <View style={styles.indicator}>
            {/* Badge de statut */}
            {badge && (
              <View
                style={[styles.badge, { backgroundColor: badgeColor }]}
                testID="flow-card-badge"
              >
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}

            {/* Pourcentage de progression */}
            {progress !== null && (
              <Text style={styles.progressText} testID="flow-card-progress">
                {progress}%
              </Text>
            )}

            {/* Chevron par défaut si déverrouillé et sans indicateur spécifique */}
            {!badge && progress === null && !locked && (
              <Text style={styles.chevron} testID="flow-card-chevron">
                ›
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FlowCard;
