import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { ErrorsByModule, MODULE_LABELS } from '../hooks/useStudentAnalysis';
import { formatRelativeTime } from '../helpers';

interface ErrorModuleCardProps {
  module:  ErrorsByModule;
  onPress: () => void;
}

const ErrorModuleCard: React.FC<ErrorModuleCardProps> = ({ module, onPress }) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';
  const meta = MODULE_LABELS[module.moduleSlug];

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
    badge: {
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical:   tokens.spacing.xs,
      borderRadius:      tokens.borderRadius.round,
      backgroundColor:   withOpacity(identity.palette.accent, 0.15),
    },
    badgeText: {
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.palette.accent,
    },
  }), [identity, isPlayful]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.emojiBg}>
        <Text style={styles.emoji}>{meta?.emoji || '📝'}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{meta?.label || module.moduleSlug}</Text>
        <Text style={styles.subtitle}>
          Dernière erreur : {formatRelativeTime(module.lastErrorDate)}
        </Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {module.errorCount} erreur{module.errorCount > 1 ? 's' : ''}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={identity.text.secondary} />
    </TouchableOpacity>
  );
};

export default ErrorModuleCard;
