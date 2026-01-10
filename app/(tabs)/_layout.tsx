import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Composants d'icônes extraits (fix SonarLint)
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="home" size={size} color={color} />
);

const SettingsIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="settings" size={size} color={color} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* Tab Accueil (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: HomeIcon,
        }}
      />

      {/* Tab Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tabs>
  );
}