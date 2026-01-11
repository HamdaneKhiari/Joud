import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types'; // Ajout de l'import
import { styles } from '../styles/metricsStyle';

/**
 * MetricCard - Une carte metric individuelle
 */
const MetricCard = ({ 
  emoji, 
  value, 
  label, 
  encouragement,
  isDark,
  variant 
}) => {
  // Utilisation de l'optional chaining et simplification du formatage de style
  const variantKey = variant ? variant.charAt(0).toUpperCase() + variant.slice(1) : '';
  const cardStyle = variantKey ? styles[`card${variantKey}`] : null;
  const valueStyle = variantKey ? styles[`value${variantKey}`] : null;

  // Déterminer si la card a un variant pour appliquer le style light
  const hasVariant = !!variant;
  const labelVariantKey = variant ? `label${variant.charAt(0).toUpperCase() + variant.slice(1)}` : null;
  const labelVariantStyle = labelVariantKey ? styles[labelVariantKey] : null;

  return (
    <View style={[
      styles.card,
      isDark && styles.cardDark,
      cardStyle,
    ]}>
      {/* Éléments décoratifs modernes */}
      {hasVariant && (
        <>
          <View style={styles.decorativeShape} />
          <View style={styles.decorativeShapeSmall} />
        </>
      )}

      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[
        styles.value,
        isDark && styles.valueDark,
        valueStyle,
      ]}>
        {value}
      </Text>
      <Text style={[
        styles.label,
        isDark && styles.labelDark,
        labelVariantStyle,
      ]}>
        {label}
      </Text>
      {encouragement && (
        <Text style={[
          styles.encouragement,
          isDark && styles.encouragementDark,
          hasVariant && styles.encouragementLight,
        ]}>
          {encouragement}
        </Text>
      )}
    </View>
  );
};

// Validation des props pour MetricCard (Supprime les erreurs Reliability)
MetricCard.propTypes = {
  emoji: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  encouragement: PropTypes.string,
  isDark: PropTypes.bool,
  variant: PropTypes.oneOf(['wordsLearned', 'badges', 'streak']),
};

/**
 * MetricsSection - Affiche les 3 métriques principales
 */
const MetricsSection = ({ 
  metrics = { wordsLearned: 0, badges: 0, streak: 0 },
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  // SOLUTION À LA COMPLEXITÉ COGNITIVE (S3776)
  // On utilise un dictionnaire de données au lieu de IF/ELSE imbriqués
  const ENCOURAGEMENT_RULES = {
    wordsLearned: [
      { threshold: 500, text: 'Excellente maîtrise' },
      { threshold: 200, text: 'Bon vocabulaire' },
      { threshold: 50, text: 'Progression solide' },
      { threshold: 0, text: 'Bon départ' }
    ],
    badges: [
      { threshold: 5, text: '🏆 Excellents résultats' },
      { threshold: 3, text: '⭐ Bonne progression' },
      { threshold: 1, text: '🎯 Premiers acquis' }
    ],
    streak: [
      { threshold: 30, text: 'Régularité exemplaire' },
      { threshold: 14, text: 'Excellent rythme' },
      { threshold: 7, text: 'Bonne assiduité' },
      { threshold: 3, text: 'Continue ainsi' },
      { threshold: 0, text: 'Bon début' }
    ]
  };

  const getEncouragement = (value, type) => {
    const rules = ENCOURAGEMENT_RULES[type];
    if (!rules) return null;
    
    // On trouve la première règle qui correspond (plus propre et lisible)
    const match = rules.find(rule => value >= rule.threshold);
    return match ? match.text : null;
  };

  return (
    <View style={styles.container}>
      <MetricCard
        emoji="📚"
        value={metrics.wordsLearned}
        label="Mots appris"
        encouragement={getEncouragement(metrics.wordsLearned, 'wordsLearned')}
        isDark={isDark}
        variant="wordsLearned"
      />
      <MetricCard
        emoji="🏆"
        value={metrics.badges}
        label="Badges"
        encouragement={getEncouragement(metrics.badges, 'badges')}
        isDark={isDark}
        variant="badges"
      />
      <MetricCard
        emoji="🔥"
        value={metrics.streak}
        label="Jours"
        encouragement={getEncouragement(metrics.streak, 'streak')}
        isDark={isDark}
        variant="streak"
      />
    </View>
  );
};

// Validation des props pour MetricsSection
MetricsSection.propTypes = {
  metrics: PropTypes.shape({
    wordsLearned: PropTypes.number,
    badges: PropTypes.number,
    streak: PropTypes.number,
  }),
  theme: PropTypes.string,
};

export default MetricsSection;