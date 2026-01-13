import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/themes/ThemeContext';
import { UserProvider } from '../src/contexts/UserContext';
import { ProgressProvider } from '../src/contexts/ProgressContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ProgressProvider>
          <Stack screenOptions={{ headerShown: false }}>
          {/* Tabs (Accueil + Settings) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Écrans modaux/stack */}
          <Stack.Screen
            name="level/[levelId]"
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="family/[familyId]"
            options={{
              headerShown: false,
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
        </ProgressProvider>
      </UserProvider>
    </ThemeProvider>
  );
}