import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { tokens, withOpacity } from '@/themes/tokens';
import { useTheme } from '@/themes/ThemeContext';

interface OptionButtonProps {
  letter: string;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  brandColor: string;
  onPress: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  letter, text, isSelected, isCorrect, isAnswered, brandColor, onPress
}) => {
  const { identity } = useTheme();

  // Extraction des préférences UI de l'identité
  const uiPrefs = {
    borderRadius: identity.ui?.cardRadius || tokens.borderRadius.md,
    badgeRadius: identity.ui?.buttonRadius ? identity.ui.buttonRadius * 0.4 : tokens.borderRadius.sm,
    borderWidth: identity.ui?.borderWidth || tokens.borderWidth.base,
  };

  const getColors = () => {
    // Couleurs système depuis l'identité
    const successColor = identity.ai?.success || tokens.colors.success;
    const errorColor = identity.ai?.error || tokens.colors.error;

    if (!isAnswered) {
      return isSelected 
        ? { 
            bg: withOpacity(brandColor, tokens.opacity?.light || 0.1), 
            border: brandColor, 
            text: identity.text.primary 
          }
        : { 
            bg: identity.branding.surface, 
            border: withOpacity(identity.text.tertiary, tokens.opacity?.border || 0.2), 
            text: identity.text.primary 
          };
    }

    if (isSelected) {
      const statusColor = isCorrect ? successColor : errorColor;
      return { bg: statusColor, border: statusColor, text: identity.text.onPrimary || '#FFFFFF' };
    }

    return { 
      bg: identity.branding.surface, 
      border: withOpacity(identity.text.tertiary, tokens.opacity?.border || 0.1), 
      text: withOpacity(identity.text.primary, 0.5) 
    };
  };

  const colors = getColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isAnswered}
      style={[
        styles.button, 
        { 
          backgroundColor: colors.bg, 
          borderColor: colors.border,
          borderRadius: uiPrefs.borderRadius,
          borderWidth: uiPrefs.borderWidth
        }
      ]}
    >
      <View style={[
        styles.letterBadge, 
        { 
          backgroundColor: isSelected && isAnswered ? 'rgba(255,255,255,0.2)' : withOpacity(brandColor, 0.15),
          borderRadius: uiPrefs.badgeRadius
        }
      ]}>
        <Text style={[styles.letterText, { color: isSelected && isAnswered ? '#FFFFFF' : brandColor }]}>
          {letter}
        </Text>
      </View>
      <Text style={[
        styles.optionText, 
        { 
          color: colors.text, 
          fontFamily: identity.typography?.families?.primary,
          fontSize: identity.typography?.sizes?.base || tokens.fontSize.base
        }
      ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
    ...tokens.shadows.sm,
  },
  letterBadge: {
    width: 32, // Légèrement plus grand pour le confort visuel
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { 
    fontWeight: tokens.fontWeight.bold, 
    fontSize: tokens.fontSize.sm 
  },
  optionText: { 
    fontWeight: tokens.fontWeight.medium, 
    flex: 1 
  },
});

export default OptionButton;