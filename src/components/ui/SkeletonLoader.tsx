/**
 * SkeletonLoader - Composant de chargement moderne (2026 standard)
 * Supporte les modes playful et clean avec animations fluides
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

interface SkeletonLoaderProps {
  variant?: 'card' | 'grid-item' | 'recent-activity';
  style?: ViewStyle;
}

interface SkeletonItemProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

// ============================================
// SKELETON ITEM (Élément atomique)
// ============================================

const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width,
  height,
  borderRadius = 8,
  style
}) => {
  const { identity, isDark } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infini
      true // Reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseColor = isDark ? '#374151' : '#E5E7EB';

  return (
    <View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: baseColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// ============================================
// SKELETON VARIANTS
// ============================================

const SkeletonCard: React.FC = () => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';
  const cardRadius = isPlayful ? 24 : 12;

  return (
    <View style={[styles.card, { borderRadius: cardRadius }]}>
      {/* Barre latérale */}
      <SkeletonItem width={6} height="100%" borderRadius={0} style={styles.colorBar} />

      <View style={styles.cardContent}>
        {/* Icône */}
        <SkeletonItem
          width={isPlayful ? 56 : 48}
          height={isPlayful ? 56 : 48}
          borderRadius={isPlayful ? 28 : 12}
        />

        {/* Texte */}
        <View style={styles.textSkeleton}>
          <SkeletonItem width="70%" height={16} borderRadius={4} />
          <SkeletonItem width="50%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
        </View>

        {/* Badge */}
        <SkeletonItem width={60} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

const SkeletonGridItem: React.FC = () => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';
  const cardRadius = isPlayful ? 24 : 12;

  return (
    <View style={[styles.gridItem, { borderRadius: cardRadius }]}>
      {/* Icône centrée */}
      <SkeletonItem
        width={isPlayful ? 56 : 48}
        height={isPlayful ? 56 : 48}
        borderRadius={isPlayful ? 28 : 12}
        style={{ alignSelf: isPlayful ? 'center' : 'flex-start' }}
      />

      {/* Titre */}
      <SkeletonItem
        width="80%"
        height={14}
        borderRadius={4}
        style={{
          marginTop: 12,
          alignSelf: isPlayful ? 'center' : 'flex-start'
        }}
      />

      {/* Subtitle */}
      <SkeletonItem
        width="60%"
        height={12}
        borderRadius={4}
        style={{
          marginTop: 6,
          alignSelf: isPlayful ? 'center' : 'flex-start'
        }}
      />

      {/* Badge */}
      <SkeletonItem
        width={50}
        height={20}
        borderRadius={10}
        style={{
          marginTop: 8,
          alignSelf: isPlayful ? 'center' : 'flex-start'
        }}
      />
    </View>
  );
};

const SkeletonRecentActivity: React.FC = () => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';
  const cardRadius = isPlayful ? 24 : 12;

  return (
    <View style={[styles.recentActivity, { borderRadius: cardRadius }]}>
      {/* Icône grande */}
      <SkeletonItem
        width={72}
        height={72}
        borderRadius={isPlayful ? 36 : 16}
      />

      {/* Texte */}
      <View style={styles.recentTextSkeleton}>
        <SkeletonItem width="40%" height={12} borderRadius={4} />
        <SkeletonItem width="80%" height={20} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonItem width="60%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
        <SkeletonItem width={80} height={28} borderRadius={14} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  style
}) => {
  const renderVariant = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard />;
      case 'grid-item':
        return <SkeletonGridItem />;
      case 'recent-activity':
        return <SkeletonRecentActivity />;
      default:
        return <SkeletonCard />;
    }
  };

  return <View style={style}>{renderVariant()}</View>;
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Card horizontale
  card: {
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },

  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: tokens.spacing.sm,
    gap: tokens.spacing.md,
  },

  textSkeleton: {
    flex: 1,
    justifyContent: 'center',
  },

  // Grid item
  gridItem: {
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.lg,
    aspectRatio: 1,
    justifyContent: 'center',
  },

  // Recent Activity
  recentActivity: {
    backgroundColor: '#FFFFFF',
    padding: tokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },

  recentTextSkeleton: {
    flex: 1,
  },
});

export default SkeletonLoader;
