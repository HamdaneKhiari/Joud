import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';

// Import des écrans de contenu
import VocabularyExerciseScreen from '@/screens/VocabularyScreen/VocabularyExerciceScreen';
import SentenceScreen from '@/screens/SentenceScreen/VocabularyExerciceScreen';
import ConnectorExerciseScreen from '@/screens/ConnectorScreen/ConnectorExerciseScreen';
import ReadingExerciseScreen from '@/screens/ReadingScreen/ReadingExerciseScreen';

export default function ExerciseDispatcher() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { identity } = useTheme();

  // 1. Récupération et normalisation des paramètres
  // Expo Router peut renvoyer string ou string[], on s'assure d'avoir une string
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const familyId = Array.isArray(params.familyId) ? params.familyId[0] : params.familyId;
  const levelId = Array.isArray(params.levelId) ? params.levelId[0] : params.levelId;

  // 2. Gestion du chargement ou erreur de paramètres
  if (!exerciseId || !familyId) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: identity.branding.surface || '#FFFFFF' // ✅ Fond dynamique
      }}>
        <ActivityIndicator size="large" color={identity.branding.accent} />
        <Text style={{ marginTop: 10, color: identity.branding.headerAccent }}>
          Chargement de l'exercice...
        </Text>
      </View>
    );
  }

  // 3. Adaptateur (Adapter Pattern)
  // On construit les props attendues par les écrans existants (navigation + route.params)
  // Cela évite de modifier VocabularyExerciseScreen pour l'instant.
  const screenProps = {
    navigation: navigation as any,
    route: {
      key: `exercise-${exerciseId}-${familyId}`,
      name: exerciseId === 'phrases' ? 'SentenceExercise' : 'VocabularyExercise',
      params: {
        familyId,
        levelId: levelId || '1'
      }
    } as any
  };

  // 4. Aiguillage (Switch) vers le bon composant
  switch (exerciseId) {
    case 'vocab':
      return <VocabularyExerciseScreen {...screenProps} />;

    case 'phrases':
      return <SentenceScreen {...screenProps} />;
    
    case 'connector':
      return <ConnectorExerciseScreen {...screenProps} />;

    case 'reading':
      return <ReadingExerciseScreen {...screenProps} />;
    
    case 'grammar':
      // On réutilise le moteur Connector qui gère parfaitement les QCM (Logic) et textes à trous
      return <ConnectorExerciseScreen {...screenProps} />;
    
    default:
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Type d'exercice non supporté : {exerciseId}</Text>
        </View>
      );
  }
}