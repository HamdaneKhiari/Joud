// app/exercise/[exerciseId].tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';

// Import des écrans de contenu
import VocabularyExerciseScreen from '@/screens/VocabularyScreen/VocabularyExerciceScreen';
import SentenceScreen from '@/screens/SentenceScreen/SentenceExerciceScreen';
import ConnectorExerciseScreen from '@/screens/ConnectorScreen/ConnectorExerciseScreen';
import ReadingExerciseScreen from '@/screens/ReadingScreen/ReadingExerciseScreen';
import DialogueExerciseScreen from '@/screens/DialoguesScreen/DialogueExerciseScreen';
import WordGamesExerciseScreen from '@/screens/WordGames/WordGamesExerciseScreen';

export default function ExerciseDispatcher() {
  const params = useLocalSearchParams();
  const { identity } = useTheme();

  // Normalisation des paramètres (peuvent arriver en tableau si dupliqués dans l'URL)
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const familyId = Array.isArray(params.familyId) ? params.familyId[0] : params.familyId;
  const levelId = Array.isArray(params.levelId) ? params.levelId[0] : params.levelId;

  // Sécurité : on attend d'avoir toutes les clés. Chaque écran lit ensuite ses propres
  // params via useLocalSearchParams() — aucune prop à transmettre ici.
  if (!exerciseId || !levelId || !familyId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: identity.palette.surface || '#FFFFFF' }}>
        <ActivityIndicator size="large" color={identity.palette.accent} />
        <Text style={{ marginTop: 10, color: identity.header.accent }}>Initialisation...</Text>
      </View>
    );
  }

  switch (exerciseId) {
    case 'vocab':
      return <VocabularyExerciseScreen />;

    case 'phrases':
    case 'phrase_types':
      return <SentenceScreen />;

    case 'reading':
      return <ReadingExerciseScreen />;

    case 'dialogues':
      return <DialogueExerciseScreen />;

    case 'connector':
      return <ConnectorExerciseScreen />;

    case 'word_games':
      return <WordGamesExerciseScreen />;

    default:
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Type d'exercice non supporté : {exerciseId}</Text>
        </View>
      );
  }
}