import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

interface FeedbackBannerProps {
  isCorrect: boolean;
  message: string;
}

const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ isCorrect, message }) => {
  const { identity } = useTheme();
  
  // Utilisation des couleurs AI de l'identité ou fallback
  const statusColor = isCorrect ? identity.ai?.success || '#22C55E' : identity.ai?.error || '#EF4444';

  return (
    <View style={[
      styles.container, 
      { backgroundColor: withOpacity(statusColor, 0.1), borderColor: withOpacity(statusColor, 0.3) }
    ]}>
      <Text style={styles.icon}>{isCorrect ? '✅' : '❌'}</Text>
      <Text style={[styles.text, { color: statusColor, fontFamily: identity.typography?.families?.primary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: tokens.spacing.md,
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    borderWidth: 1,
  },
  icon: { fontSize: tokens.fontSize.lg },
  text: { fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.bold, flex: 1 },
});

export default FeedbackBanner;