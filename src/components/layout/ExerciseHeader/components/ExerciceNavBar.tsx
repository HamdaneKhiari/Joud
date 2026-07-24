import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

interface ExerciceNavBarProps {
  onBack?: () => void;
  levelTitle?: string;
  showBadge?: boolean;
  rightIcon?: string | React.ReactElement;
  onRightIconPress?: () => void;
}

const createStyles = (identity: Identity) => {
  const isClean = identity.ui.mood === 'clean';
  // Header fond = primary (toujours foncé) → éléments en blanc/clair
  const onHeader = identity.text.onPrimary;
  const overlayLight = 'rgba(255, 255, 255, 0.25)';
  const overlayLightPressed = 'rgba(255, 255, 255, 0.35)';
  // Cibles tactiles agrandies pour le public primaire (enfants)
  const touchTarget = identity.id === 'primary' ? 58 : tokens.layout.touchTarget;

  return StyleSheet.create({
    navBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.spacing.sm,
      zIndex: 10
    },

    navLeft: { width: tokens.layout.navColumnWidth, alignItems: 'flex-start', paddingLeft: 4 },
    navCenter: { flex: 1, alignItems: 'center' },
    navRight: { width: tokens.layout.navColumnWidth, alignItems: 'flex-end', paddingRight: 4 },

    backButton: {
      width: touchTarget, height: touchTarget,
      justifyContent: 'center', alignItems: 'center',
      borderRadius: touchTarget / 2,
      backgroundColor: overlayLight,
      borderWidth: isClean ? 1 : 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
    },

    backButtonPressed: {
      backgroundColor: overlayLightPressed,
      transform: [{ scale: 0.95 }]
    },

    backIcon: {
      fontSize: tokens.fontSize.xxl + 2,
      color: onHeader,
      fontWeight: tokens.fontWeight.bold,
      marginLeft: -2
    },

    backButtonPlaceholder: { width: touchTarget, height: touchTarget },

    levelBadge: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.xs + 2,
      borderRadius: identity.ui.cardRadius + 8,
      borderWidth: isClean ? 1 : 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isClean ? 0.2 : 0.7,
      shadowRadius: 10, elevation: 8
    },

    levelText: {
      color: onHeader,
      fontWeight: tokens.fontWeight.black,
      fontSize: tokens.fontSize.base,
      letterSpacing: 0.8,
      textShadowColor: isClean ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3
    },

    badgePlaceholder: { width: 70, height: 36 },

    rightIconButton: {
      width: touchTarget, height: touchTarget,
      justifyContent: 'center', alignItems: 'center',
      borderRadius: identity.ui.cardRadius,
      backgroundColor: overlayLight,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
    },

    rightIconText: {
      fontSize: 24,
      color: onHeader,
      opacity: 0.9
    },

    rightIconPlaceholder: { width: touchTarget, height: touchTarget }
  });
};

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
      <View style={styles.navLeft}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
      </View>

      <View style={styles.navCenter}>
        {showBadge && levelTitle ? (
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
            ]}
          >
            <Text style={styles.levelText}>{levelTitle}</Text>
          </View>
        ) : (
          <View style={styles.badgePlaceholder} />
        )}
      </View>

      <View style={styles.navRight}>
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole={onRightIconPress ? 'button' : undefined}
            accessibilityElementsHidden={!onRightIconPress}
            importantForAccessibility={onRightIconPress ? 'yes' : 'no-hide-descendants'}
          >
            {typeof rightIcon === 'string' ? (
              <Text style={styles.rightIconText}>{rightIcon}</Text>
            ) : (
              rightIcon
            )}
          </Pressable>
        ) : (
          <View style={styles.rightIconPlaceholder} />
        )}
      </View>
    </View>
  );
};

export default ExerciceNavBar;
