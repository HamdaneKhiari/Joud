import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export default function SettingsScreen() {
  const { identity } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: identity.palette.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: identity.palette.primary }]}>
        <Text style={[styles.headerTitle, { color: identity.text.onPrimary }]}>Réglages</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.placeholder, { color: identity.text.secondary }]}>
          Cette section est en cours de développement.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
  },
  headerTitle: {
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
  },
  placeholder: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium,
  },
});
