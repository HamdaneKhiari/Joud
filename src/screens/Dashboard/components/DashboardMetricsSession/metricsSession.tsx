import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './metricsStyle';

interface MetricCardProps {
  emoji: string;
  value: string | number;
  label: string;
  encouragement?: string;
  isDark: boolean;
  variant?: 'wordsLearned' | 'badges' | 'streak';
}

/**
 * MetricCard - Une carte metric individuelle
 */
const MetricCard: React.FC<MetricCardProps> = ({
  emoji,
  value,
  label,
  encouragement,
  isDark,
  variant
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  const variantKey = variant ? variant.charAt(0).toUpperCase() + variant.slice(1) : '';
  const cardStyle = variantKey ? styles[`card${variantKey}` as keyof ReturnType<typeof createStyles>] : null;
  const valueStyle = variantKey ? styles[`value${variantKey}` as keyof ReturnType<typeof createStyles>] : null;

  const hasVariant = !!variant;
  const labelVariantKey = variant ? `label${variant.charAt(0).toUpperCase() + variant.slice(1)}` : null;
  const labelVariantStyle = labelVariantKey ? styles[labelVariantKey as keyof ReturnType<typeof createStyles>] : null;

  return (
    <View style={[
      styles.card,
      isDark && styles.cardDark,
      cardStyle,
    ]}>
      {/* Éléments décoratifs modernes */}
      {hasVariant && identity.ui.showDecorativeShapes && (
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

interface Metrics {
  wordsLearned: number;
  badges: number;
  streak: number;
}

interface MetricsSectionProps {
  metrics?: Metrics;
  theme?: 'light' | 'dark';
}

/**
 * MetricsSection - Affiche les métriques principales
 * Pour Primary & College : 3 métriques (mots, badges, série)
 * Pour Lycée & Adult : 2 métriques (mots, série) - PAS de badges
 */
const MetricsSection: React.FC<MetricsSectionProps> = ({
  metrics = { wordsLearned: 0, badges: 0, streak: 0 },
  theme = 'light'
}) => {
  const { identity } = useTheme();
  const isDark = theme === 'dark';

  // Logique conditionnelle : badges uniquement pour Primary et College
  const isStudent = ['primary', 'college'].includes(identity.id);

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

  const getEncouragement = (value: number, type: keyof typeof ENCOURAGEMENT_RULES) => {
    const rules = ENCOURAGEMENT_RULES[type];
    if (!rules) return undefined;

    const match = rules.find(rule => value >= rule.threshold);
    return match ? match.text : undefined;
  };

  const styles = useMemo(() => createStyles(identity), [identity]);

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

      {/* Badges uniquement pour Primary et College */}
      {isStudent && (
        <MetricCard
          emoji="🏆"
          value={metrics.badges}
          label="Badges"
          encouragement={getEncouragement(metrics.badges, 'badges')}
          isDark={isDark}
          variant="badges"
        />
      )}

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

export default MetricsSection;
