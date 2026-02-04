import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { ErrorsByModule, MODULE_LABELS } from '../hooks/useStudentAnalysis';
import { formatRelativeTime } from '../helpers';
import AIButtonWithResponse from './AIButtonWithResponse';

const SUCCESS_COLOR = '#16A34A';

interface ErrorDetailViewProps {
  module:      ErrorsByModule;
  isAILoading: boolean;
  aiResponse:  string | null;
  onConsultAI: () => void;
}

const ErrorDetailView: React.FC<ErrorDetailViewProps> = ({
  module,
  isAILoading,
  aiResponse,
  onConsultAI,
}) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';
  const meta = MODULE_LABELS[module.moduleSlug];

  const styles = useMemo(() => StyleSheet.create({
    content: {
      flex:              1,
      paddingHorizontal: tokens.spacing.xl,
      paddingTop:        tokens.spacing.lg,
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           tokens.spacing.md,
      marginBottom:  tokens.spacing.lg,
    },
    detailTitle: {
      fontSize:   tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.text.primary,
    },
    detailCount: {
      fontSize:          tokens.fontSize.sm,
      fontWeight:        tokens.fontWeight.semibold,
      color:             identity.palette.accent,
      backgroundColor:   withOpacity(identity.palette.accent, 0.15),
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical:   tokens.spacing.xs,
      borderRadius:      tokens.borderRadius.round,
    },
    errorCard: {
      padding:         tokens.spacing.md,
      borderRadius:    isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      backgroundColor: identity.palette.surface,
      borderWidth:     1,
      borderColor:     withOpacity(identity.aiDiagnostic.error, 0.3),
      marginBottom:    tokens.spacing.sm,
    },
    errorQuestion: {
      fontSize:     tokens.fontSize.sm,
      fontWeight:   tokens.fontWeight.bold,
      color:        identity.text.primary,
      marginBottom: tokens.spacing.sm,
    },
    errorRow: {
      flexDirection: 'row',
      gap:           tokens.spacing.sm,
      marginBottom:  tokens.spacing.xs,
    },
    errorLabel: {
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      width:      56,
    },
    errorValue: {
      flex:       1,
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
    },
    errorTime: {
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      color:      identity.text.tertiary,
      marginTop:  tokens.spacing.xs,
    },
    aiButtonContainer: {
      marginTop:    tokens.spacing.lg,
      marginBottom: tokens.spacing.xl,
    },
  }), [identity, isPlayful]);

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.detailHeader}>
        <Text style={{ fontSize: tokens.emojiSize.lg }}>{meta?.emoji}</Text>
        <Text style={styles.detailTitle}>{meta?.label}</Text>
        <Text style={styles.detailCount}>
          {module.errorCount} erreur{module.errorCount > 1 ? 's' : ''}
        </Text>
      </View>

      {module.errors.map((error, index) => (
        <View key={index} style={styles.errorCard}>
          <Text style={styles.errorQuestion}>{error.question}</Text>
          <View style={styles.errorRow}>
            <Text style={[styles.errorLabel, { color: identity.aiDiagnostic.error }]}>Toi :</Text>
            <Text style={[styles.errorValue, { color: identity.aiDiagnostic.error }]}>{error.userAnswer}</Text>
          </View>
          <View style={styles.errorRow}>
            <Text style={[styles.errorLabel, { color: SUCCESS_COLOR }]}>Correct :</Text>
            <Text style={[styles.errorValue, { color: SUCCESS_COLOR }]}>{error.correctAnswer}</Text>
          </View>
          <Text style={styles.errorTime}>{formatRelativeTime(error.timestamp)}</Text>
        </View>
      ))}

      <View style={styles.aiButtonContainer}>
        <AIButtonWithResponse
          buttonLabel="Consulter l'IA"
          badgeLabel="Analyse IA"
          isLoading={isAILoading}
          response={aiResponse}
          onPress={onConsultAI}
        />
      </View>
    </ScrollView>
  );
};

export default ErrorDetailView;
