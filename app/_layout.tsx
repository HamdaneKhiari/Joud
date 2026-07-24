import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/themes/ThemeContext';
import { UserProvider } from '../src/contexts/UserContext';
import { ProgressProvider } from '../src/contexts/ProgressContext';
import { AIProvider } from '../src/contexts/AIContext';
import { CurrentLevelProvider } from '../src/contexts/CurrentLevelContext';

// Fonts — Nunito (primary), Poppins (college), DM Sans (lycee), Inter (adult)
// Import each variant directly from its subdirectory to avoid Metro resolving all font files
import { useFonts } from 'expo-font';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins/800ExtraBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';

import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_900Black,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
    <UserProvider>
      <ThemeProvider>
        <ProgressProvider>
          <AIProvider>
          <CurrentLevelProvider>
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            {/* 0. Onboarding (premier lancement) */}
            <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />

            {/* 1. Dashboard (Menu principal) */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />

            {/* 2. Sélection de la Famille (ex: Vocab -> Colors, Food...) */}
            <Stack.Screen
              name="family/[familyId]"
              options={{
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />

            {/* 3. Sélection de la Sous-Famille */}
            <Stack.Screen
              name="subfamily/[subfamilyId]"
              options={{
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />

            {/* 4. L'exercice lui-même */}
            <Stack.Screen
              name="exercise/[exerciseId]"
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />

            {/* Autres écrans */}
            <Stack.Screen
              name="level/[levelId]"
              options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="revision/index"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ai-tutor/index"
              options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="ai-tutor/free"
              options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ai-tutor/guided"
              options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
            />
          </Stack>
          </CurrentLevelProvider>
          </AIProvider>
        </ProgressProvider>
      </ThemeProvider>
    </UserProvider>
    </ErrorBoundary>
  );
}
