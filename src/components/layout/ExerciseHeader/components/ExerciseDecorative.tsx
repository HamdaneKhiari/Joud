/**
 * ExerciseDecorative - Élément décoratif du header
 * Version TypeScript avec styles dynamiques
 *
 * Support :
 * - Images locales (require) : number
 * - Images URI (http/file) : string avec URL
 * - Emojis/Texte : string sans URL
 * - Composants React : ReactElement
 */

import React, { useMemo } from 'react';
import { View, Image, Text, StyleSheet, ImageSourcePropType } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

interface ExerciseDecorativeProps {
  icon?: string | number | React.ReactElement;
  position?: 'left' | 'center' | 'right';
}

// ============================================
// STYLES DYNAMIQUES
// ============================================

const createStyles = (identity: Identity) => {
  const baseColors = {
    black: '#000000'
  };

  return StyleSheet.create({
    decorativeContainer: {
      position: 'absolute',
      bottom: -30,
      zIndex: 5,
      opacity: identity.id === 'adult' ? 0.3 : 0.8
    },

    decorativeRight: {
      right: tokens.spacing.md
    },

    decorativeLeft: {
      left: tokens.spacing.md
    },

    decorativeCenter: {
      alignSelf: 'center'
    },

    decorativeImage: {
      width: 140,
      height: 140,
      shadowColor: baseColors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8
    },

    decorativeEmoji: {
      fontSize: identity.id === 'primary' ? 120 : 100,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4
    }
  });
};

// ============================================
// COMPOSANT
// ============================================

const ExerciseDecorative: React.FC<ExerciseDecorativeProps> = ({
  icon = '📚',
  position = 'right'
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Détermine le style de position
  const getPositionStyle = () => {
    switch (position) {
      case 'center':
        return styles.decorativeCenter;
      case 'left':
        return styles.decorativeLeft;
      case 'right':
      default:
        return styles.decorativeRight;
    }
  };

  // Rendu de l'icône selon son type
  const renderIcon = () => {
    // CAS 1 : Image locale (require) - typeof number
    if (typeof icon === 'number') {
      return (
        <Image
          source={icon as ImageSourcePropType}
          style={styles.decorativeImage}
          resizeMode="contain"
        />
      );
    }

    // CAS 2 : String (emoji ou URI)
    if (typeof icon === 'string') {
      // Si c'est une URI (http ou file)
      if (icon.startsWith('http') || icon.startsWith('file')) {
        return (
          <Image
            source={{ uri: icon }}
            style={styles.decorativeImage}
            resizeMode="contain"
          />
        );
      }

      // Sinon c'est un emoji ou caractère
      return <Text style={styles.decorativeEmoji}>{icon}</Text>;
    }

    // CAS 3 : Composant React
    return icon;
  };

  return (
    <View style={[styles.decorativeContainer, getPositionStyle()]}>
      {renderIcon()}
    </View>
  );
};

export default ExerciseDecorative;
