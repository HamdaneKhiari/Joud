/**
 * ============================================
 * DashboardCard - Composant Générique
 * 100% White Label - Aucune couleur en dur
 * ============================================
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './styles';

interface DashboardCardProps {
  icon: string; // Emoji
  title: string;
  subtitle?: string;
  buttonText?: string;
  variantColor: 'primary' | 'accent'; // Clé stricte du palette (primary ou accent)
  onPress?: () => void;
  children?: React.ReactNode;
  showArrow?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  subtitle,
  buttonText,
  variantColor,
  onPress,
  children,
  showArrow = true,
}) => {
  const { identity } = useTheme();
  const styles = createStyles(identity, variantColor);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {/* Cercles décoratifs (signature visuelle) */}
      <View style={styles.decorativeCircle} />
      <View style={styles.decorativeCircleSmall} />

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseIcon}>{icon}</Text>
          <View>
            <Text style={styles.exerciseTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.levelText}>{subtitle}</Text>
            )}
          </View>
        </View>

        {/* Flèche indicateur */}
        {showArrow && onPress && (
          <Text style={styles.arrowIndicator}>➔</Text>
        )}
      </View>

      {/* Contenu custom (optionnel) */}
      {children}

      {/* Bouton CTA (si fourni) */}
      {buttonText && (
        <View style={styles.button}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default DashboardCard;
