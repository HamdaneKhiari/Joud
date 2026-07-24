import React, { useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './style';

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onFinish?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isLoading?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  onFinish,
  isFirst = false,
  isLast = false,
  isLoading = false,
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  return (
    <View style={styles.navigationContainer}>
      {!isFirst && onPrevious ? (
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrev]}
          onPress={onPrevious}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Précédent"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={32}
            color={identity.text.onPrimary}
          />
        </TouchableOpacity>
      ) : (
        // Placeholder pour garder l'alignement à droite du bouton Suivant
        <View style={{ width: 72 }} />
      )}

      <View style={styles.spacer} />

      {isLast ? (
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonFinish]}
          onPress={onFinish}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Terminer"
        >
          {isLoading ? (
            <ActivityIndicator color={identity.text.onPrimary} />
          ) : (
            <MaterialCommunityIcons name="check" size={24} color={identity.text.onPrimary} />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonNext]}
          onPress={onNext}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Suivant"
        >
            <MaterialCommunityIcons
              name="chevron-right"
              size={32}
              color={identity.text.onPrimary}
            />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NavigationButtons;