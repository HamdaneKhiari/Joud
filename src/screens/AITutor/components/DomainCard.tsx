import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import type { DomainSummary } from '../hooks/useGuidedDomainSummaries';

interface DomainCardProps {
  domain: DomainSummary;
  onPress: () => void;
}

const DomainCard: React.FC<DomainCardProps> = ({ domain, onPress }) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  const styles = useMemo(() => StyleSheet.create({
    card: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             tokens.spacing.md,
      padding:         tokens.spacing.lg,
      borderRadius:    isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
      backgroundColor: identity.palette.surface,
      borderWidth:     1,
      borderColor:     withOpacity(identity.palette.primary, 0.15),
      marginBottom:    tokens.spacing.md,
    },
    emojiBg: {
      width:           48,
      height:          48,
      borderRadius:    isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      backgroundColor: withOpacity(identity.palette.primary, 0.08),
      alignItems:      'center',
      justifyContent:  'center',
    },
    emoji: {
      fontSize: tokens.emojiSize.md,
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize:     tokens.fontSize.base,
      fontWeight:   tokens.fontWeight.bold,
      color:        identity.text.primary,
      marginBottom: tokens.spacing.xs,
    },
    subtitle: {
      fontSize:   tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color:      identity.text.secondary,
    },
  }), [identity, isPlayful]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.emojiBg}>
        <Text style={styles.emoji}>{domain.emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{domain.label}</Text>
        <Text style={styles.subtitle}>{domain.subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={identity.text.secondary} />
    </TouchableOpacity>
  );
};

export default DomainCard;
