import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  /** Libellé du bouton "Suivant" quand ce n'est pas la dernière étape — par défaut "Suivant".
   *  Permet à un appelant de préciser l'action réelle (ex: "Voir les questions"). */
  nextLabel?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  onFinish,
  isFirst = false,
  isLast = false,
  isLoading = false,
  nextLabel = 'Suivant',
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  return (
    <View style={styles.navigationContainer}>
      {!isFirst && onPrevious ? (
        <View style={styles.navItem}>
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
          <Text style={styles.navLabel}>Précédent</Text>
        </View>
      ) : (
        // Placeholder pour garder l'alignement à droite du bouton Suivant
        <View style={{ width: 72 }} />
      )}

      <View style={styles.spacer} />

      {isLast ? (
        <View style={styles.navItem}>
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
          <Text style={styles.navLabel}>Terminer</Text>
        </View>
      ) : (
        <View style={styles.navItem}>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonNext]}
            onPress={onNext}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={nextLabel}
          >
              <MaterialCommunityIcons
                name="chevron-right"
                size={32}
                color={identity.text.onPrimary}
              />
          </TouchableOpacity>
          <Text style={styles.navLabel}>{nextLabel}</Text>
        </View>
      )}
    </View>
  );
};

export default NavigationButtons;