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
      {/* Bouton Précédent ou Placeholder */}
      {!isFirst && onPrevious ? (
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrev]}
          onPress={onPrevious}
          disabled={isLoading}
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

      {/* Espaceur flexible */}
      <View style={styles.spacer} />

      {/* Bouton Suivant / Terminer */}
      {isLast ? (
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonFinish]}
          onPress={onFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonNext]}
          onPress={onNext}
          disabled={isLoading}
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