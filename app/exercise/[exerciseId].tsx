import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';

// Import des écrans de contenu
import VocabularyExerciseScreen from '@/screens/VocabularyScreen/VocabularyExerciceScreen';

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
      name: 'VocabularyExercise',
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
    
    // Futurs cas à ajouter ici :
    // case 'grammar': return <GrammarExerciseScreen {...screenProps} />;
    
    default:
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Type d'exercice non supporté : {exerciseId}</Text>
        </View>
      );
  }
}