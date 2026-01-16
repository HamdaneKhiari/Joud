/**
 * ExerciceNavBar - Barre de navigation du header
 * Version TypeScript avec styles dynamiques
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

interface ExerciceNavBarProps {
  onBack?: () => void;
  levelTitle?: string;
  showBadge?: boolean;
  rightIcon?: string | React.ReactElement;
  onRightIconPress?: () => void;
}

// ============================================
// STYLES DYNAMIQUES
// ============================================

const createStyles = (identity: Identity) => {
  const baseColors = {
    white: '#FFFFFF',
    black: '#000000',
    gray800: '#1F2937'
  };

  return StyleSheet.create({
    navBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.spacing.sm,
      zIndex: 10
    },

    navLeft: {
      width: 60,
      alignItems: 'flex-start',
      paddingLeft: 4
    },

    navCenter: {
      flex: 1,
      alignItems: 'center'
    },

    navRight: {
      width: 60,
      alignItems: 'flex-end',
      paddingRight: 4
    },

    // Bouton retour
    backButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 24,
      backgroundColor: identity.id === 'adult'
        ? 'rgba(0, 0, 0, 0.15)'
        : 'rgba(255, 255, 255, 0.25)',
      borderWidth: identity.id === 'adult' ? 1 : 2,
      borderColor: identity.id === 'adult'
        ? 'rgba(0, 0, 0, 0.2)'
        : 'rgba(255, 255, 255, 0.4)',
      shadowColor: baseColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },

    backButtonPressed: {
      backgroundColor: identity.id === 'adult'
        ? 'rgba(0, 0, 0, 0.25)'
        : 'rgba(255, 255, 255, 0.35)',
      transform: [{ scale: 0.95 }]
    },

    backIcon: {
      fontSize: tokens.fontSize.xxl + 2,
      color: identity.id === 'adult' ? baseColors.gray800 : baseColors.white,
      fontWeight: tokens.fontWeight.bold,
      marginLeft: -2
    },

    backButtonPlaceholder: {
      width: 48,
      height: 48
    },

    // Badge niveau
    levelBadge: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.xs + 2,
      borderRadius: identity.id === 'primary' ? tokens.borderRadius.xxl :
                     identity.id === 'college' ? tokens.borderRadius.xl :
                     tokens.borderRadius.lg,
      borderWidth: identity.id === 'adult' ? 1 : 2,
      borderColor: identity.id === 'adult'
        ? 'rgba(0, 0, 0, 0.2)'
        : 'rgba(255, 255, 255, 0.5)',
      shadowColor: identity.id === 'adult' ? baseColors.black : baseColors.white,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: identity.id === 'adult' ? 0.2 : 0.7,
      shadowRadius: 10,
      elevation: 8
    },

    levelText: {
      color: identity.id === 'adult' ? baseColors.gray800 : baseColors.white,
      fontWeight: tokens.fontWeight.black,
      fontSize: tokens.fontSize.base,
      letterSpacing: 0.8,
      textShadowColor: identity.id === 'adult' ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3
    },

    badgePlaceholder: {
      width: 70,
      height: 36
    },

    // Icône droite
    rightIconButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: identity.id === 'primary' ? tokens.borderRadius.xl :
                     identity.id === 'college' ? tokens.borderRadius.lg :
                     tokens.borderRadius.md,
      backgroundColor: identity.id === 'adult'
        ? 'rgba(0, 0, 0, 0.1)'
        : 'rgba(255, 255, 255, 0.2)',
      shadowColor: baseColors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },

    rightIconText: {
      fontSize: 24,
      color: identity.id === 'adult' ? baseColors.gray800 : baseColors.white,
      opacity: 0.9
    },

    rightIconPlaceholder: {
      width: 48,
      height: 48
    }
  });
};

// ============================================
// COMPOSANT
// ============================================

const ExerciceNavBar: React.FC<ExerciceNavBarProps> = ({
  onBack,
  levelTitle,
  showBadge = false,
  rightIcon,
  onRightIconPress
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  return (
    <View style={styles.navBar}>
      {/* Bouton retour */}
      <View style={styles.navLeft}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
      </View>

      {/* Badge niveau */}
      <View style={styles.navCenter}>
        {showBadge && levelTitle ? (
          <View
            style={[
              styles.levelBadge,
              {
                backgroundColor: identity.id === 'adult'
                  ? 'rgba(0, 0, 0, 0.15)'
                  : 'rgba(255, 255, 255, 0.3)'
              }
            ]}
          >
            <Text style={styles.levelText}>{levelTitle}</Text>
          </View>
        ) : (
          <View style={styles.badgePlaceholder} />
        )}
      </View>

      {/* Icône droite */}
      <View style={styles.navRight}>
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            {typeof rightIcon === 'string' ? (
              <Text style={styles.rightIconText}>{rightIcon}</Text>
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.rightIconPlaceholder} />
        )}
      </View>
    </View>
  );
};

export default ExerciceNavBar;
