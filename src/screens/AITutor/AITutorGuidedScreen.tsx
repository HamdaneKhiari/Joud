/**
 * ============================================
 * AI TUTOR GUIDED SCREEN
 * Coach IA — Orchestrateur
 * ============================================
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '@/themes/ThemeContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import { tokens } from '@/themes/tokens';
import { useErrorAnalysis, ErrorsByModule, MODULE_LABELS } from './hooks/useStudentAnalysis';
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

  const { errorsByModule, totalErrors, isLoading }     = useErrorAnalysis();
  const { recentWords,  isLoading: isVocabLoading }   = useVocabularyExposure();

  const [selectedModule,   setSelectedModule]   = useState<ErrorsByModule | null>(null);
  const [isAILoading,      setIsAILoading]      = useState(false);
  const [aiResponse,       setAIResponse]       = useState<string | null>(null);
  const [isVocabAILoading, setIsVocabAILoading] = useState(false);
  const [vocabAIResponse,  setVocabAIResponse]  = useState<string | null>(null);

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

  const buildVocabAIPrompt = useCallback((): string => {
    const wordList = recentWords
      .map(w => `${w.word} (${w.translation})`)
      .join(', ');

    return (
      `Voici les ${recentWords.length} derniers mots que j'ai vus en exercice : ${wordList}.\n\n` +
      `Aide-moi à les pratiquer ! Propose-moi une phrase à construire avec l'un de ces mots, puis on enchaîne.\n` +
      `Commence par un mot qui semble plus difficile.\n\n` +
      `(Recommandation : pratiquer le vocabulaire toutes les 3 jours)`
    );
  }, [recentWords]);

  const handlePracticeVocab = useCallback(async () => {
    setIsVocabAILoading(true);
    setVocabAIResponse(null);

    try {
      const response = await aiService.sendMessage({
        message: buildVocabAIPrompt(),
        context: 'coach_guided',
        level:   currentLevel,
      });
      setVocabAIResponse(response.content);
    } catch {
      setVocabAIResponse("Une erreur est survenue lors de la consultation de l'IA.");
    } finally {
      setIsVocabAILoading(false);
    }
  }, [buildVocabAIPrompt, currentLevel]);

  // =================== LOADING ===================

  if (isLoading || isVocabLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <GuidedHeader onBack={() => router.back()} />
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
        moduleCount={errorsByModule.length}
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
              {errorsByModule.map((module) => (
                <ErrorModuleCard
                  key={module.moduleSlug}
                  module={module}
                  onPress={() => setSelectedModule(module)}
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
