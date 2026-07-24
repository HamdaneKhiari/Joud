import React, { useMemo } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './metricsStyle';

interface MetricCardProps {
  emoji?: string;
  badgeLabel?: string;
  value: string | number;
  label: string;
  isDark: boolean;
  variant?: 'wordsLearned' | 'badges' | 'streak';
  animationDelay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  emoji,
  badgeLabel,
  value,
  label,
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

  const labelVariantKey = variant ? `label${variant.charAt(0).toUpperCase() + variant.slice(1)}` : null;
  const labelVariantStyle = labelVariantKey ? styles[labelVariantKey as keyof ReturnType<typeof createStyles>] : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(animationDelay).springify().reduceMotion(ReduceMotion.System)}
      style={[
        styles.card,
        isDark && styles.cardDark,
        cardStyle as ViewStyle,
      ]}
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
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

  // Badges uniquement pour Primary et College
  const isStudent = ['primary', 'college'].includes(identity.id);

  const styles = useMemo(() => createStyles(identity), [identity]);

  return (
    <View style={styles.container}>
      <MetricCard
        badgeLabel="MOTS"
        value={metrics.wordsLearned}
        label="Mots appris"
        isDark={isDark}
        variant="wordsLearned"
        animationDelay={0}
      />

      {isStudent && (
        <MetricCard
          badgeLabel="RÉCOMPENSES"
          value={metrics.badges}
          label="Badges"
          isDark={isDark}
          variant="badges"
          animationDelay={100}
        />
      )}

      <MetricCard
        badgeLabel="SÉRIE"
        value={metrics.streak}
        label="Jours"
        isDark={isDark}
        variant="streak"
        animationDelay={isStudent ? 200 : 100}
      />
    </View>
  );
};

export default MetricsSection;
