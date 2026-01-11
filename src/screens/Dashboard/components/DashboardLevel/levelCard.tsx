import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './levelCardStyle';
import { withOpacity } from '@/themes/tokens';

interface Level {
  id: number;
  title: string;
  badge?: string;
  icon: string;
  status: 'completed' | 'in_progress';
  completion: number;
}

interface LevelCardProps {
  level: Level;
  onPress: () => void;
  theme?: 'light' | 'dark';
}

/**
 * LevelCard - Version "Libre" avec thématisation complète
 * Tous les niveaux sont accessibles
 */
const LevelCard: React.FC<LevelCardProps> = ({ level, onPress, theme = 'light' }) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);
  const isDark = theme === 'dark';
  const isCompleted = level.status === 'completed';

  // Utilise la couleur principale de l'identité pour la structure
  const bgColor = identity.branding.main;

  // Messages d'encouragement adaptés à une progression libre
  const getEncouragement = (status: string, completion: number): string => {
    if (status === 'completed') return 'Niveau complété ⭐';
    if (completion >= 80) return 'Bientôt terminé !';
    if (completion >= 50) return 'À mi-parcours';
    if (completion > 0) return 'En cours';
    return 'Prêt à commencer ?';
  };

  const encouragement = getEncouragement(level.status, level.completion);

  return (
    <TouchableOpacity
      testID={`level-card-${level.id}`}
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        isDark && styles.cardDark,
        {
          backgroundColor: bgColor,
          borderColor: bgColor,
        },
      ]}
    >
      {/* Éléments décoratifs (si activés dans l'identité) */}
      {identity.ui.showDecorativeShapes && (
        <>
          <View style={styles.decorativeAccent} />
          <View style={styles.decorativeAccentSmall} />
        </>
      )}

      {/* Section Gauche - Icône & Textes */}
      <View style={styles.leftSection}>
        <Text style={styles.icon}>{level.icon}</Text>
        <View style={styles.infoSection}>
          <Text style={[styles.title, styles.titleLight]}>
            {level.title}
          </Text>
          {level.badge && (
            <Text style={[styles.badge, styles.badgeLight]}>
              {level.badge}
            </Text>
          )}
          <Text style={styles.encouragement}>
            {encouragement}
          </Text>
        </View>
      </View>

      {/* Section Droite - Statut ou Progression */}
      <View style={styles.rightSection}>
        {isCompleted ? (
          <Text style={styles.statusIcon}>✅</Text>
        ) : (
          <View style={styles.progressSection}>
            <Text style={[styles.progressText, styles.titleLight]}>
              {level.completion}%
            </Text>
            <View
              style={[
                styles.progressBar,
                isDark && styles.progressBarDark,
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${level.completion}%` },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default LevelCard;
