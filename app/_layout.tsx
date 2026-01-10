import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../src/database/init';

export default function RootLayout() {
  useEffect(() => {
    // Initialisation de la base au démarrage
    initDatabase().catch((error) => {
      console.error('❌ Erreur initialisation DB:', error);
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs (Accueil + Settings) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Écrans modaux/stack */}
      <Stack.Screen 
        name="level/[levelId]" 
        options={{ 
          headerShown: true,
          title: 'Choisis ta famille',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="family/[familyId]" 
        options={{ 
          headerShown: true,
          title: 'Exercices',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="revision/index" 
        options={{ 
          headerShown: true,
          title: 'Révision',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="ai-tutor/index" 
        options={{ 
          headerShown: true,
          title: 'AI Tutor',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="exercise/[exerciseId]" 
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal'
        }} 
      />
    </Stack>
  );
}