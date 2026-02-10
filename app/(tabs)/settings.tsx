import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { tokens, withOpacity } from '@/themes/tokens';

const AUDIENCES = [
  { key: 'primary', label: 'Primaire', icon: '🎒' },
  { key: 'college', label: 'Collège', icon: '📘' },
  { key: 'lycee', label: 'Lycée', icon: '🎓' },
  { key: 'adult', label: 'Adulte', icon: '💼' },
] as const;

export default function SettingsScreen() {
  const { identity } = useTheme();
  const { user, updateAudience } = useUser();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: identity.palette.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: identity.palette.primary }]}>
        <Text style={[styles.headerTitle, { color: identity.text.onPrimary }]}>Réglages</Text>
      </View>
      <View style={styles.content}>
        {/* Section Version */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: identity.text.secondary }]}>
            VERSION DE L'APP
          </Text>
          <View style={styles.audienceRow}>
            {AUDIENCES.map((aud) => {
              const isActive = user?.audience === aud.key;
              return (
                <TouchableOpacity
                  key={aud.key}
                  style={[
                    styles.audienceChip,
                    { backgroundColor: identity.palette.surface },
                    isActive && { backgroundColor: identity.palette.primary },
                  ]}
                  onPress={() => updateAudience(aud.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.audienceChipIcon}>{aud.icon}</Text>
                  <Text style={[
                    styles.audienceChipLabel,
                    { color: identity.text.primary },
                    isActive && { color: identity.text.onPrimary },
                  ]}>
                    {aud.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section IA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: identity.text.secondary }]}>
            INTELLIGENCE ARTIFICIELLE
          </Text>

          <TouchableOpacity
            style={[styles.settingCard, { backgroundColor: identity.palette.surface }]}
            onPress={() => router.push('/settings-ai' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBg, { backgroundColor: withOpacity(identity.palette.primary, 0.1) }]}>
              <Text style={styles.iconEmoji}>🤖</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: identity.text.primary }]}>
                Configuration IA
              </Text>
              <Text style={[styles.settingSubtitle, { color: identity.text.secondary }]}>
                Clés API, modèles et limites
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={identity.text.tertiary} />
          </TouchableOpacity>
        </View>
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
  section: {
    marginBottom: tokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.spacing.md,
    letterSpacing: 0.5,
  },
  audienceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.round,
    gap: tokens.spacing.xs,
  },
  audienceChipIcon: {
    fontSize: tokens.emojiSize.sm,
  },
  audienceChipLabel: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.bold,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    gap: tokens.spacing.md,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: tokens.emojiSize.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.spacing.xs,
  },
  settingSubtitle: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
  },
});
