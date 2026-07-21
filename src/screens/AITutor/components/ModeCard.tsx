import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Identity } from '@/themes/ThemeContext';

interface ModeCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  features: readonly string[];
  onPress: () => void;
  styles: Record<string, object>;
  identity: Identity;
}

export const ModeCard: React.FC<ModeCardProps> = ({
  emoji,
  title,
  subtitle,
  description,
  features,
  onPress,
  styles,
  identity,
}) => {
  return (
    <View style={styles.modeCard}>
      <View style={styles.modeCardHeader}>
        <View style={styles.modeEmojiBg}>
          <Text style={styles.modeEmoji}>{emoji}</Text>
        </View>
        <View style={styles.modeCardTitles}>
          <Text style={styles.modeTitle}>{title}</Text>
          <Text style={styles.modeSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <Text style={styles.modeDescription}>{description}</Text>

      {features.map((feature, i) => (
        <View key={i} style={styles.featureRow}>
          <View style={styles.featureCheckSmall}>
            <Ionicons name="checkmark" size={12} color={identity.palette.primary} />
          </View>
          <Text style={styles.featureTextSmall}>{feature}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.modeButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.modeButtonText}>Démarrer</Text>
        <Ionicons name="arrow-forward" size={18} color={identity.text.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};
