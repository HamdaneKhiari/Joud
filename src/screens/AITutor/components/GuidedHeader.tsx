import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

interface GuidedHeaderProps {
  onBack:       () => void;
  totalErrors?: number;
  moduleCount?: number;
  subtitle?:    string;
}

const GuidedHeader: React.FC<GuidedHeaderProps> = ({ onBack, totalErrors = 0, moduleCount = 0, subtitle }) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  const styles = useMemo(() => StyleSheet.create({
    header: {
      backgroundColor:   identity.palette.primary,
      paddingTop:        tokens.spacing.md,
      paddingBottom:     tokens.spacing.xl,
      paddingHorizontal: tokens.spacing.xl,
    },
    topRow: {
      flexDirection: 'row',
      alignItems:    'center',
      marginBottom:  tokens.spacing.lg,
    },
    title: {
      flex:       1,
      fontSize:   tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.text.onPrimary,
      textAlign:  isPlayful ? 'center' : 'left',
    },
    emoji: {
      fontSize: tokens.emojiSize.md,
    },
    pill: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'center',
      gap:               tokens.spacing.lg,
      backgroundColor:   withOpacity(identity.text.onPrimary, 0.15),
      borderRadius:      tokens.borderRadius.round,
      paddingHorizontal: tokens.spacing.xl,
      paddingVertical:   tokens.spacing.sm,
      alignSelf:         isPlayful ? 'center' : 'flex-start',
    },
    pillItem: {
      alignItems: 'center',
      gap:        tokens.spacing.xs,
    },
    pillNumber: {
      fontSize:   tokens.fontSize.xxl,
      fontWeight: tokens.fontWeight.black,
      color:      identity.text.onPrimary,
    },
    pillLabel: {
      fontSize:      tokens.fontSize.xs,
      fontWeight:    tokens.fontWeight.semibold,
      color:         withOpacity(identity.text.onPrimary, 0.7),
      textTransform: 'uppercase',
    },
    pillDivider: {
      width:           1,
      height:          28,
      backgroundColor: withOpacity(identity.text.onPrimary, 0.25),
    },
    subtitleText: {
      fontSize:   tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color:      withOpacity(identity.text.onPrimary, 0.8),
      textAlign:  isPlayful ? 'center' : 'left',
    },
  }), [identity, isPlayful]);

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={identity.text.onPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Coach IA</Text>
        <Text style={styles.emoji}>🤖</Text>
      </View>

      {subtitle && (
        <Text style={styles.subtitleText}>{subtitle}</Text>
      )}

      {!subtitle && totalErrors > 0 && (
        <View style={styles.pill}>
          <View style={styles.pillItem}>
            <Text style={styles.pillNumber}>{totalErrors}</Text>
            <Text style={styles.pillLabel}>Erreurs</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pillItem}>
            <Text style={styles.pillNumber}>{moduleCount}</Text>
            <Text style={styles.pillLabel}>Modules</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default GuidedHeader;
