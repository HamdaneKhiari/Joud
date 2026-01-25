/**
 * ============================================
 * FICHIER: src/screens/exercises/Sentences/SentenceExerciseScreen.tsx
 * Moteur de Traduction Active avec Auto-Correction Bienveillante
 * ✅ 100% White Label & TypeScript Compliant
 * ============================================
 */

import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';

// Moteurs & Hooks
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseContent, SentenceData } from '@/hooks/exercises/useExerciseContent';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import useSafeNavigation from '@/hooks/useSafeNavigation';

// UI Components
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import SentenceCard from '../../components/pedagogy/Sentence/SentenceCard';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { ValidationState, FeedbackData } from '@/components/common/ExerciseValidation/types';

const EXERCISE_TYPE = 'sentences';

const SentenceExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const route = useRoute();
  
  // 1. Navigation sécurisée (Utilise le goBack par défaut du hook)
  const safeGoBack = useSafeNavigation();
  
  // Paramètres de route
  const { familyId, levelId } = route.params as { familyId: string; levelId: number };

  // 2. Chargement du contenu
  const { module, family, contentItems, isLoading } = useExerciseContent<SentenceData>(familyId, levelId);

  // 3. États de l'exercice
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [userDraft, setUserDraft] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>('initial');
  const [customFeedback, setCustomFeedback] = useState<FeedbackData | null>(null);

  const currentItem = contentItems[currentIndex];
  
  // Correction erreur Module.color : on utilise l'identité branding main
  const moduleColor = identity.branding.main;

  // 4. Suivi de l'activité
  useExerciseActivity({
    moduleSlug: EXERCISE_TYPE,
    familyId,
    levelId,
    familyName: family?.name || '',
    icon: module?.icon || 'message-text',
    currentIndex,
    totalItems: contentItems.length,
    enabled: !isLoading && !!currentItem
  });

  // 5. Sauvegarde auto (Appel sans arguments selon ton hook)
  useExerciseSaveOnUnmount();

  // --- LOGIQUE DE VALIDATION ---

  const handleValidate = () => {
    const cleanUser = userDraft.trim().toLowerCase().replace(/[.,!?;]/g, "");
    const cleanTarget = currentItem.data.phrase_en.trim().toLowerCase().replace(/[.,!?;]/g, "");

    setIsRevealed(true);

    if (cleanUser === cleanTarget) {
      setValidationState('correct');
      setCustomFeedback({
        title: "EXACT !",
        message: "Ta traduction est parfaitement fidèle à la structure."
      });
    } else {
      setValidationState('incorrect'); // Déclenche l'état Orange (Attention/Nuance)
      setCustomFeedback({
        title: "OBSERVE LA NUANCE",
        message: "Ton sens est peut-être bon, mais compare bien avec la structure attendue."
      });
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < contentItems.length - 1) {
      setIsRevealed(false);
      setUserDraft('');
      setValidationState('initial');
      setCustomFeedback(null);
      setCurrentIndex(prev => prev + 1);
    } else {
      safeGoBack.navigate();
    }
  }, [currentIndex, contentItems.length, safeGoBack]);

  const handleRetry = () => {
    setIsRevealed(false);
    setValidationState('initial');
    setCustomFeedback(null);
  };

  if (isLoading || !currentItem || !family) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={identity.branding.main} />
      </View>
    );
  }

  return (
    <ExerciseLayout
      headerProps={{
        variant: "exercise",
        onBack: safeGoBack.navigate, // Branchement direct sur le hook
        rightIcon: <DynamicIcon name={module?.icon} size={28} color={identity.branding.headerAccent} fallback="message-text" />,
        showLevelBadge: true,
        levelTitle: `Niveau ${levelId}`,
        exerciseTitle: family.name,
      }}
      progressProps={{
        progressPercent: Math.round(((currentIndex + 1) / contentItems.length) * 100),
        progressText: `Phrase ${currentIndex + 1} sur ${contentItems.length}`,
      }}
      footer={
        <ExerciseValidation
          state={validationState}
          onValidate={handleValidate}
          onNext={handleNext}
          onRetry={handleRetry}
          feedbackMessage={customFeedback || undefined}
          showFeedback={isRevealed}
          isLastQuestion={currentIndex === contentItems.length - 1}
          disabled={userDraft.trim().length < 2 || safeGoBack.disabled}
        />
      }
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <SentenceCard
          data={currentItem.data}
          isRevealed={isRevealed}
          userDraft={userDraft}
          setUserDraft={setUserDraft}
          moduleColor={moduleColor}
        />
      </KeyboardAvoidingView>
    </ExerciseLayout>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default SentenceExerciseScreen;