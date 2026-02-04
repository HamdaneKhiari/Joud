/**
 * ============================================
 * AI TUTOR GUIDED SCREEN
 * Coach IA — Analyse des erreurs & suggestions
 * White Label + Moods + 100% français
 * ============================================
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { useErrorAnalysis, ErrorsByModule, MODULE_LABELS } from './hooks/useStudentAnalysis';

// Couleur sémantique "correct" — universelle, indépendante du white label
const SUCCESS_COLOR = '#16A34A';
import aiService from '@/services/ai/aiService';

// ============================================
// HELPERS
// ============================================

const formatRelativeTime = (timestamp: number): string => {
  const diff    = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1)  return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
};

// ============================================
// COMPOSANT
// ============================================

const AITutorGuidedScreen: React.FC = () => {
  const router        = useRouter();
  const { identity }  = useTheme();
  const { currentLevel } = useCurrentLevel();
  const { errorsByModule, totalErrors, isLoading } = useErrorAnalysis();

  const [selectedModule, setSelectedModule] = useState<ErrorsByModule | null>(null);
  const [isAILoading,    setIsAILoading]    = useState(false);
  const [aiResponse,     setAIResponse]     = useState<string | null>(null);

  const isPlayful = identity.ui.mood === 'playful';

  // =================== STYLES ===================

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: identity.palette.background,
        },

        // --- Header coloré ---
        header: {
          backgroundColor: identity.palette.primary,
          paddingTop:       tokens.spacing.md,
          paddingBottom:    tokens.spacing.xl,
          paddingHorizontal: tokens.spacing.xl,
        },
        headerTopRow: {
          flexDirection: 'row',
          alignItems:    'center',
          marginBottom:  tokens.spacing.lg,
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

        // --- Pill résumé (dans le header) ---
        summaryPill: {
          flexDirection:  'row',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            tokens.spacing.lg,
          backgroundColor: withOpacity(identity.text.onPrimary, 0.15),
          borderRadius:   tokens.borderRadius.round,
          paddingHorizontal: tokens.spacing.xl,
          paddingVertical:   tokens.spacing.sm,
          alignSelf: isPlayful ? 'center' : 'flex-start',
        },
        summaryItem: {
          alignItems: 'center',
          gap:        tokens.spacing.xs,
        },
        summaryNumber: {
          fontSize:   tokens.fontSize.xxl,
          fontWeight: tokens.fontWeight.black,
          color:      identity.text.onPrimary,
        },
        summaryLabel: {
          fontSize:      tokens.fontSize.xs,
          fontWeight:    tokens.fontWeight.semibold,
          color:         withOpacity(identity.text.onPrimary, 0.7),
          textTransform: 'uppercase',
        },
        summaryDivider: {
          width:           1,
          height:          28,
          backgroundColor: withOpacity(identity.text.onPrimary, 0.25),
        },

        // --- Content scrollable ---
        content: {
          flex:              1,
          paddingHorizontal: tokens.spacing.xl,
          paddingTop:        tokens.spacing.lg,
        },
        sectionTitle: {
          fontSize:   tokens.fontSize.lg,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.text.primary,
          marginBottom: tokens.spacing.md,
        },

        // --- Carte module (liste principale) ---
        moduleCard: {
          flexDirection: 'row',
          alignItems:    'center',
          gap:           tokens.spacing.md,
          padding:       tokens.spacing.lg,
          borderRadius:  isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
          backgroundColor: identity.palette.surface,
          borderWidth:  1,
          borderColor:  withOpacity(identity.palette.primary, 0.15),
          marginBottom: tokens.spacing.md,
        },
        moduleEmojiBg: {
          width:  48,
          height: 48,
          borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
          backgroundColor: withOpacity(identity.palette.primary, 0.08),
          alignItems:     'center',
          justifyContent: 'center',
        },
        moduleEmoji: {
          fontSize: tokens.emojiSize.md,
        },
        moduleInfo: {
          flex: 1,
        },
        moduleTitle: {
          fontSize:     tokens.fontSize.base,
          fontWeight:   tokens.fontWeight.bold,
          color:        identity.text.primary,
          marginBottom: tokens.spacing.xs,
        },
        moduleSubtitle: {
          fontSize:   tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color:      identity.text.secondary,
        },
        moduleBadge: {
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical:   tokens.spacing.xs,
          borderRadius:      tokens.borderRadius.round,
          backgroundColor:   withOpacity(identity.palette.accent, 0.15),
        },
        moduleBadgeText: {
          fontSize:   tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.palette.accent,
        },

        // --- Empty state ---
        emptyContainer: {
          flex:              1,
          alignItems:        'center',
          justifyContent:    'center',
          paddingHorizontal: tokens.spacing.xl,
          paddingTop:        tokens.spacing.xxxl,
        },
        emptyEmoji: {
          fontSize:     tokens.emojiSize.huge,
          marginBottom: tokens.spacing.lg,
        },
        emptyTitle: {
          fontSize:   tokens.fontSize.xl,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.text.primary,
          textAlign:  'center',
          marginBottom: tokens.spacing.sm,
        },
        emptyText: {
          fontSize:   tokens.fontSize.base,
          fontWeight: tokens.fontWeight.medium,
          color:      identity.text.secondary,
          textAlign:  'center',
          lineHeight: tokens.fontSize.base * 1.6,
        },

        // --- Détail : en-tête du module ---
        detailHeader: {
          flexDirection: 'row',
          alignItems:    'center',
          gap:           tokens.spacing.md,
          marginBottom:  tokens.spacing.lg,
        },
        detailTitle: {
          fontSize:   tokens.fontSize.xl,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.text.primary,
        },
        detailCount: {
          fontSize:   tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.semibold,
          color:      identity.palette.accent,
          backgroundColor: withOpacity(identity.palette.accent, 0.15),
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical:   tokens.spacing.xs,
          borderRadius:      tokens.borderRadius.round,
        },

        // --- Carte erreur individuelle ---
        errorCard: {
          padding:       tokens.spacing.md,
          borderRadius:  isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
          backgroundColor: identity.palette.surface,
          borderWidth:   1,
          borderColor:   withOpacity(identity.aiDiagnostic.error, 0.3),
          marginBottom:  tokens.spacing.sm,
        },
        errorQuestion: {
          fontSize:     tokens.fontSize.sm,
          fontWeight:   tokens.fontWeight.bold,
          color:        identity.text.primary,
          marginBottom: tokens.spacing.sm,
        },
        errorRow: {
          flexDirection: 'row',
          gap:           tokens.spacing.sm,
          marginBottom:  tokens.spacing.xs,
        },
        errorLabel: {
          fontSize:   tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.bold,
          width:      56,
        },
        errorLabelToi:     { color: identity.aiDiagnostic.error },
        errorLabelCorrect: { color: SUCCESS_COLOR },
        errorValue: {
          flex:       1,
          fontSize:   tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.medium,
        },
        errorValueToi:     { color: identity.aiDiagnostic.error },
        errorValueCorrect: { color: SUCCESS_COLOR },
        errorTime: {
          fontSize:   tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.medium,
          color:      identity.text.tertiary,
          marginTop:  tokens.spacing.xs,
        },

        // --- Bouton "Consulter l'IA" ---
        aiButtonContainer: {
          marginTop:    tokens.spacing.lg,
          marginBottom: tokens.spacing.xl,
        },
        aiButton: {
          flexDirection:  'row',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            tokens.spacing.sm,
          paddingVertical: tokens.spacing.md,
          borderRadius:   isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
          backgroundColor: identity.palette.primary,
        },
        aiButtonText: {
          fontSize:   tokens.fontSize.base,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.text.onPrimary,
        },

        // --- Carte réponse IA ---
        aiResponseCard: {
          padding:       tokens.spacing.lg,
          borderRadius:  isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
          backgroundColor: withOpacity(identity.palette.primary, 0.05),
          borderWidth:   1,
          borderColor:   withOpacity(identity.palette.primary, 0.2),
          marginTop:     tokens.spacing.md,
        },
        aiResponseBadge: {
          flexDirection: 'row',
          alignItems:    'center',
          gap:           tokens.spacing.xs,
          marginBottom:  tokens.spacing.sm,
        },
        aiResponseBadgeText: {
          fontSize:   tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.bold,
          color:      identity.palette.primary,
        },
        aiResponseText: {
          fontSize:   tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color:      identity.text.primary,
          lineHeight: tokens.fontSize.sm * 1.6,
        },
      }),
    [identity, isPlayful]
  );

  // =================== HANDLERS ===================

  const handleGoBack = useCallback(() => {
    if (selectedModule) {
      setSelectedModule(null);
      setAIResponse(null);
    } else {
      router.back();
    }
  }, [selectedModule, router]);

  const buildAIPrompt = useCallback((module: ErrorsByModule): string => {
    const moduleLabel = MODULE_LABELS[module.moduleSlug]?.label || module.moduleSlug;
    const errorDetails = module.errors
      .map(e =>
        `- Question : "${e.question}"\n  Ta réponse : "${e.userAnswer}"\n  Réponse correcte : "${e.correctAnswer}"`
      )
      .join('\n');

    return (
      `Analyse ces ${module.errorCount} erreur(s) en ${moduleLabel} ` +
      `(niveau ${currentLevel}) et suggère des exercices pour m'aider :\n\n${errorDetails}`
    );
  }, [currentLevel]);

  const handleConsultAI = useCallback(async () => {
    if (!selectedModule) return;
    setIsAILoading(true);
    setAIResponse(null);

    try {
      const response = await aiService.sendMessage({
        message: buildAIPrompt(selectedModule),
        context: 'coach_guided',
        level:   currentLevel,
      });
      setAIResponse(response.content);
    } catch {
      setAIResponse("Une erreur est survenue lors de la consultation de l'IA.");
    } finally {
      setIsAILoading(false);
    }
  }, [selectedModule, buildAIPrompt, currentLevel]);

  // =================== LOADING ===================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Coach IA</Text>
            <Text style={styles.headerEmoji}>🤖</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={identity.palette.primary} />
          <Text style={[styles.emptyText, { marginTop: tokens.spacing.md }]}>
            Analyse en cours…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =================== DÉTAIL (module sélectionné) ===================

  if (selectedModule) {
    const meta = MODULE_LABELS[selectedModule.moduleSlug];

    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={handleGoBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Coach IA</Text>
            <Text style={styles.headerEmoji}>🤖</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* En-tête du module */}
          <View style={styles.detailHeader}>
            <Text style={{ fontSize: tokens.emojiSize.lg }}>{meta?.emoji}</Text>
            <Text style={styles.detailTitle}>{meta?.label}</Text>
            <Text style={styles.detailCount}>
              {selectedModule.errorCount} erreur{selectedModule.errorCount > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Liste des erreurs */}
          {selectedModule.errors.map((error, index) => (
            <View key={index} style={styles.errorCard}>
              <Text style={styles.errorQuestion}>{error.question}</Text>
              <View style={styles.errorRow}>
                <Text style={[styles.errorLabel, styles.errorLabelToi]}>Toi :</Text>
                <Text style={[styles.errorValue, styles.errorValueToi]}>{error.userAnswer}</Text>
              </View>
              <View style={styles.errorRow}>
                <Text style={[styles.errorLabel, styles.errorLabelCorrect]}>Correct :</Text>
                <Text style={[styles.errorValue, styles.errorValueCorrect]}>{error.correctAnswer}</Text>
              </View>
              <Text style={styles.errorTime}>{formatRelativeTime(error.timestamp)}</Text>
            </View>
          ))}

          {/* Bouton consulter l'IA */}
          <View style={styles.aiButtonContainer}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={handleConsultAI}
              disabled={isAILoading}
              activeOpacity={0.8}
            >
              {isAILoading ? (
                <ActivityIndicator size="small" color={identity.text.onPrimary} />
              ) : (
                <>
                  <Text style={{ fontSize: 18 }}>🤖</Text>
                  <Text style={styles.aiButtonText}>Consulter l'IA</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Réponse IA */}
            {aiResponse && (
              <View style={styles.aiResponseCard}>
                <View style={styles.aiResponseBadge}>
                  <Text>🤖</Text>
                  <Text style={styles.aiResponseBadgeText}>Analyse IA</Text>
                </View>
                <Text style={styles.aiResponseText}>{aiResponse}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =================== VUE PRINCIPALE (liste des modules) ===================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header avec résumé */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Coach IA</Text>
          <Text style={styles.headerEmoji}>🤖</Text>
        </View>

        {totalErrors > 0 && (
          <View style={styles.summaryPill}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{totalErrors}</Text>
              <Text style={styles.summaryLabel}>Erreurs</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{errorsByModule.length}</Text>
              <Text style={styles.summaryLabel}>Modules</Text>
            </View>
          </View>
        )}
      </View>

      {/* Contenu */}
      {totalErrors === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>Aucune erreur détectée !</Text>
          <Text style={styles.emptyText}>
            Continue comme ça ! Tes derniers exercices sont parfaits.{'\n'}
            Le Coach IA apparaîtra ici dès que tu auras des points à améliorer.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Tes points à améliorer</Text>

          {errorsByModule.map((module) => {
            const meta = MODULE_LABELS[module.moduleSlug];
            return (
              <TouchableOpacity
                key={module.moduleSlug}
                style={styles.moduleCard}
                onPress={() => setSelectedModule(module)}
                activeOpacity={0.85}
              >
                {/* Icône module */}
                <View style={styles.moduleEmojiBg}>
                  <Text style={styles.moduleEmoji}>{meta?.emoji || '📝'}</Text>
                </View>

                {/* Info */}
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{meta?.label || module.moduleSlug}</Text>
                  <Text style={styles.moduleSubtitle}>
                    Dernière erreur : {formatRelativeTime(module.lastErrorDate)}
                  </Text>
                </View>

                {/* Badge nombre d'erreurs */}
                <View style={styles.moduleBadge}>
                  <Text style={styles.moduleBadgeText}>
                    {module.errorCount} erreur{module.errorCount > 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Chevron */}
                <Ionicons name="chevron-forward" size={20} color={identity.text.secondary} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AITutorGuidedScreen;
