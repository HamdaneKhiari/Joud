import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/themes/ThemeContext';
import { UserProvider } from '../src/contexts/UserContext';
import { ProgressProvider } from '../src/contexts/ProgressContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
        <ProgressProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* 1. Dashboard (Menu principal) */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* 2. Sélection de la Famille (ex: Vocab -> Colors, Food...) */}
            <Stack.Screen
              name="family/[familyId]"
              options={{
                headerShown: false,
                presentation: 'card'
              }}
            />

            {/* 3. NOUVEAU : Sélection de la Sous-Famille (ex: Colors -> Partie 1, Partie 2...) */}
            <Stack.Screen
              name="subfamily/[familyId]"
              options={{
                headerShown: false,
                presentation: 'card', // On garde l'animation card pour la continuité
              }}
            />

            {/* 4. L'exercice lui-même */}
            <Stack.Screen
              name="exercise/[exerciseId]"
              options={{
                headerShown: false,
                presentation: 'fullScreenModal'
              }}
            />

            {/* Autres écrans */}
            <Stack.Screen
              name="level/[levelId]"
              options={{ headerShown: false, presentation: 'card' }}
            />
            <Stack.Screen
              name="revision/index"
              options={{ headerShown: true, title: 'Révision' }}
            />
            <Stack.Screen
              name="ai-tutor/index"
              options={{ headerShown: true, title: 'AI Tutor', presentation: 'modal' }}
            />
          </Stack>
        </ProgressProvider>
      </ThemeProvider>
    </UserProvider>
  );
}