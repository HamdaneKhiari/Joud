// src/screens/Dashboard/components/LevelCard.js
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/levelCardStyle';
import { getLevelColor, baseColors } from '@themes/colors';
import { withOpacity } from '@themes/tokens';

/**
 * LevelCard - Version "Libre" (Tous les niveaux accessibles)
 * Supprime la notion de verrouillage pour une expérience plus fluide.
 */
const LevelCard = ({ level, onPress, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const isCompleted = level.status === 'completed';
  
  // Puisque tout est accessible, on simplifie les constantes
  const bgColor = getLevelColor(level.id);

  // Messages d'encouragement adaptés à une progression libre
  const getEncouragement = (status, completion) => {
    if (status === 'completed') return 'Niveau complété ⭐';
    if (completion >= 80) return 'Bientôt terminé !';
    if (completion >= 50) return 'À mi-parcours';
    if (completion > 0) return 'En cours';
    return 'Prêt à commencer ?'; // Pour les niveaux à 0%
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
      {/* Éléments décoratifs (toujours visibles car niveau toujours actif) */}
      <View style={styles.decorativeAccent} />
      <View style={styles.decorativeAccentSmall} />

      {/* Section Gauche - Icône & Textes */}
      <View style={styles.leftSection}>
        <Text style={styles.icon}>{level.icon}</Text>
        <View style={styles.infoSection}>
          <Text style={[styles.title, styles.titleLight]}>
            {level.title}
          </Text>
          <Text style={[styles.badge, styles.badgeLight]}>
            {level.badge}
          </Text>
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
                {
                  backgroundColor: withOpacity(baseColors.white, 0.3),
                  borderColor: withOpacity(baseColors.white, 0.2),
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${level.completion}%`, backgroundColor: baseColors.white },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

LevelCard.propTypes = {
  level: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    badge: PropTypes.string,
    icon: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['completed', 'in_progress']).isRequired, // "locked" supprimé
    completion: PropTypes.number.isRequired,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['light', 'dark']),
};

LevelCard.defaultProps = {
  theme: 'light',
};

export default LevelCard;