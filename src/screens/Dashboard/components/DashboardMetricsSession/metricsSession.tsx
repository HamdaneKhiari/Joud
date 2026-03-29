import React, { useMemo } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './metricsStyle';

interface MetricCardProps {
  emoji?: string; // ✅ Optionnel (No-Media)
  badgeLabel?: string; // ✅ Label typographique premium
  value: string | number;
  label: string;
  encouragement?: string;
  isDark: boolean;
  variant?: 'wordsLearned' | 'badges' | 'streak';
  animationDelay?: number;
}

/**
 * MetricCard - Une carte metric individuelle (Animated)
 */
const MetricCard: React.FC<MetricCardProps> = ({
  emoji,
  badgeLabel,
  value,
  label,
  encouragement: _encouragement,
  isDark,
  variant,
  animationDelay = 0
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  const variantKey = variant ? variant.charAt(0).toUpperCase() + variant.slice(1) : '';
  const cardStyleKey = `card${variantKey}` as keyof ReturnType<typeof createStyles>;
  const cardStyle = variantKey && cardStyleKey in styles ? styles[cardStyleKey] : null;
  const valueStyleKey = `value${variantKey}` as keyof ReturnType<typeof createStyles>;
  const valueStyle = variantKey && valueStyleKey in styles ? styles[valueStyleKey] : null;

  const _hasVariant = !!variant;
  const labelVariantKey = variant ? `label${variant.charAt(0).toUpperCase() + variant.slice(1)}` : null;
  const labelVariantStyle = labelVariantKey ? styles[labelVariantKey as keyof ReturnType<typeof createStyles>] : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(animationDelay).springify()}
      style={[
        styles.card,
        isDark && styles.cardDark,
        cardStyle as ViewStyle,
      ]}
    >
      {/* ✅ Badge typographique au lieu d'emoji */}
      {badgeLabel && <Text style={styles.badgeLabel}>{badgeLabel}</Text>}
      {emoji && !badgeLabel && <Text style={styles.emoji}>{emoji}</Text>}
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
      {/* ✅ ENCOURAGEMENT DÉSACTIVÉ - Gagne de l'espace */}
      {/* {encouragement && (
        <Text style={[
          styles.encouragement,
          isDark && styles.encouragementDark,
          hasVariant && styles.encouragementLight,
        ]}>
          {encouragement}
        </Text>
      )} */}
    </Animated.View>
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
      { threshold: 5, text: 'Excellents résultats' },
      { threshold: 3, text: 'Bonne progression' },
      { threshold: 1, text: 'Premiers acquis' }
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
        badgeLabel="WORDS"
        value={metrics.wordsLearned}
        label="Mots appris"
        encouragement={getEncouragement(metrics.wordsLearned, 'wordsLearned')}
        isDark={isDark}
        variant="wordsLearned"
        animationDelay={0}
      />

      {/* Badges uniquement pour Primary et College */}
      {isStudent && (
        <MetricCard
          badgeLabel="AWARDS"
          value={metrics.badges}
          label="Badges"
          encouragement={getEncouragement(metrics.badges, 'badges')}
          isDark={isDark}
          variant="badges"
          animationDelay={100}
        />
      )}

      <MetricCard
        badgeLabel="STREAK"
        value={metrics.streak}
        label="Jours"
        encouragement={getEncouragement(metrics.streak, 'streak')}
        isDark={isDark}
        variant="streak"
        animationDelay={isStudent ? 200 : 100}
      />
    </View>
  );
};

export default MetricsSection;
