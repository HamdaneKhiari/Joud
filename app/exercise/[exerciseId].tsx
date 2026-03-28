// app/exercise/[exerciseId].tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';

// Import des écrans de contenu
import VocabularyExerciseScreen from '@/screens/VocabularyScreen/VocabularyExerciceScreen';
import SentenceScreen from '@/screens/SentenceScreen/SentenceExerciceScreen';
import ConnectorExerciseScreen from '@/screens/ConnectorScreen/ConnectorExerciseScreen';
import ReadingExerciseScreen from '@/screens/ReadingScreen/ReadingExerciseScreen';
import DialogueExerciseScreen from '@/screens/DialoguesScreen/DialogueExerciseScreen';
import WordGamesExerciseScreen from '@/screens/WordGames/WordGamesExerciseScreen';
import GrammarExerciseScreen from '@/screens/GrammarScreen/GrammarExerciseScreen';

export default function ExerciseDispatcher() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { identity } = useTheme();

  // 1. Normalisation des paramètres
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const familyId = Array.isArray(params.familyId) ? params.familyId[0] : params.familyId;
  const levelId = Array.isArray(params.levelId) ? params.levelId[0] : params.levelId;
  const subfamilyId = Array.isArray(params.subfamilyId) ? params.subfamilyId[0] : params.subfamilyId;

  // 2. Sécurité : On attend d'avoir toutes les clés
  if (!exerciseId || !levelId || !familyId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: identity.palette.surface || '#FFFFFF' }}>
        <ActivityIndicator size="large" color={identity.palette.accent} />
        <Text style={{ marginTop: 10, color: identity.header.accent }}>Initialisation...</Text>
      </View>
    );
  }

  // 3. Préparation des Props (Transmission de familyId, levelId, subfamilyId et exerciseType)
  const screenProps = {
    navigation: navigation as any,
    route: {
      key: `exercise-${exerciseId}-${familyId || '0'}-${levelId}-${subfamilyId || '0'}`,
      params: {
        familyId: Number(familyId || 0),
        levelId: Number(levelId),
        subfamilyId: subfamilyId ? Number(subfamilyId) : 0,
        exerciseType: exerciseId,
      }
    } as any
  };

  // 4. Switch Complet
  switch (exerciseId) {
    case 'vocab':
      return <VocabularyExerciseScreen {...(screenProps as any)} />;

    case 'phrases':
    case 'phrase_types':
      return <SentenceScreen {...(screenProps as any)} />;

    case 'grammar':
      return <GrammarExerciseScreen {...(screenProps as any)} />;

    case 'reading':
      return <ReadingExerciseScreen {...(screenProps as any)} />;

    case 'dialogues':
      return <DialogueExerciseScreen {...(screenProps as any)} />;

    case 'connector':
      return <ConnectorExerciseScreen {...(screenProps as any)} />;

    case 'word_games':
      return <WordGamesExerciseScreen {...(screenProps as any)} />;

    default:
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Type d'exercice non supporté : {exerciseId}</Text>
        </View>
      );
  }
}