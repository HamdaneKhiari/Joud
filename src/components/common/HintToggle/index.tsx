import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

interface HintToggleProps {
  /** Rien n'est rendu si absent — les appelants n'ont pas besoin de leur propre `{hint && ...}`. */
  hint?: string;
  brandColor?: string;
}

/**
 * Indice "Besoin d'aide ?" / "Masquer l'indice" — pattern unique pour toute l'app (toggle
 * contrôlé, accessible), extrait de QuestionCard pour être réutilisé sans dupliquer la logique
 * ni dépendre du module de styles d'un composant parent en particulier.
 */
const HintToggle: React.FC<HintToggleProps> = ({ hint, brandColor }) => {
  const { identity } = useTheme();
  const [showHint, setShowHint] = useState(false);
  const color = brandColor || identity.palette.primary;
  const styles = useMemo(() => createStyles(identity, color), [identity, color]);

  if (!hint) return null;

  const hintIcon = (identity.icons?.hint || 'bulb-outline') as React.ComponentProps<typeof Ionicons>['name'];
  const hideHintIcon = (identity.icons?.hideHint || 'eye-off-outline') as React.ComponentProps<typeof Ionicons>['name'];

  return (
    <View style={styles.hintSection}>
      <TouchableOpacity
        style={styles.hintToggleButton}
        onPress={() => setShowHint(!showHint)}
        accessibilityRole="button"
        accessibilityLabel={showHint ? "Masquer l'indice" : "Besoin d'aide ?"}
        accessibilityState={{ expanded: showHint }}
      >
        <Ionicons
          name={showHint ? hideHintIcon : hintIcon}
          size={identity.iconSize?.md || 18}
          color={color}
        />
        <Text style={styles.hintToggleText}>
          {showHint ? "Masquer l'indice" : "Besoin d'aide ?"}
        </Text>
      </TouchableOpacity>

      {showHint && (
        <View style={styles.hintContent}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (identity: Identity, brandColor: string) => StyleSheet.create({
  hintSection: {
    marginTop: tokens.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: withOpacity(identity.text.tertiary, 0.05),
    paddingTop: tokens.spacing.lg,
  },
  hintToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: identity.ui.cardRadius || 20,
    borderWidth: 1.5,
    borderColor: brandColor,
    alignSelf: 'flex-start',
  },
  hintToggleText: {
    color: brandColor,
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.sm,
  },
  hintContent: {
    marginTop: tokens.spacing.md,
    padding: tokens.spacing.lg,
    borderRadius: (identity.ui.cardRadius || 16) * 0.75,
    backgroundColor: withOpacity(brandColor, 0.05),
    borderLeftWidth: 4,
    borderLeftColor: brandColor,
  },
  hintText: {
    color: identity.text.primary,
    fontSize: tokens.fontSize.lg,
    lineHeight: tokens.fontSize.lg * 1.6,
    fontStyle: 'normal',
  },
});

export default HintToggle;
