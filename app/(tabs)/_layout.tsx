import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';

/**
 * 1. COMPOSANTS D'ICÔNES EXTRAITS (Fix SonarLint S6478)
 * On définit les icônes en dehors du composant principal
 */
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="home" size={size} color={color} />
);

const SettingsIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="settings" size={size} color={color} />
);

export default function TabsLayout() {
  const { identity } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // ✅ Utilisation de l'identité White Label
        tabBarActiveTintColor: identity.palette.primary,
        tabBarInactiveTintColor: identity.palette.accent + '80', // 50% d'opacité
        tabBarStyle: {
          backgroundColor: identity.palette.surface,
          borderTopWidth: 1,
          borderTopColor: identity.palette.background,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          // ✅ Mood adaptatif (arrondi si playful, droit si clean)
          borderTopLeftRadius: identity.ui.mood === 'playful' ? 20 : 0,
          borderTopRightRadius: identity.ui.mood === 'playful' ? 20 : 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: HomeIcon, // ✅ On passe la référence (pas une fonction anonyme)
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: SettingsIcon, // ✅ On passe la référence
        }}
      />
    </Tabs>
  );
}