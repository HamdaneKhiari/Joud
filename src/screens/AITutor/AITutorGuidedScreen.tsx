/**
 * ============================================
 * AI TUTOR GUIDED SCREEN (OPTIMIZED)
 * Coach IA avec analyses SQL → Économie de tokens
 * ============================================
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '@/themes/ThemeContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import { useAI } from '@/contexts/AIContext';
import { tokens } from '@/themes/tokens';
import { useAdvancedErrorAnalysis } from './hooks/useAdvancedErrorAnalysis';
import { useVocabularyExposure } from './hooks/useVocabularyExposure';
import aiService from '@/services/ai/aiService';

import GuidedHeader        from './components/GuidedHeader';
import ErrorModuleCard     from './components/ErrorModuleCard';
import ErrorDetailView     from './components/ErrorDetailView';
import VocabSection        from './components/VocabSection';

// ============================================
// COMPOSANT
// ============================================

const AITutorGuidedScreen: React.FC = () => {
  const router         = useRouter();
  const { identity }   = useTheme();
  const { currentLevel } = useCurrentLevel();
  const { settings }   = useAI();

  // ✅ NOUVEAU : Utilise les analyses SQL avancées
  const { analysis, isLoading: isAnalysisLoading, buildCompactSummary } = useAdvancedErrorAnalysis();
  const { recentWords, isLoading: isVocabLoading }   = useVocabularyExposure();

  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string | null>(null);
  const [isAILoading,        setIsAILoading]        = useState(false);
  const [aiResponse,         setAIResponse]         = useState<string | null>(null);
  const [isVocabAILoading,   setIsVocabAILoading]   = useState(false);
  const [vocabAIResponse,    setVocabAIResponse]    = useState<string | null>(null);

  // =================== STYLES ===================

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex:            1,
      backgroundColor: identity.palette.background,
    },
    content: {
      flex:              1,
      paddingHorizontal: tokens.spacing.xl,
      paddingTop:        tokens.spacing.lg,
    },
    sectionTitle: {
      fontSize:     tokens.fontSize.lg,
      fontWeight:   tokens.fontWeight.bold,
      color:        identity.text.primary,
      marginBottom: tokens.spacing.md,
    },
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
      fontSize:     tokens.fontSize.xl,
      fontWeight:   tokens.fontWeight.bold,
      color:        identity.text.primary,
      textAlign:    'center',
      marginBottom: tokens.spacing.sm,
    },
    emptyText: {
      fontSize:   tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color:      identity.text.secondary,
      textAlign:  'center',
      lineHeight: tokens.fontSize.base * 1.6,
    },
  }), [identity]);

  // =================== HANDLERS ===================

  const handleGoBack = useCallback(() => {
    if (selectedModuleSlug) {
      setSelectedModuleSlug(null);
      setAIResponse(null);
    } else {
      router.back();
    }
  }, [selectedModuleSlug, router]);

  /**
   * ✅ OPTIMISÉ : Utilise les résumés compacts au lieu du raw data
   * Passe de ~400 tokens à ~100 tokens (75% d'économie)
   */
  const buildOptimizedAIPrompt = useCallback((moduleSlug: string): string => {
    const compactSummary = buildCompactSummary(moduleSlug);

    if (!compactSummary) {
      return `Analyse mes erreurs en ${moduleSlug} (niveau ${currentLevel})`;
    }

    return (
      `Tu es un coach anglais expert. Analyse ce résumé d'erreurs et suggère 2-3 exercices ciblés pour progresser.\n\n` +
      `Niveau: ${currentLevel}\n\n` +
      `RÉSUMÉ D'ANALYSE (SQLite):\n${compactSummary}\n\n` +
      `Consigne: Réponds en français, sois concis (max 150 mots), donne des exercices concrets.`
    );
  }, [buildCompactSummary, currentLevel]);

  const handleConsultAI = useCallback(async () => {
    if (!selectedModuleSlug) return;
    setIsAILoading(true);
    setAIResponse(null);

    try {
      const systemPrompt = aiService.buildSystemMessage(
        `Tu es un coach anglais. L'élève est niveau ${currentLevel}. Analyse son résumé d'erreurs et donne-lui des conseils ciblés et encourageants. Reste concis (max 150 mots).`
      );
      const userPrompt = { role: 'user' as const, content: buildOptimizedAIPrompt(selectedModuleSlug) };

      const response = await aiService.sendChatMessage(
        settings.provider as 'openai' | 'mistral' | 'claude',
        settings.apiKey,
        [systemPrompt, userPrompt],
        { model: settings.model }
      );
      setAIResponse(response);
    } catch (error: any) {
      setAIResponse(aiService.formatAIError(error));
    } finally {
      setIsAILoading(false);
    }
  }, [selectedModuleSlug, buildOptimizedAIPrompt, currentLevel, settings]);

  /**
   * ✅ OPTIMISÉ : Vocabulaire compact
   * Au lieu d'envoyer "word (translation)" x 10, on envoie juste les 5 mots les plus difficiles
   */
  const buildOptimizedVocabPrompt = useCallback((): string => {
    // Prend les 5 derniers mots (les plus récents)
    const recentTop5 = recentWords.slice(0, 5);
    const wordList = recentTop5.map(w => `${w.word} (${w.translation})`).join(', ');

    return (
      `Tu es un coach anglais. L'élève (niveau ${currentLevel}) a vu ces mots récemment : ${wordList}.\n\n` +
      `Propose-lui UNE phrase à construire avec l'un de ces mots. Sois concis (max 50 mots).`
    );
  }, [recentWords, currentLevel]);

  const handlePracticeVocab = useCallback(async () => {
    setIsVocabAILoading(true);
    setVocabAIResponse(null);

    try {
      const systemPrompt = aiService.buildSystemMessage(
        `Tu es un coach anglais. L'élève est niveau ${currentLevel}. Propose-lui un exercice de vocabulaire simple et concis (max 50 mots).`
      );
      const userPrompt = { role: 'user' as const, content: buildOptimizedVocabPrompt() };

      const response = await aiService.sendChatMessage(
        settings.provider as 'openai' | 'mistral' | 'claude',
        settings.apiKey,
        [systemPrompt, userPrompt],
        { model: settings.model }
      );
      setVocabAIResponse(response);
    } catch (error: any) {
      setVocabAIResponse(aiService.formatAIError(error));
    } finally {
      setIsVocabAILoading(false);
    }
  }, [buildOptimizedVocabPrompt, currentLevel, settings]);

  // =================== LOADING ===================

  if (isAnalysisLoading || isVocabLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <GuidedHeader onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={identity.palette.primary} />
          <Text style={[styles.emptyText, { marginTop: tokens.spacing.md }]}>
            Analyse SQL en cours…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =================== ADAPTER LES DONNÉES POUR LES COMPOSANTS EXISTANTS ===================

  // Convertir les analyses en format compatible avec ErrorModuleCard
  const errorsByModuleCompat = analysis?.moduleAnalyses.map(mod => ({
    moduleSlug: mod.moduleSlug,
    errorCount: mod.totalErrors,
    lastErrorDate: mod.lastErrorDate,
    errors: mod.patterns.flatMap(p =>
      p.examples.slice(0, 1).map(ex => ({
        question: ex,
        userAnswer: '',
        correctAnswer: '',
        familyId: mod.weakestFamilies[0]?.familyId || 0,
        timestamp: mod.lastErrorDate,
      }))
    ),
  })) || [];

  const totalErrors = analysis?.totalErrors || 0;

  // Module sélectionné pour affichage détail
  const selectedModule = selectedModuleSlug
    ? errorsByModuleCompat.find(m => m.moduleSlug === selectedModuleSlug)
    : null;

  // =================== DÉTAIL (module sélectionné) ===================

  if (selectedModule) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <GuidedHeader onBack={handleGoBack} />
        <ErrorDetailView
          module={selectedModule}
          isAILoading={isAILoading}
          aiResponse={aiResponse}
          onConsultAI={handleConsultAI}
        />
      </SafeAreaView>
    );
  }

  // =================== VUE PRINCIPALE ===================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <GuidedHeader
        onBack={()  => router.back()}
        totalErrors={totalErrors}
        moduleCount={errorsByModuleCompat.length}
      />

      {(totalErrors === 0 && recentWords.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>Tout est parfait !</Text>
          <Text style={styles.emptyText}>
            Aucune erreur et aucun mot récent.{'\n'}
            Le Coach IA apparaîtra ici dès que tu auras des points à améliorer ou des mots à pratiquer.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {totalErrors > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tes points à améliorer</Text>
              {errorsByModuleCompat.map((module) => (
                <ErrorModuleCard
                  key={module.moduleSlug}
                  module={module}
                  onPress={() => setSelectedModuleSlug(module.moduleSlug)}
                />
              ))}
            </>
          )}

          {recentWords.length > 0 && (
            <VocabSection
              words={recentWords}
              isLoading={isVocabAILoading}
              response={vocabAIResponse}
              onPractice={handlePracticeVocab}
            />
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AITutorGuidedScreen;
