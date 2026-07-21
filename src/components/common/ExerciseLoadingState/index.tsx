import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';

interface ExerciseLoadingStateProps {
  onBack: () => void;
  headerTitle?: string;
  message?: string;
}

const ExerciseLoadingState: React.FC<ExerciseLoadingStateProps> = ({
  onBack,
  headerTitle = 'Chargement...',
  message,
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
        <ActivityIndicator size="large" color={identity.palette.primary} />
        {message ? (
          <Text style={[styles.message, { color: identity.text.secondary }]}>{message}</Text>
        ) : null}
      </View>
    </ExerciseLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { marginTop: 10 },
});

export default ExerciseLoadingState;
