import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';

interface ExerciseEmptyStateProps {
  onBack: () => void;
  headerTitle?: string;
  heading?: string;
  message?: string;
  emoji?: string;
}

const ExerciseEmptyState: React.FC<ExerciseEmptyStateProps> = ({
  onBack,
  headerTitle,
  heading,
  message = 'Aucun contenu disponible pour ce niveau.',
  emoji,
}) => {
  const { identity } = useTheme();

  return (
    <ExerciseLayout
      headerProps={{
        variant: 'exercise',
        onBack,
        exerciseTitle: headerTitle,
      }}
    >
      <View style={styles.container}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        {heading ? (
          <Text style={[styles.heading, { color: identity.text.primary }]}>{heading}</Text>
        ) : null}
        <Text style={[styles.message, { color: identity.text.primary }]}>{message}</Text>
      </View>
    </ExerciseLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emoji: { fontSize: 32, marginBottom: 16 },
  heading: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 16, textAlign: 'center' },
});

export default ExerciseEmptyState;
