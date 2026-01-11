import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/themes/ThemeContext';
import { UserProvider } from '../src/contexts/UserContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
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
      </UserProvider>
    </ThemeProvider>
  );
}