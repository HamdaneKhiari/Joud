import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/themes/ThemeContext';
import { UserProvider } from '../src/contexts/UserContext';
import { ProgressProvider } from '../src/contexts/ProgressContext';
import { AIProvider } from '../src/contexts/AIContext';
import { CurrentLevelProvider } from '../src/contexts/CurrentLevelContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
        <ProgressProvider>
          <AIProvider>
          <CurrentLevelProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* 0. Onboarding (premier lancement) */}
            <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />

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
              name="subfamily/[subfamilyId]"
              options={{
                headerShown: false,
                presentation: 'card',
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
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="ai-tutor/free"
              options={{ headerShown: false, presentation: 'card' }}
            />
            <Stack.Screen
              name="ai-tutor/guided"
              options={{ headerShown: false, presentation: 'card' }}
            />
          </Stack>
          </CurrentLevelProvider>
          </AIProvider>
        </ProgressProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
