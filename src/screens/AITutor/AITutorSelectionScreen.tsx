/**
 * ============================================
 * AI TUTOR SELECTION SCREEN
 * Choix entre Chat libre et Mode guidé
 * White Label + Moods + 100% français
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

// ============================================
// CONFIG
// ============================================

const MODES = [
  {
    key:         'free',
    route:       '/ai-tutor/free',
    emoji:       '💬',
    title:       'Chat libre',
    description: "Pose n'importe quelle question sur l'anglais, obtiens une réponse instantanée de l'IA.",
    features: [
      'Questions en français ou en anglais',
      'Explications adaptées à ton niveau',
      'Accès au contenu Joud Academy',
    ],
  },
  {
    key:         'guided',
    route:       '/ai-tutor/guided',
    emoji:       '🎯',
    title:       'Mode guidé',
    description: "L'IA analyse tes dernières erreurs d'exercice et te suggère des pistes pour progresser.",
    features: [
      'Analyse automatique de tes points faibles',
      'Suggestions personnalisées par module',
      'Suivi de ta progression',
    ],
  },
];

// ============================================
// COMPOSANT
// ============================================

const AITutorSelectionScreen: React.FC = () => {
  const router     = useRouter();
  const { identity } = useTheme();
  const isPlayful  = identity.ui.mood === 'playful';

  // =================== STYLES ===================

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: identity.palette.background,
        },

        // --- Header coloré (même pattern que GuidedScreen) ---
        header: {
          backgroundColor:   identity.palette.primary,
          paddingTop:        tokens.spacing.md,
          paddingBottom:     tokens.spacing.xl,
          paddingHorizontal: tokens.spacing.xl,
        },
        headerTopRow: {
          flexDirection: 'row',
          alignItems:    'center',
          marginBottom:  tokens.spacing.sm,
        },
        headerTitle: {
          flex:       1,
          fontSize:   tokens.fontSize.xl,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.text.onPrimary,
          textAlign:  isPlayful ? 'center' : 'left',
        },
        headerEmoji: {
          fontSize: tokens.emojiSize.md,
        },
        headerSubtitle: {
          fontSize:   tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color:      withOpacity(identity.text.onPrimary, 0.7),
          textAlign:  isPlayful ? 'center' : 'left',
        },

        // --- Content ---
        content: {
          flex:              1,
          paddingHorizontal: tokens.spacing.xl,
          paddingTop:        tokens.spacing.lg,
        },

        // --- Carte de mode ---
        modeCard: {
          padding:       tokens.spacing.lg,
          borderRadius:  isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
          backgroundColor: identity.palette.surface,
          borderWidth:   1,
          borderColor:   withOpacity(identity.palette.primary, 0.15),
          marginBottom:  tokens.spacing.lg,
        },

        // En-tête de la carte
        modeCardHeader: {
          flexDirection: 'row',
          alignItems:    'center',
          gap:           tokens.spacing.md,
          marginBottom:  tokens.spacing.sm,
        },
        modeEmojiBg: {
          width:  52,
          height: 52,
          borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
          backgroundColor: withOpacity(identity.palette.primary, 0.08),
          alignItems:     'center',
          justifyContent: 'center',
        },
        modeEmoji: {
          fontSize: tokens.emojiSize.lg,
        },
        modeCardTitles: {
          flex: 1,
        },
        modeTitle: {
          fontSize:   tokens.fontSize.lg,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.text.primary,
        },
        modeSubtitle: {
          fontSize:   tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.semibold,
          color:      identity.palette.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },

        // Description
        modeDescription: {
          fontSize:   tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color:      identity.text.secondary,
          lineHeight: tokens.fontSize.sm * 1.6,
          marginBottom: tokens.spacing.md,
        },

        // Features checklist
        featureRow: {
          flexDirection: 'row',
          alignItems:    'center',
          gap:           tokens.spacing.sm,
          marginBottom:  tokens.spacing.sm,
        },
        featureCheck: {
          width:  20,
          height: 20,
          borderRadius: tokens.borderRadius.round,
          backgroundColor: withOpacity(identity.palette.primary, 0.1),
          alignItems:     'center',
          justifyContent: 'center',
        },
        featureText: {
          flex:       1,
          fontSize:   tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color:      identity.text.primary,
        },

        // Bouton "Démarrer"
        modeButton: {
          flexDirection:  'row',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            tokens.spacing.sm,
          paddingVertical: tokens.spacing.md,
          marginTop:      tokens.spacing.md,
          borderRadius:   isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
          backgroundColor: identity.palette.primary,
        },
        modeButtonText: {
          fontSize:   tokens.fontSize.base,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.text.onPrimary,
        },
      }),
    [identity, isPlayful]
  );

  // =================== RENDER ===================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tuteur IA</Text>
          <Text style={styles.headerEmoji}>🤖</Text>
        </View>
        <Text style={styles.headerSubtitle}>Choisis ton mode d'apprentissage</Text>
      </View>

      {/* Cartes de mode */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {MODES.map((mode) => (
          <View key={mode.key} style={styles.modeCard}>
            {/* En-tête */}
            <View style={styles.modeCardHeader}>
              <View style={styles.modeEmojiBg}>
                <Text style={styles.modeEmoji}>{mode.emoji}</Text>
              </View>
              <View style={styles.modeCardTitles}>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeSubtitle}>Mode {mode.key === 'free' ? 'libre' : 'guidé'}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.modeDescription}>{mode.description}</Text>

            {/* Features */}
            {mode.features.map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureCheck}>
                  <Ionicons name="checkmark" size={12} color={identity.palette.primary} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}

            {/* Bouton démarrer */}
            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => router.push(mode.route as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.modeButtonText}>Démarrer</Text>
              <Ionicons name="arrow-forward" size={18} color={identity.text.onPrimary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AITutorSelectionScreen;
