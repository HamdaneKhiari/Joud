// ============================================
// ReadingExerciseScreen.tsx - Version cohérente
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReadingCard from '../../components/pedagogy/reading/ReadingCard';
import { useReadingState } from './hooks/useReadingState';
import { useReadingHandlers } from './hooks/useReadingHandlers';

// ============================================
// TYPES
// ============================================

interface ReadingExerciseParams {
  familyId: number;
  title?: string;
  moduleColor?: string;
  levelId?: number;
}

// Structure attendue dans la DB (colonne data)
interface ReadingQuestionData {
  passage: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  audio_url?: string;
  hint?: string;
}

const MAX_ATTEMPTS = 2;

// ============================================
// COMPONENT
// ============================================

const ReadingExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db, user } = useUser();
  const navigation = useNavigation();
  const route = useRoute();

  const params = route.params as ReadingExerciseParams;
  const familyId = params?.familyId;
  const moduleColor = params?.moduleColor || identity.branding.main;
  const title = params?.title || 'Reading';
  const levelId = params?.levelId || 1;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ReadingQuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = useReadingState();

  // ============================================
  // CHARGEMENT DES QUESTIONS
  // ============================================

  useEffect(() => {
    const loadContent = async () => {
      if (!db || !familyId) return;

      try {
        setLoading(true);
        const result = await db.getAllAsync<{ data: string | ReadingQuestionData }>(
          `SELECT * FROM content WHERE family_id = ?`,
          [familyId]
        );

        if (result && result.length > 0) {
          // Parse le JSON si nécessaire
          const parsed = result.map((item) => {
            const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
            
            // ✅ Validation de la structure (évite les erreurs)
            if (!data.passage || !data.question_text || !data.options) {
              console.warn('Invalid question data:', data);
              return null;
            }
            
            return data as ReadingQuestionData;
          }).filter(Boolean) as ReadingQuestionData[];

          if (parsed.length === 0) {
            Alert.alert('Erreur', 'Aucune question valide trouvée');
            navigation.goBack();
            return;
          }

          setQuestions(parsed);
        } else {
          Alert.alert('Erreur', 'Aucun contenu trouvé');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Reading load error:', error);
        Alert.alert('Erreur', 'Impossible de charger les questions');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [db, familyId, navigation]);

  // ============================================
  // SAUVEGARDE DE LA PROGRESSION
  // ============================================

  const handleNavigateBack = useCallback(() => {
    if (db && familyId && user) {
      db.runAsync(
        `INSERT OR REPLACE INTO progress (user_id, family_id, level, completed, score, last_accessed) 
         VALUES (?, ?, ?, 1, 100, ?)`,
        [user.id, familyId, levelId, new Date().toISOString()]
      ).catch((e) => console.error('Save progress error:', e));
    }

    Alert.alert('Terminé !', 'Vous avez complété la lecture.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  }, [db, familyId, user, levelId, navigation]);

  // ============================================
  // HANDLERS
  // ============================================

  const handlers = useReadingHandlers({
    questions,
    currentIndex,
    setCurrentIndex,
    state,
    onFinish: handleNavigateBack,
  });

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.branding.surface }]}>
        <ActivityIndicator size="large" color={moduleColor} />
        <Text style={[styles.loadingText, { color: identity.text.secondary }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  // ============================================
  // SAFETY CHECK
  // ============================================

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.branding.surface }]}>
        <Text style={[styles.errorText, { color: identity.text.primary }]}>
          Aucune question disponible
        </Text>
      </View>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: identity.branding.surface }]}>
      {/* Header White Label */}
      <View style={[styles.header, { borderBottomColor: withOpacity(identity.text.tertiary, 0.1) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={identity.text.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: identity.text.primary }]}>
          {title} ({currentIndex + 1}/{questions.length})
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Carte de lecture */}
      <ReadingCard
        question={currentQuestion}
        selectedOption={state.selectedOption}
        isValidated={state.isValidated}
        isCorrect={state.isCorrect}
        attemptCount={state.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        isPlaying={state.isPlaying}
        onPlayAudio={handlers.onPlayAudio}
        onAnswer={handlers.onAnswer}
        onValidate={handlers.onValidate}
        onNext={handlers.onNext}
        onRetry={handlers.onRetry}
        isLastQuestion={currentIndex === questions.length - 1}
        color={moduleColor}
      />
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  loadingText: {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium,
  },
  errorText: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.semibold,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.layout.screenPadding,
    height: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
  },
});

export default ReadingExerciseScreen;