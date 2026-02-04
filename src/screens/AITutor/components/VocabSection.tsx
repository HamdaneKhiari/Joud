import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { RecentWord } from '../hooks/useVocabularyExposure';
import AIButtonWithResponse from './AIButtonWithResponse';

const VISIBLE_WORDS = 6;

interface VocabSectionProps {
  words:      RecentWord[];
  isLoading:  boolean;
  response:   string | null;
  onPractice: () => void;
}

const VocabSection: React.FC<VocabSectionProps> = ({ words, isLoading, response, onPractice }) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  const styles = useMemo(() => StyleSheet.create({
    section: {
      marginTop: tokens.spacing.lg,
    },
    sectionTitle: {
      fontSize:     tokens.fontSize.lg,
      fontWeight:   tokens.fontWeight.bold,
      color:        identity.text.primary,
      marginBottom: tokens.spacing.md,
    },
    card: {
      padding:         tokens.spacing.lg,
      borderRadius:    isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
      backgroundColor: identity.palette.surface,
      borderWidth:     1,
      borderColor:     withOpacity(identity.palette.primary, 0.15),
    },
    wordRow: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           tokens.spacing.sm,
      marginTop:     tokens.spacing.sm,
      marginBottom:  tokens.spacing.md,
    },
    wordChip: {
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical:   tokens.spacing.xs,
      borderRadius:      tokens.borderRadius.round,
      backgroundColor:   withOpacity(identity.palette.primary, 0.08),
    },
    wordChipText: {
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.semibold,
      color:      identity.text.primary,
    },
    moreText: {
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      color:      identity.text.tertiary,
      alignSelf:  'center' as const,
    },
  }), [identity, isPlayful]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vocabulaire à pratiquer</Text>

      <View style={styles.card}>
        <View style={styles.wordRow}>
          {words.slice(0, VISIBLE_WORDS).map((w, i) => (
            <View key={i} style={styles.wordChip}>
              <Text style={styles.wordChipText}>{w.word} → {w.translation}</Text>
            </View>
          ))}
          {words.length > VISIBLE_WORDS && (
            <Text style={styles.moreText}>+{words.length - VISIBLE_WORDS} autres</Text>
          )}
        </View>

        <AIButtonWithResponse
          buttonLabel="Entraîner avec l'IA"
          badgeLabel="Coach IA"
          isLoading={isLoading}
          response={response}
          onPress={onPractice}
        />
      </View>
    </View>
  );
};

export default VocabSection;
