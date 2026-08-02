/**
 * Settings — Réglages de l'application
 * Profil, audience, préférences sons/vibrations, IA, reset progression, à propos
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, Switch, Pressable,
  Alert, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import { usePreferences } from '@/hooks/usePreferences';
import { tokens, withOpacity } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

// ============================================
// TYPES
// ============================================

const AUDIENCES = [
  { key: 'primary', label: 'Primaire', icon: '🎒' },
  { key: 'college', label: 'Collège', icon: '📘' },
  { key: 'lycee', label: 'Lycée', icon: '🎓' },
  { key: 'adult', label: 'Adulte', icon: '💼' },
] as const;

const APP_VERSION = '1.0.0';

// ============================================
// COMPOSANTS HELPERS
// ============================================

const Section: React.FC<{ title: string; children: React.ReactNode; identity: Identity }> = ({
  title, children, identity
}) => (
  <View style={sectionStyles.container}>
    <Text style={[sectionStyles.title, { color: identity.text.secondary }]}>{title}</Text>
    <View style={[sectionStyles.card, { backgroundColor: identity.palette.surface }]}>
      {children}
    </View>
  </View>
);

const sectionStyles = StyleSheet.create({
  container: { marginBottom: tokens.spacing.xl },
  title: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.xs,
  },
  card: {
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
  },
});

interface RowProps {
  icon: string;
  label: string;
  sublabel?: string;
  identity: Identity;
  right?: React.ReactNode;
  onPress?: () => void;
  separator?: boolean;
  destructive?: boolean;
}

const Row: React.FC<RowProps> = ({
  icon, label, sublabel, identity, right, onPress, separator = true, destructive = false
}) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={({ pressed }) => [rowStyles.row, pressed && onPress && rowStyles.rowPressed]}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
  >
    <View style={[rowStyles.iconBg, { backgroundColor: withOpacity(identity.palette.primary, 0.1) }]}>
      <Text style={rowStyles.icon}>{icon}</Text>
    </View>
    <View style={rowStyles.labelContainer}>
      <Text style={[rowStyles.label, destructive && { color: '#E74C3C' }, !destructive && { color: identity.text.primary }]}>
        {label}
      </Text>
      {sublabel ? (
        <Text style={[rowStyles.sublabel, { color: identity.text.secondary }]}>{sublabel}</Text>
      ) : null}
    </View>
    {right ?? (onPress ? <Text style={[rowStyles.chevron, { color: identity.text.tertiary }]}>›</Text> : null)}
    {separator && <View style={[rowStyles.separator, { backgroundColor: withOpacity(identity.text.primary, 0.06) }]} />}
  </Pressable>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
    minHeight: tokens.layout.touchTarget + 8,
  },
  rowPressed: { opacity: 0.6 },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.md,
  },
  icon: { fontSize: tokens.emojiSize.sm },
  labelContainer: { flex: 1 },
  label: { fontSize: tokens.fontSize.base, fontWeight: tokens.fontWeight.semibold },
  sublabel: { fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.regular, marginTop: 2 },
  chevron: { fontSize: tokens.fontSize.xxl, fontWeight: tokens.fontWeight.medium },
  separator: {
    position: 'absolute',
    bottom: 0,
    left: 56 + tokens.spacing.md,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});

// ============================================
// ÉCRAN PRINCIPAL
// ============================================

export default function SettingsScreen() {
  const { identity } = useTheme();
  const { user, updateUser } = useUser();
  const { resetProgress } = useProgress();
  const { prefs, updatePref } = usePreferences();
  const router = useRouter();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.firstName ?? '');
  const nameInputRef = useRef<TextInput>(null);

  // Initiales avatar
  const initials = (user?.firstName ?? '').trim().slice(0, 2).toUpperCase() || '??';
  const audienceLabel = AUDIENCES.find(a => a.key === user?.audience)?.label ?? '';

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) updateUser({ firstName: trimmed });
    setEditingName(false);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Réinitialiser la progression',
      'Toute ta progression sera effacée définitivement. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => { await resetProgress(); },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: identity.palette.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: identity.palette.primary }]}>
        <Text style={[styles.headerTitle, { color: identity.text.onPrimary }]}>Réglages</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte profil */}
        <View style={[styles.profileCard, { backgroundColor: identity.palette.surface }]}>
          <Pressable
            style={[styles.avatar, { backgroundColor: identity.palette.primary }]}
            onPress={() => {
              setEditingName(true);
              setTimeout(() => nameInputRef.current?.focus(), 100);
            }}
            accessibilityRole="button"
            accessibilityLabel="Modifier le prénom"
          >
            <Text style={[styles.avatarText, { color: identity.text.onPrimary }]}>{initials}</Text>
          </Pressable>
          <View style={styles.profileInfo}>
            {editingName ? (
              <TextInput
                ref={nameInputRef}
                value={nameInput}
                onChangeText={setNameInput}
                onBlur={saveName}
                onSubmitEditing={saveName}
                returnKeyType="done"
                style={[styles.nameInput, { color: identity.text.primary, borderColor: identity.palette.primary }]}
                autoCapitalize="words"
                maxLength={24}
              />
            ) : (
              <Pressable
                onPress={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 100); }}
                accessibilityRole="button"
                accessibilityLabel="Modifier le prénom"
              >
                <Text style={[styles.profileName, { color: identity.text.primary }]}>
                  {user?.firstName || 'Mon profil'}
                </Text>
              </Pressable>
            )}
            <Text style={[styles.profileAudience, { color: identity.text.secondary }]}>{audienceLabel}</Text>
          </View>
        </View>

        {/* Section Préférences */}
        <Section title="Préférences" identity={identity}>
          <Row
            icon="📳"
            label="Vibrations"
            sublabel="Retour haptique"
            identity={identity}
            separator={false}
            right={
              <Switch
                value={prefs.hapticsEnabled}
                onValueChange={(v) => updatePref('hapticsEnabled', v)}
                trackColor={{ false: withOpacity(identity.text.primary, 0.15), true: identity.palette.primary }}
                thumbColor={Platform.OS === 'android' ? identity.palette.primary : undefined}
                accessibilityLabel="Vibrations"
              />
            }
          />
        </Section>

        {/* Section Intelligence Artificielle — réservée à collège/lycée/adulte (BYOK, envoie
            les messages à un provider tiers), jamais au public primaire (enfants) */}
        {user?.audience !== 'primary' && (
          <Section title="Intelligence artificielle" identity={identity}>
            <Row
              icon="🤖"
              label="Configuration IA"
              sublabel="Clés API, modèles et limites"
              identity={identity}
              separator={false}
              onPress={() => router.push('/settings-ai' as Href)}
            />
          </Section>
        )}

        {/* Section Données */}
        <Section title="Données" identity={identity}>
          <Row
            icon="🗑️"
            label="Réinitialiser la progression"
            sublabel="Effacer tout l'historique d'exercices"
            identity={identity}
            separator={false}
            destructive
            onPress={handleResetProgress}
          />
        </Section>

        {/* À propos */}
        <Section title="À propos" identity={identity}>
          <Row
            icon="ℹ️"
            label="Joud"
            sublabel={`Version ${APP_VERSION}`}
            identity={identity}
            separator={false}
          />
        </Section>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES GLOBAUX
// ============================================

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.xl,
  },
  headerTitle: {
    fontSize: tokens.fontSize.xxl,
    fontWeight: tokens.fontWeight.black,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
  },

  // Profil
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.black,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    marginBottom: 2,
  },
  profileAudience: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
  },
  nameInput: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    borderBottomWidth: 2,
    paddingBottom: 2,
    marginBottom: 2,
  },

  bottomPadding: { height: tokens.spacing.xxxl },
});
