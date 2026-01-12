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

  // Couleurs
  const badgeColor = getBadgeColor(badge, identity);
  const cardColor = locked ? '#9CA3AF' : (color || identity.branding.main);

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

  // Icône à afficher
  const displayIcon = () => {
    if (locked) {
      return (
        <MaterialCommunityIcons
          name="lock"
          size={32}
          color="#9CA3AF"
          testID="lock-icon"
        />
      );
    }

    // Emoji ou texte
    if (typeof icon === 'string') {
      return <Text style={styles.iconText}>{icon}</Text>;
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
